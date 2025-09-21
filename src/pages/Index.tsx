import React, { useState } from 'react';
import { Brain, Upload, FileText, BarChart3, Users, Clock, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { JobDescriptionForm, JobDescription } from '@/components/JobDescriptionForm';
import { ProgressIndicator, ProcessingStatus } from '@/components/ProgressIndicator';
import { ScoreCard, ResumeScore } from '@/components/ScoreCard';
import heroImage from '@/assets/hero-image.jpg';
import aiAnalysisIcon from '@/assets/ai-analysis-icon.jpg';
import bulkProcessingIcon from '@/assets/bulk-processing-icon.jpg';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ResumeScore[]>([]);

  // Mock processing steps
  const [processingSteps, setProcessingSteps] = useState([
    { id: 'parse-jd', label: 'Parsing Job Description', status: 'pending' as ProcessingStatus },
    { id: 'extract-resumes', label: 'Extracting Resume Content', status: 'pending' as ProcessingStatus },
    { id: 'analyze-skills', label: 'Analyzing Skills & Experience', status: 'pending' as ProcessingStatus },
    { id: 'semantic-matching', label: 'AI Semantic Matching', status: 'pending' as ProcessingStatus },
    { id: 'generate-scores', label: 'Generating Relevance Scores', status: 'pending' as ProcessingStatus },
    { id: 'create-recommendations', label: 'Creating Improvement Suggestions', status: 'pending' as ProcessingStatus }
  ]);

  // Mock data for demonstration
  const mockResults: ResumeScore[] = [
    {
      id: '1',
      candidateName: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      location: 'San Francisco, CA',
      experience: '4 years',
      score: 89,
      verdict: 'High',
      hardMatchScore: 85,
      softMatchScore: 93,
      missingSkills: ['GraphQL', 'Docker'],
      suggestions: ['Add GraphQL experience', 'Include Docker containerization projects'],
      strengths: ['React', 'TypeScript', 'Node.js', 'AWS', 'Team Leadership'],
      processingTime: 1250
    },
    {
      id: '2',
      candidateName: 'Marcus Johnson',
      email: 'marcus.j@email.com',
      location: 'New York, NY',
      experience: '2 years',
      score: 67,
      verdict: 'Medium',
      hardMatchScore: 60,
      softMatchScore: 74,
      missingSkills: ['React', 'AWS', 'System Design'],
      suggestions: ['Build more React projects', 'Get AWS certification', 'Study system design'],
      strengths: ['JavaScript', 'Python', 'SQL', 'Problem Solving'],
      processingTime: 980
    },
    {
      id: '3',
      candidateName: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      location: 'Austin, TX',
      experience: '6 years',
      score: 94,
      verdict: 'High',
      hardMatchScore: 92,
      softMatchScore: 96,
      missingSkills: ['Kubernetes'],
      suggestions: ['Add Kubernetes orchestration experience'],
      strengths: ['React', 'Node.js', 'AWS', 'Docker', 'Microservices', 'Team Management'],
      processingTime: 1100
    }
  ];

  const handleJobDescriptionSubmit = (jd: JobDescription) => {
    setJobDescription(jd);
    setActiveTab('resumes');
  };

  const handleResumeFiles = (files: File[]) => {
    setResumeFiles(files);
  };

  const simulateProcessing = async () => {
    setIsProcessing(true);
    setActiveTab('processing');

    // Simulate processing steps
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'processing', progress: 0 } : step
      ));

      // Simulate progress for current step
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProcessingSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, progress } : step
        ));
      }

      setProcessingSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'completed' } : step
      ));
    }

    // Show results
    setResults(mockResults);
    setIsProcessing(false);
    setActiveTab('results');
  };

  const resetProcess = () => {
    setJobDescription(null);
    setResumeFiles([]);
    setResults([]);
    setIsProcessing(false);
    setActiveTab('upload');
    setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'pending', progress: undefined })));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="AI Resume Analysis" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary-foreground/10 rounded-full">
                <Brain size={48} className="text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AI-Powered Resume
              <span className="block text-primary-lighter">Relevance Check</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
              Eliminate bias, save hours, and find the perfect candidates with our intelligent 
              resume screening system that processes thousands of resumes in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => setActiveTab('upload')}
                className="min-w-48"
              >
                <Upload size={20} />
                Start Screening Now
              </Button>
              <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our AI Screening?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed for modern recruitment teams and career centers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-success-light rounded-full flex items-center justify-center mb-4">
                  <img src={aiAnalysisIcon} alt="AI Analysis" className="w-10 h-10 rounded" />
                </div>
                <CardTitle>Intelligent Analysis</CardTitle>
                <CardDescription>
                  Advanced AI combines keyword matching with semantic understanding for accurate scoring
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-warning-light rounded-full flex items-center justify-center mb-4">
                  <img src={bulkProcessingIcon} alt="Bulk Processing" className="w-10 h-10 rounded" />
                </div>
                <CardTitle>Bulk Processing</CardTitle>
                <CardDescription>
                  Process hundreds of resumes simultaneously with real-time progress tracking
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary-lighter rounded-full flex items-center justify-center mb-4">
                  <BarChart3 size={24} className="text-primary" />
                </div>
                <CardTitle>Actionable Insights</CardTitle>
                <CardDescription>
                  Get detailed feedback and improvement suggestions for every candidate
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Application */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-2xl grid-cols-4">
                  <TabsTrigger value="upload" className="flex items-center space-x-2">
                    <FileText size={16} />
                    <span className="hidden sm:inline">Job Description</span>
                    <span className="sm:hidden">JD</span>
                  </TabsTrigger>
                  <TabsTrigger value="resumes" disabled={!jobDescription} className="flex items-center space-x-2">
                    <Upload size={16} />
                    <span className="hidden sm:inline">Upload Resumes</span>
                    <span className="sm:hidden">Resumes</span>
                  </TabsTrigger>
                  <TabsTrigger value="processing" disabled={!isProcessing} className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span className="hidden sm:inline">Processing</span>
                    <span className="sm:hidden">Process</span>
                  </TabsTrigger>
                  <TabsTrigger value="results" disabled={results.length === 0} className="flex items-center space-x-2">
                    <BarChart3 size={16} />
                    <span className="hidden sm:inline">Results</span>
                    <span className="sm:hidden">Results</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="upload" className="space-y-6">
                <JobDescriptionForm onSubmit={handleJobDescriptionSubmit} />
              </TabsContent>

              <TabsContent value="resumes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="text-primary" />
                      <span>Upload Resumes</span>
                    </CardTitle>
                    <CardDescription>
                      Upload individual resumes or bulk process multiple files
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FileUpload
                      title="Upload Resume Files"
                      description="Select PDF, DOC, or text files. Support for bulk uploads via ZIP files."
                      acceptedTypes=".pdf,.doc,.docx,.txt,.zip"
                      multiple={true}
                      maxSize={50}
                      onFileSelect={handleResumeFiles}
                    />
                    
                    {resumeFiles.length > 0 && (
                      <div className="flex justify-center pt-4">
                        <Button 
                          variant="success" 
                          size="lg"
                          onClick={simulateProcessing}
                          className="min-w-48"
                        >
                          <Zap size={20} />
                          Start AI Analysis
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="processing" className="space-y-6">
                <div className="max-w-2xl mx-auto">
                  <ProgressIndicator steps={processingSteps} />
                  
                  <div className="text-center mt-8">
                    <p className="text-muted-foreground">
                      Processing {resumeFiles.length} resume{resumeFiles.length !== 1 ? 's' : ''} against your job requirements...
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Analysis Results</h2>
                    <p className="text-muted-foreground">
                      {results.length} candidate{results.length !== 1 ? 's' : ''} analyzed
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={resetProcess}>
                      New Analysis
                    </Button>
                    <Button variant="success">
                      Export Results
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6">
                  {results.map((resume) => (
                    <ScoreCard
                      key={resume.id}
                      resume={resume}
                      onViewDetails={() => console.log('View details for', resume.candidateName)}
                      onDownload={() => console.log('Download report for', resume.candidateName)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;