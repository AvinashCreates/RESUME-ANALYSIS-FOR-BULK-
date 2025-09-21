import React from 'react';
import { TrendingUp, TrendingDown, Minus, User, Mail, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ResumeScore {
  id: string;
  candidateName: string;
  email?: string;
  location?: string;
  experience?: string;
  score: number;
  verdict: 'High' | 'Medium' | 'Low';
  hardMatchScore: number;
  softMatchScore: number;
  missingSkills: string[];
  suggestions: string[];
  strengths: string[];
  processingTime?: number;
}

interface ScoreCardProps {
  resume: ResumeScore;
  onViewDetails?: () => void;
  onDownload?: () => void;
  className?: string;
}

const getVerdictColor = (verdict: ResumeScore['verdict']) => {
  switch (verdict) {
    case 'High':
      return 'bg-success text-success-foreground';
    case 'Medium':
      return 'bg-warning text-warning-foreground';
    case 'Low':
      return 'bg-destructive text-destructive-foreground';
  }
};

const getScoreIcon = (score: number) => {
  if (score >= 75) return <TrendingUp className="text-success" size={20} />;
  if (score >= 50) return <Minus className="text-warning" size={20} />;
  return <TrendingDown className="text-destructive" size={20} />;
};

const getScoreColor = (score: number) => {
  if (score >= 75) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-destructive';
};

export const ScoreCard: React.FC<ScoreCardProps> = ({
  resume,
  onViewDetails,
  onDownload,
  className
}) => {
  return (
    <Card className={cn("hover:shadow-medium transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center space-x-2">
              <User size={18} className="text-muted-foreground" />
              <span>{resume.candidateName}</span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {resume.email && (
                <div className="flex items-center space-x-1">
                  <Mail size={14} />
                  <span>{resume.email}</span>
                </div>
              )}
              {resume.location && (
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>{resume.location}</span>
                </div>
              )}
              {resume.experience && (
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{resume.experience}</span>
                </div>
              )}
            </div>
          </div>
          <Badge className={getVerdictColor(resume.verdict)}>
            {resume.verdict} Fit
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getScoreIcon(resume.score)}
              <span className="font-semibold">Overall Relevance</span>
            </div>
            <span className={cn("text-2xl font-bold", getScoreColor(resume.score))}>
              {resume.score}%
            </span>
          </div>
          <Progress value={resume.score} className="h-2" />
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hard Match</span>
              <span className="font-medium">{resume.hardMatchScore}%</span>
            </div>
            <Progress value={resume.hardMatchScore} className="h-1" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Soft Match</span>
              <span className="font-medium">{resume.softMatchScore}%</span>
            </div>
            <Progress value={resume.softMatchScore} className="h-1" />
          </div>
        </div>

        {/* Strengths */}
        {resume.strengths.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-success mb-2">Key Strengths</h4>
            <div className="flex flex-wrap gap-1">
              {resume.strengths.slice(0, 3).map((strength, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {strength}
                </Badge>
              ))}
              {resume.strengths.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{resume.strengths.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {resume.missingSkills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-warning mb-2">Missing Skills</h4>
            <div className="flex flex-wrap gap-1">
              {resume.missingSkills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs border-warning text-warning">
                  {skill}
                </Badge>
              ))}
              {resume.missingSkills.length > 3 && (
                <Badge variant="outline" className="text-xs border-warning text-warning">
                  +{resume.missingSkills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewDetails}
            className="flex-1"
          >
            View Details
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDownload}
          >
            Download
          </Button>
        </div>

        {/* Processing Time */}
        {resume.processingTime && (
          <p className="text-xs text-muted-foreground text-center">
            Processed in {resume.processingTime}ms
          </p>
        )}
      </CardContent>
    </Card>
  );
};