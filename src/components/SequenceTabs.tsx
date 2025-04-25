import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodonVisualization } from './CodonVisualization';
import { AminoAcidVisualization } from './AminoAcidVisualization';
import { getReverseComplement } from '@/lib/dna-utils';

interface SequenceTabsProps {
  sequence: string;
  comparisonSequence?: string;
}

export function SequenceTabs({ sequence, comparisonSequence }: SequenceTabsProps) {
  if (!sequence) {
    return null;
  }

  // Convert DNA to mRNA (replace T with U)
  const mRNASequence = sequence.toUpperCase().replace(/T/g, 'U');
  
  // Get reverse complement
  const reverseComplement = getReverseComplement(sequence);

  return (
    <Tabs defaultValue="dna" className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="dna">DNA</TabsTrigger>
        <TabsTrigger value="mrna">mRNA</TabsTrigger>
        <TabsTrigger value="reverse">Reverse Complement</TabsTrigger>
        <TabsTrigger value="compare" disabled={!comparisonSequence}>
          Compare
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dna" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">DNA Sequence</h3>
          <CodonVisualization sequence={sequence} />
          <h3 className="text-lg font-medium">Amino Acid Translation</h3>
          <AminoAcidVisualization sequence={sequence} />
        </div>
      </TabsContent>
      
      <TabsContent value="mrna" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">mRNA Sequence (T → U)</h3>
          <CodonVisualization sequence={mRNASequence} />
        </div>
      </TabsContent>
      
      <TabsContent value="reverse" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Reverse Complement</h3>
          <CodonVisualization sequence={reverseComplement} />
          <h3 className="text-lg font-medium">Amino Acid Translation (Reverse Complement)</h3>
          <AminoAcidVisualization sequence={reverseComplement} />
        </div>
      </TabsContent>
      
      {comparisonSequence && (
        <TabsContent value="compare" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Original Sequence</h3>
            <CodonVisualization sequence={sequence} />
            <h3 className="text-lg font-medium">Comparison Sequence</h3>
            <CodonVisualization sequence={comparisonSequence} />
            
            {/* Display differences */}
            <h3 className="text-lg font-medium">Differences</h3>
            <div className="p-4 border border-border rounded-md">
              {sequence.length !== comparisonSequence.length ? (
                <p>Sequences have different lengths and cannot be directly compared.</p>
              ) : (
                <div>
                  <p>
                    {Array.from(sequence).reduce((count, base, index) => 
                      count + (base.toUpperCase() !== comparisonSequence[index].toUpperCase() ? 1 : 0), 0)} 
                    base differences found
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
