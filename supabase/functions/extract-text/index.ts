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
    const { fileUrl, fileName, resumeId } = await req.json();

    console.log('Extracting text from:', fileName, 'URL:', fileUrl);

    // Download file from storage
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file from storage');
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const fileType = fileName.split('.').pop()?.toLowerCase();
    
    let extractedText = '';
    let parsedData = {};

    if (fileType === 'pdf') {
      // For PDF files, use OpenAI's vision model to extract text
      const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Extract all text content from this document. Format it cleanly and preserve structure like sections, bullet points, and contact information.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please extract all text from this document:'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:application/pdf;base64,${base64File}`
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        extractedText = aiResponse.choices[0].message.content;
      }
    } else if (fileType === 'txt') {
      // For text files, directly read content
      extractedText = new TextDecoder().decode(fileBuffer);
    } else {
      // For other files, try basic text extraction
      try {
        extractedText = new TextDecoder().decode(fileBuffer);
      } catch (error) {
        extractedText = 'Unable to extract text from this file type';
      }
    }

    // Parse structured data using AI
    if (extractedText) {
      const parsePrompt = `
Extract structured information from this resume text and return a JSON object with the following structure:
{
  "personal_info": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "city, state/country"
  },
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End dates",
      "description": "Job description"
    }
  ],
  "education": [
    {
      "degree": "Degree Type",
      "institution": "University/School Name",
      "year": "Graduation year",
      "gpa": "GPA if available"
    }
  ],
  "certifications": ["certification1", "certification2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["tech1", "tech2"]
    }
  ]
}

Resume text:
${extractedText}
`;

      try {
        const parseResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a resume parser. Respond only with valid JSON.' },
              { role: 'user', content: parsePrompt }
            ],
            temperature: 0.1,
            max_tokens: 2000,
          }),
        });

        if (parseResponse.ok) {
          const parseResult = await parseResponse.json();
          try {
            parsedData = JSON.parse(parseResult.choices[0].message.content);
          } catch (error) {
            console.error('Failed to parse structured data:', error);
            parsedData = { error: 'Failed to parse structured data' };
          }
        }
      } catch (error) {
        console.error('Error parsing structured data:', error);
        parsedData = { error: 'Error during parsing' };
      }
    }

    // Update resume with extracted text and parsed data
    const { error: updateError } = await supabase
      .from('resumes')
      .update({
        extracted_text: extractedText,
        parsed_data: parsedData,
      })
      .eq('id', resumeId);

    if (updateError) {
      throw new Error(`Failed to update resume: ${updateError.message}`);
    }

    console.log('Text extraction completed for resume:', resumeId);

    return new Response(JSON.stringify({
      success: true,
      extracted_text: extractedText,
      parsed_data: parsedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-text function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});