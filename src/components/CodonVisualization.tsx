import { CustomTooltip } from '@/components/CustomTooltip';
import { 
  splitIntoCodons, 
  getBaseColor, 
  getCodonBackground, 
  isStartCodon,
  isStopCodon,
  codonToAminoAcid
} from '@/lib/dna-utils';
import { useState } from 'react';

interface CodonVisualizationProps {
  sequence: string;
  showCodonNumbers?: boolean;
  highlightTarget?: string | null;
}

export function CodonVisualization({ 
  sequence, 
  showCodonNumbers = false,
  highlightTarget = null
}: CodonVisualizationProps) {
  // Group size controls how many codons appear in each group
  const [groupSize, setGroupSize] = useState(5);
  
  if (!sequence) {
    return (
      <div className="text-center p-4 border border-border rounded-lg bg-gray-900/30">
        <p className="text-muted-foreground">Enter a DNA sequence to visualize codons</p>
      </div>
    );
  }

  const codonGroups = splitIntoCodons(sequence.toUpperCase(), groupSize);
  const totalCodons = codonGroups.flat().length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <select 
          className="px-2 py-1 text-xs rounded bg-secondary/20 border border-border"
          value={groupSize}
          onChange={(e) => setGroupSize(Number(e.target.value))}
        >
          <option value="0">No Grouping</option>
          <option value="3">Group by 3</option>
          <option value="5">Group by 5</option>
          <option value="10">Group by 10</option>
        </select>
      </div>
      
      <div className="w-full overflow-x-auto">
        <div className="space-y-5"> {/* Increased vertical spacing between rows */}
          {codonGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex gap-4 mb-2"> {/* Increased horizontal gap between groups */}
              {showCodonNumbers && (
                <div className="flex items-center text-muted-foreground text-xs font-mono w-10">
                  {groupIndex * groupSize + 1}
                </div>
              )}
              <div className="flex gap-3"> {/* Increased gap between codons in a group */}
                {group.map((codon, codonIndex) => {
                  const globalIndex = groupIndex * (groupSize || 1) + codonIndex;
                  const background = getCodonBackground(codon);
                  const aminoAcid = codonToAminoAcid[codon] || '---';
                  const position = (globalIndex + 1) * 3 - 2; // Calculate base position
                  
                  let tooltipContent = `Codon: ${codon} (position ${position}-${position+2})`;
                  if (aminoAcid !== '---') {
                    tooltipContent += ` → ${aminoAcid}`;
                  }
                  if (isStartCodon(codon)) {
                    tooltipContent += ' (Start Codon)';
                  } else if (isStopCodon(codon)) {
                    tooltipContent += ' (Stop Codon)';
                  }
                  
                  const isHighlighted = highlightTarget && codon === highlightTarget.toUpperCase();
                  
                  return (
                    <CustomTooltip key={codonIndex} content={tooltipContent}>
                      <div 
                        className={`flex min-w-[4rem] h-14 border border-border rounded-md ${background} items-center justify-center transition-all hover:scale-105 cursor-default ${isHighlighted ? 'ring-4 ring-primary/50 shadow-lg' : ''}`}
                        id={`codon-${globalIndex}`}
                      >
                        {Array.from(codon).map((base, baseIndex) => (
                          <span 
                            key={`${codonIndex}-${baseIndex}`} 
                            className={`${getBaseColor(base)} font-mono text-2xl font-bold px-1`}
                          >
                            {base}
                          </span>
                        ))}
                      </div>
                    </CustomTooltip>
                  );
                })}
              </div>
              {showCodonNumbers && groupSize > 0 && group.length === groupSize && (
                <div className="flex items-center text-muted-foreground text-xs font-mono">
                  {(groupIndex + 1) * groupSize}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-2">
        {totalCodons} codons · {sequence.length} nucleotides
      </div>
    </div>
  );
}
