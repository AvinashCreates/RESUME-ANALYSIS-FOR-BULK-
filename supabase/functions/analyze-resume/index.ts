import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { resumeId, jobDescriptionId } = await req.json();

    console.log('Analyzing resume:', resumeId, 'for job:', jobDescriptionId);

    // Get resume and job description data
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resume) {
      throw new Error(`Resume not found: ${resumeError?.message}`);
    }

    const { data: jobDescription, error: jobError } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('id', jobDescriptionId)
      .single();

    if (jobError || !jobDescription) {
      throw new Error(`Job description not found: ${jobError?.message}`);
    }

    console.log('Retrieved data successfully');

    // Analyze with OpenAI
    const analysisPrompt = `
You are an expert recruiter and career advisor. Analyze the following resume against the job description and provide a detailed assessment.

JOB DESCRIPTION:
Title: ${jobDescription.title}
Company: ${jobDescription.company || 'Not specified'}
Experience Level: ${jobDescription.experience_level || 'Not specified'}
Location: ${jobDescription.location || 'Not specified'}
Required Skills: ${jobDescription.required_skills?.join(', ') || 'Not specified'}
Preferred Skills: ${jobDescription.preferred_skills?.join(', ') || 'Not specified'}
Description: ${jobDescription.description}

RESUME CONTENT:
${resume.extracted_text || 'No text content available'}

Please provide a JSON response with the following structure:
{
  "relevance_score": <number 0-100>,
  "verdict": "<High|Medium|Low>",
  "hard_match_score": <number 0-100>,
  "soft_match_score": <number 0-100>,
  "missing_skills": ["skill1", "skill2"],
  "improvement_suggestions": ["suggestion1", "suggestion2"],
  "detailed_analysis": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "experience_match": "explanation",
    "skills_match": "explanation",
    "education_match": "explanation"
  }
}

Scoring criteria:
- Hard Match (40%): Direct keyword matching for skills, certifications, education, job titles
- Soft Match (60%): Semantic understanding, relevant experience, transferable skills
- Relevance Score: Weighted combination of hard and soft match
- Verdict: High (80-100), Medium (50-79), Low (0-49)
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert recruiter. Respond only with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    let analysisResult;

    try {
      analysisResult = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse.choices[0].message.content);
      throw new Error('Failed to parse analysis result from AI');
    }

    console.log('AI analysis completed:', analysisResult);

    // Store analysis result
    const { data: analysis, error: analysisError } = await supabase
      .from('analysis_results')
      .insert({
        resume_id: resumeId,
        job_description_id: jobDescriptionId,
        relevance_score: analysisResult.relevance_score,
        verdict: analysisResult.verdict,
        hard_match_score: analysisResult.hard_match_score,
        soft_match_score: analysisResult.soft_match_score,
        missing_skills: analysisResult.missing_skills,
        improvement_suggestions: analysisResult.improvement_suggestions,
        detailed_analysis: analysisResult.detailed_analysis,
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Failed to store analysis:', analysisError);
      throw new Error(`Failed to store analysis: ${analysisError.message}`);
    }

    console.log('Analysis stored successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});