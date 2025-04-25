import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { validateDNA, exampleDNA } from '@/lib/dna-utils';

interface DNASequenceInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  error: string | null;
}

export function DNASequenceInput({ 
  value, 
  onChange, 
  onAnalyze,
  error 
}: DNASequenceInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  const loadExample = () => {
    onChange(exampleDNA);
  };

  const clearSequence = () => {
    onChange('');
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="dna-input" className="text-sm font-medium">
          DNA Sequence (A, T, G, C only)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="dna-input"
            placeholder="Enter DNA sequence..."
            value={value}
            onChange={handleInputChange}
            className="font-mono"
          />
          <Button onClick={onAnalyze} className="shrink-0">
            Analyze
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          onClick={loadExample}
          size="sm"
        >
          Load Example
        </Button>
        <Button 
          variant="outline" 
          onClick={clearSequence}
          size="sm"
        >
          Clear
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invalid Input</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
