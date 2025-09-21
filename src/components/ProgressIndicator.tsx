import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'error';

interface ProcessingStep {
  id: string;
  label: string;
  status: ProcessingStatus;
  progress?: number;
  errorMessage?: string;
}

interface ProgressIndicatorProps {
  steps: ProcessingStep[];
  currentStep?: string;
  className?: string;
}

const getStatusIcon = (status: ProcessingStatus) => {
  switch (status) {
    case 'pending':
      return <Clock size={16} className="text-muted-foreground" />;
    case 'processing':
      return <Loader2 size={16} className="text-primary animate-spin" />;
    case 'completed':
      return <CheckCircle2 size={16} className="text-success" />;
    case 'error':
      return <AlertCircle size={16} className="text-destructive" />;
  }
};

const getStatusColor = (status: ProcessingStatus) => {
  switch (status) {
    case 'pending':
      return 'text-muted-foreground';
    case 'processing':
      return 'text-primary font-medium';
    case 'completed':
      return 'text-success font-medium';
    case 'error':
      return 'text-destructive font-medium';
  }
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  className
}) => {
  const overallProgress = (steps.filter(step => step.status === 'completed').length / steps.length) * 100;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Processing Progress</h3>
              <span className="text-sm text-muted-foreground">
                {Math.round(overallProgress)}% Complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Individual Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="space-y-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(step.status)}
                  <span className={cn("flex-1", getStatusColor(step.status))}>
                    {step.label}
                  </span>
                  {step.status === 'processing' && step.progress !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      {step.progress}%
                    </span>
                  )}
                </div>
                
                {/* Step-specific progress bar */}
                {step.status === 'processing' && step.progress !== undefined && (
                  <Progress value={step.progress} className="h-1 ml-7" />
                )}
                
                {/* Error message */}
                {step.status === 'error' && step.errorMessage && (
                  <p className="text-sm text-destructive ml-7">
                    {step.errorMessage}
                  </p>
                )}
                
                {/* Connection line to next step */}
                {index < steps.length - 1 && (
                  <div className="w-px h-4 bg-border ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};