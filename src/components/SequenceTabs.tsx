import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodonVisualization } from './CodonVisualization';
import { AminoAcidVisualization } from './AminoAcidVisualization';
import { ReadingFrameAnalysis } from './ReadingFrameAnalysis';
import { PrimerDesignTool } from './PrimerDesignTool';
import { RestrictionEnzymeAnalysis } from './RestrictionEnzymeAnalysis';
import { RnaStructureVisualization } from './RnaStructureVisualization';
import { SimpleExportTools } from './SimpleExportTools';
import { getReverseComplement } from '@/lib/dna-utils';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface SequenceTabsProps {
  sequence: string;
  comparisonSequence?: string;
}

export function SequenceTabs({ sequence, comparisonSequence }: SequenceTabsProps) {
  const [selectedCodon, setSelectedCodon] = useState<string | null>(null);
  const sequenceContainerRef = useRef<HTMLDivElement>(null);
  
  if (!sequence) {
    return null;
  }

  // Convert DNA to mRNA (replace T with U)
  const mRNASequence = sequence.toUpperCase().replace(/T/g, 'U');
  
  // Get reverse complement
  const reverseComplement = getReverseComplement(sequence);
  
  // Highlight matching codons when hovering
  const handleCodonHover = (codon: string) => {
    setSelectedCodon(codon);
  };

  return (
    <Tabs defaultValue="dna" className="w-full">
      <TabsList className="grid grid-cols-8 mb-6 bg-secondary/10 p-1 rounded-xl shadow-inner text-xs md:text-sm overflow-x-auto">
        <TabsTrigger 
          value="dna" 
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <span className="flex items-center gap-1">
            <span className="font-mono">DNA</span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="mrna" 
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <span className="flex items-center gap-1">
            <span className="font-mono">mRNA</span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="reverse" 
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <span className="flex items-center gap-1">
            <span className="font-mono">Reverse</span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="compare" 
          disabled={!comparisonSequence}
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white disabled:opacity-50"
        >
          <span className="flex items-center gap-1">
            <span className="font-mono">Compare</span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="frames" 
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <span className="flex items-center gap-1">
            <span className="font-mono">Frames</span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="primers" 
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <span className="flex items-center gap-1">
            <span className="font-mono">Primers</span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="restriction" 
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <span className="flex items-center gap-1">
            <span className="font-mono">Restriction</span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="rna-structure" 
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <span className="flex items-center gap-1">
            <span className="font-mono">RNA Struct</span>
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="export" 
          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <span className="flex items-center gap-1">
            <span className="font-mono">Export</span>
          </span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dna" className="space-y-8 pb-4">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          ref={sequenceContainerRef}
          id="sequence-visualization"
        >
          <div className="flex items-center space-x-2">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">DNA Sequence</h3>
          </div>
          <CodonVisualization 
            sequence={sequence} 
            showCodonNumbers={true} 
            highlightTarget={selectedCodon}
          />
          
          <div className="flex items-center space-x-2 mt-8">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">Amino Acid Translation</h3>
          </div>
          <AminoAcidVisualization sequence={sequence} />
        </motion.div>
      </TabsContent>
      
      <TabsContent value="mrna" className="space-y-8 pb-4">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">mRNA Sequence (T → U)</h3>
            <span className="text-xs text-muted-foreground">DNA transcribed to RNA</span>
          </div>
          <CodonVisualization 
            sequence={mRNASequence} 
            showCodonNumbers={true}
          />
          
          <div className="flex items-center space-x-2 mt-8">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">Amino Acid Translation</h3>
          </div>
          <AminoAcidVisualization sequence={mRNASequence} />
        </motion.div>
      </TabsContent>
      
      <TabsContent value="reverse" className="space-y-8 pb-4">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">Reverse Complement</h3>
            <span className="text-xs text-muted-foreground">Complementary strand (3' to 5')</span>
          </div>
          <CodonVisualization 
            sequence={reverseComplement} 
            showCodonNumbers={true}
          />
          
          <div className="flex items-center space-x-2 mt-8">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">Amino Acid Translation (Reverse Complement)</h3>
          </div>
          <AminoAcidVisualization sequence={reverseComplement} />
        </motion.div>
      </TabsContent>
      
      {comparisonSequence && (
        <TabsContent value="compare" className="space-y-8 pb-4">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <div className="h-1 w-4 bg-primary"></div>
              <h3 className="text-lg font-medium">Original Sequence</h3>
            </div>
            <CodonVisualization sequence={sequence} showCodonNumbers={true} />
            
            <div className="flex items-center space-x-2 mt-8">
              <div className="h-1 w-4 bg-primary"></div>
              <h3 className="text-lg font-medium">Comparison Sequence</h3>
            </div>
            <CodonVisualization sequence={comparisonSequence} showCodonNumbers={true} />
            
            {/* Display differences */}
            <div className="mt-8">
              <div className="flex items-center space-x-2">
                <div className="h-1 w-4 bg-primary"></div>
                <h3 className="text-lg font-medium">Sequence Comparison</h3>
              </div>
              
              <div className="p-4 mt-4 border border-border rounded-md bg-secondary/5">
                {sequence.length !== comparisonSequence.length ? (
                  <div className="text-center py-2">
                    <p className="text-amber-500">Sequences have different lengths and cannot be directly compared.</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Original: {sequence.length} bp | Comparison: {comparisonSequence.length} bp
                    </p>
                  </div>
                ) : (
                  <div>
                    {(() => {
                      const differences = Array.from(sequence).reduce((count, base, index) => 
                        count + (base.toUpperCase() !== comparisonSequence[index].toUpperCase() ? 1 : 0), 0);
                      const percentDiff = ((differences / sequence.length) * 100).toFixed(2);
                      
                      return (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-lg font-bold">{differences}</span>
                              <span className="text-sm ml-1">base differences found</span>
                            </div>
                            <div className="text-sm">
                              {percentDiff}% difference
                            </div>
                          </div>
                          
                          {/* Visual representation of differences */}
                          <div className="h-6 bg-secondary/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary/70" 
                              style={{ width: `${percentDiff}%` }}
                            />
                          </div>
                          
                          {/* Show first few differences */}
                          {differences > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="text-sm font-medium">First differences:</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {Array.from(sequence).reduce((result, base, index) => {
                                  if (base.toUpperCase() !== comparisonSequence[index].toUpperCase() && result.length < 5) {
                                    result.push(
                                      <div key={index} className="flex justify-between border-b border-border pb-1">
                                        <span>Position {index + 1}:</span>
                                        <span className="font-mono">
                                          {sequence[index].toUpperCase()} → {comparisonSequence[index].toUpperCase()}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return result;
                                }, [] as React.ReactNode[])}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()} 
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </TabsContent>
      )}
      
      {/* Reading Frames Analysis Tab */}
      <TabsContent value="frames" className="space-y-8 pb-4">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">Reading Frames Analysis</h3>
            <span className="text-xs text-muted-foreground">Identify all possible ORFs</span>
          </div>
          <ReadingFrameAnalysis sequence={sequence} />
        </motion.div>
      </TabsContent>
      
      {/* Primer Design Tool Tab */}
      <TabsContent value="primers" className="space-y-8 pb-4">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">Primer Design Tool</h3>
            <span className="text-xs text-muted-foreground">Design optimized primers for PCR</span>
          </div>
          <PrimerDesignTool sequence={sequence} />
        </motion.div>
      </TabsContent>
      
      {/* Restriction Enzyme Analysis Tab */}
      <TabsContent value="restriction" className="space-y-8 pb-4">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">Restriction Enzyme Analysis</h3>
            <span className="text-xs text-muted-foreground">Find restriction sites and simulate digestion</span>
          </div>
          <RestrictionEnzymeAnalysis sequence={sequence} />
        </motion.div>
      </TabsContent>
      
      {/* RNA Structure Visualization Tab */}
      <TabsContent value="rna-structure" className="space-y-8 pb-4">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">RNA Secondary Structure</h3>
            <span className="text-xs text-muted-foreground">Predict and visualize RNA folding</span>
          </div>
          <RnaStructureVisualization sequence={sequence} />
        </motion.div>
      </TabsContent>
      
      {/* Export Tab */}
      <TabsContent value="export" className="space-y-8 pb-4">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <div className="h-1 w-4 bg-primary"></div>
            <h3 className="text-lg font-medium">Export Options</h3>
            <span className="text-xs text-muted-foreground">Save and share your sequence analysis</span>
          </div>
          
          <SimpleExportTools 
            sequence={sequence} 
          />
          
          <div className="mt-8 p-4 border border-border rounded-lg bg-secondary/5">
            <h4 className="text-sm font-medium mb-2">Export Instructions</h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• <span className="font-medium text-foreground">FASTA</span>: Standard bioinformatics format with header and sequence</li>
              <li>• <span className="font-medium text-foreground">GenBank</span>: Comprehensive format with annotations and metadata</li>
              <li>• <span className="font-medium text-foreground">Text</span>: Simple text export of the sequence</li>
              <li>• <span className="font-medium text-foreground">JSON</span>: Machine-readable format with sequence metadata</li>
            </ul>
          </div>
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}
