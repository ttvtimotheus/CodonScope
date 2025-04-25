import { CustomTooltip } from '@/components/CustomTooltip';
import { translateDNA } from '@/lib/dna-utils';

interface AminoAcidVisualizationProps {
  sequence: string;
}

export function AminoAcidVisualization({ sequence }: AminoAcidVisualizationProps) {
  const aminoAcids = translateDNA(sequence);
  
  if (aminoAcids.length === 0) {
    return (
      <div className="text-center p-4 border border-border rounded-lg">
        <p className="text-muted-foreground">
          {sequence ? 'No valid start codon (ATG) found in the sequence' : 'Enter a DNA sequence for translation'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 w-full overflow-x-auto">
      <div className="flex flex-wrap gap-2">
        {aminoAcids.map((aa, index) => (
          <CustomTooltip key={index} content={`Position: ${index + 1}`}>
            <div className="flex min-w-16 h-10 border border-border rounded-md bg-secondary/20 items-center justify-center transition-all hover:scale-105 cursor-default">
              <span className="font-mono text-sm font-medium">{aa}</span>
            </div>
          </CustomTooltip>
        ))}
      </div>
    </div>
  );
}
