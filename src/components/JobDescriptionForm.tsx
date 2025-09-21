import React, { useState } from 'react';
import { Briefcase, Building, MapPin, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from './FileUpload';

export interface JobDescription {
  jobTitle: string;
  company: string;
  location: string;
  experience: string;
  salary?: string;
  description: string;
  requirements: string;
  preferredSkills?: string;
  file?: File;
}

interface JobDescriptionFormProps {
  onSubmit: (jobDescription: JobDescription) => void;
  isProcessing?: boolean;
}

export const JobDescriptionForm: React.FC<JobDescriptionFormProps> = ({
  onSubmit,
  isProcessing = false
}) => {
  const [formData, setFormData] = useState<JobDescription>({
    jobTitle: '',
    company: '',
    location: '',
    experience: '',
    salary: '',
    description: '',
    requirements: '',
    preferredSkills: ''
  });

  const [useFileUpload, setUseFileUpload] = useState(false);

  const handleInputChange = (field: keyof JobDescription, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, file: files[0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = useFileUpload 
    ? formData.file
    : formData.jobTitle && formData.company && formData.description && formData.requirements;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Briefcase className="text-primary" size={24} />
          <span>Job Description</span>
        </CardTitle>
        <div className="flex space-x-4">
          <Button
            variant={!useFileUpload ? "default" : "outline"}
            size="sm"
            onClick={() => setUseFileUpload(false)}
          >
            Manual Entry
          </Button>
          <Button
            variant={useFileUpload ? "default" : "outline"}
            size="sm"
            onClick={() => setUseFileUpload(true)}
          >
            Upload JD File
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {useFileUpload ? (
            <FileUpload
              title="Upload Job Description"
              description="Upload a PDF, DOC, or text file containing the job description"
              acceptedTypes=".pdf,.doc,.docx,.txt"
              onFileSelect={handleFileSelect}
              maxSize={5}
            />
          ) : (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="flex items-center space-x-2">
                    <Briefcase size={16} />
                    <span>Job Title *</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center space-x-2">
                    <Building size={16} />
                    <span>Company *</span>
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g., Tech Corp Inc."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>Location</span>
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience" className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>Experience Required</span>
                  </Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="e.g., 3-5 years"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary" className="flex items-center space-x-2">
                  <DollarSign size={16} />
                  <span>Salary Range</span>
                </Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>

              <Separator />

              {/* Detailed Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requirements">Required Skills & Qualifications *</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="List must-have skills, certifications, education requirements..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferredSkills">Preferred/Nice-to-Have Skills</Label>
                  <Textarea
                    id="preferredSkills"
                    value={formData.preferredSkills}
                    onChange={(e) => handleInputChange('preferredSkills', e.target.value)}
                    placeholder="List good-to-have skills that would be a plus..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid || isProcessing}
              className="min-w-32"
            >
              {isProcessing ? 'Processing...' : 'Save Job Description'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};