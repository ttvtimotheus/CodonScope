import React from 'react';
import { motion } from 'framer-motion';
import { CustomTooltip } from './CustomTooltip';
import { splitIntoCodons, isStartCodon, isStopCodon, codonToAminoAcid, getBaseColor } from '@/lib/dna-utils';

interface ReadingFrameAnalysisProps {
  sequence: string;
}

interface ORF {
  frameIndex: number;  // 0, 1, or 2
  startPos: number;
  endPos: number;
  length: number;
}

export function ReadingFrameAnalysis({ sequence }: ReadingFrameAnalysisProps) {
  if (!sequence || sequence.length < 3) {
    return (
      <div className="text-center p-4 border border-border rounded-lg bg-gray-900/30">
        <p className="text-muted-foreground">Enter a DNA sequence of at least 3 nucleotides to analyze reading frames</p>
      </div>
    );
  }

  // Generate three possible reading frames
  const frames = [0, 1, 2].map(offset => {
    // Extract subsequence starting at the offset
    const subSeq = sequence.slice(offset);
    // Split into codons
    return splitIntoCodons(subSeq, 0).flat();
  });

  // Find all Open Reading Frames (ORFs)
  const openReadingFrames: ORF[] = [];
  
  frames.forEach((frameCodons, frameIndex) => {
    let inORF = false;
    let startPos = 0;
    
    frameCodons.forEach((codon, codonIndex) => {
      // Start of an ORF
      if (!inORF && isStartCodon(codon)) {
        inORF = true;
        startPos = frameIndex + (codonIndex * 3);
      }
      
      // End of an ORF
      if (inORF && isStopCodon(codon)) {
        inORF = false;
        const endPos = frameIndex + (codonIndex * 3) + 2;
        const length = endPos - startPos + 1;
        
        openReadingFrames.push({
          frameIndex,
          startPos,
          endPos,
          length
        });
      }
    });
    
    // If we reach the end of the sequence and we're still in an ORF
    if (inORF) {
      const endPos = frameIndex + (frameCodons.length * 3) - 1;
      const length = endPos - startPos + 1;
      openReadingFrames.push({
        frameIndex,
        startPos,
        endPos,
        length
      });
    }
  });
  
  // Sort ORFs by length (longest first)
  const sortedORFs = [...openReadingFrames].sort((a, b) => b.length - a.length);
  const longestORF = sortedORFs.length > 0 ? sortedORFs[0] : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {frames.map((frameCodons, frameIndex) => (
          <div key={frameIndex} className="space-y-2">
            <div className="flex items-center">
              <div className="h-1 w-4 bg-primary"></div>
              <h3 className="text-sm font-medium ml-2">Reading Frame {frameIndex + 1}</h3>
              <span className="text-xs text-muted-foreground ml-2">(offset: {frameIndex})</span>
            </div>
            
            <div className="border border-border rounded-md p-3 overflow-x-auto">
              <div className="flex flex-wrap gap-1">
                {frameCodons.map((codon, codonIndex) => {
                  const position = frameIndex + (codonIndex * 3);
                  const isPartOfLongestORF = longestORF && 
                                            frameIndex === longestORF.frameIndex && 
                                            position >= longestORF.startPos && 
                                            position <= longestORF.endPos;
                  
                  let background = "bg-gray-900/20";
                  if (isStartCodon(codon)) {
                    background = "bg-[#1D7874]/30 ring-1 ring-[#1D7874]/70";
                  } else if (isStopCodon(codon)) {
                    background = "bg-[#8B1E3F]/30 ring-1 ring-[#8B1E3F]/70";
                  }
                  
                  const aa = codonToAminoAcid[codon] || '---';
                  const tooltipContent = `${codon} → ${aa} (position ${position}-${position+2})`;
                  
                  return (
                    <CustomTooltip key={`${frameIndex}-${codonIndex}`} content={tooltipContent}>
                      <div 
                        className={`
                          flex min-w-[3rem] h-8 border border-border rounded items-center 
                          justify-center transition-all hover:scale-105 cursor-default
                          ${background} ${isPartOfLongestORF ? 'ring-2 ring-primary shadow-md' : ''}
                        `}
                      >
                        <div className="flex">
                          {Array.from(codon).map((base, baseIndex) => (
                            <span 
                              key={`${frameIndex}-${codonIndex}-${baseIndex}`} 
                              className={`${getBaseColor(base)} font-mono text-sm font-bold px-0.5`}
                            >
                              {base}
                            </span>
                          ))}
                        </div>
                        <span className="text-[8px] text-muted-foreground absolute -bottom-3">
                          {aa !== '---' ? aa : ''}
                        </span>
                      </div>
                    </CustomTooltip>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* ORF Summary */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center">
          <div className="h-1 w-4 bg-primary"></div>
          <h3 className="text-sm font-medium ml-2">Open Reading Frames (ORFs)</h3>
        </div>
        
        <div className="border border-border rounded-md p-4 bg-secondary/5">
          {sortedORFs.length > 0 ? (
            <div>
              <div className="text-sm mb-3">
                {sortedORFs.length} potential ORF{sortedORFs.length !== 1 ? 's' : ''} found
              </div>
              <div className="space-y-2">
                {sortedORFs.slice(0, 5).map((orf, index) => (
                  <div 
                    key={index} 
                    className={`
                      flex justify-between items-center p-2 rounded 
                      ${index === 0 ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-secondary/10'}
                    `}
                  >
                    <div>
                      <span className="font-mono text-xs">
                        Frame {orf.frameIndex + 1}, Position {orf.startPos + 1}-{orf.endPos + 1}
                      </span>
                      {index === 0 && (
                        <span className="ml-2 text-xs bg-primary/20 px-1.5 py-0.5 rounded">
                          Longest
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {orf.length} bp ({Math.floor(orf.length / 3)} codons)
                    </span>
                  </div>
                ))}
                
                {sortedORFs.length > 5 && (
                  <div className="text-center text-xs text-muted-foreground mt-2">
                    + {sortedORFs.length - 5} more ORFs
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-2">
              No open reading frames detected. Check for ATG start codon followed by in-frame stop codons.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
