import { CustomTooltip } from '@/components/CustomTooltip';
import { 
  splitIntoCodons, 
  getBaseColor, 
  getCodonBackground, 
  isStartCodon,
  isStopCodon,
  codonToAminoAcid
} from '@/lib/dna-utils';

interface CodonVisualizationProps {
  sequence: string;
}

export function CodonVisualization({ sequence }: CodonVisualizationProps) {
  const codons = splitIntoCodons(sequence.toUpperCase());
  
  if (!sequence) {
    return (
      <div className="text-center p-4 border border-border rounded-lg">
        <p className="text-muted-foreground">Enter a DNA sequence to visualize codons</p>
      </div>
    );
  }

  return (
    <div className="p-4 w-full overflow-x-auto">
      <div className="flex flex-wrap gap-2">
        {codons.map((codon, index) => {
          const background = getCodonBackground(codon);
          const aminoAcid = codonToAminoAcid[codon] || '---';
          
          let tooltipContent = `Codon: ${codon}`;
          if (aminoAcid !== '---') {
            tooltipContent += ` → ${aminoAcid}`;
          }
          if (isStartCodon(codon)) {
            tooltipContent += ' (Start Codon)';
          } else if (isStopCodon(codon)) {
            tooltipContent += ' (Stop Codon)';
          }

          return (
            <CustomTooltip key={index} content={tooltipContent}>
              <div 
                className={`flex min-w-16 h-10 border border-border rounded-md ${background} items-center justify-center transition-all hover:scale-105 cursor-default`}
              >
                {Array.from(codon).map((base, baseIndex) => (
                  <span 
                    key={`${index}-${baseIndex}`} 
                    className={`${getBaseColor(base)} font-mono text-lg font-bold`}
                  >
                    {base}
                  </span>
                ))}
              </div>
            </CustomTooltip>
          );
        })}
      </div>
    </div>
  );
}
