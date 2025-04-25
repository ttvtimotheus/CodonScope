import { CustomTooltip } from '@/components/CustomTooltip';
import { translateDNA } from '@/lib/dna-utils';
import { motion } from 'framer-motion';

// Amino acid color coding based on properties
const getAminoAcidColor = (aa: string): string => {
  // Group by chemical properties
  const hydrophobic = ['Ala', 'Val', 'Leu', 'Ile', 'Pro', 'Phe', 'Trp', 'Met'];
  const polar = ['Gly', 'Ser', 'Thr', 'Cys', 'Tyr', 'Asn', 'Gln'];
  const positive = ['Lys', 'Arg', 'His'];
  const negative = ['Asp', 'Glu'];
  
  if (hydrophobic.includes(aa)) return 'bg-amber-950/40 border-amber-800/50';
  if (polar.includes(aa)) return 'bg-teal-950/40 border-teal-800/50';
  if (positive.includes(aa)) return 'bg-blue-950/40 border-blue-800/50';
  if (negative.includes(aa)) return 'bg-red-950/40 border-red-800/50';
  return 'bg-secondary/20 border-border'; // Default for 'Stop' and unknown
};

// Full names of amino acids for tooltips
const aminoAcidNames: Record<string, string> = {
  'Ala': 'Alanine',
  'Arg': 'Arginine',
  'Asn': 'Asparagine',
  'Asp': 'Aspartic acid',
  'Cys': 'Cysteine',
  'Glu': 'Glutamic acid',
  'Gln': 'Glutamine',
  'Gly': 'Glycine',
  'His': 'Histidine',
  'Ile': 'Isoleucine',
  'Leu': 'Leucine',
  'Lys': 'Lysine',
  'Met': 'Methionine (Start)',
  'Phe': 'Phenylalanine',
  'Pro': 'Proline',
  'Ser': 'Serine',
  'Thr': 'Threonine',
  'Trp': 'Tryptophan',
  'Tyr': 'Tyrosine',
  'Val': 'Valine',
  'Stop': 'Stop codon'
};

interface AminoAcidVisualizationProps {
  sequence: string;
  codonStartIndex?: number; // Where ATG was found
}

export function AminoAcidVisualization({ 
  sequence,
  codonStartIndex = -1
}: AminoAcidVisualizationProps) {
  const aminoAcids = translateDNA(sequence);
  
  if (aminoAcids.length === 0) {
    return (
      <div className="text-center p-4 border border-border rounded-lg bg-gray-900/30 mt-6">
        <p className="text-muted-foreground">
          {sequence ? 'No valid start codon (ATG) found in the sequence' : 'Enter a DNA sequence for translation'}
        </p>
      </div>
    );
  }

  // Find the first ATG index if not provided
  const startCodonIndex = codonStartIndex >= 0 
    ? codonStartIndex 
    : sequence.toUpperCase().indexOf('ATG') / 3;
  
  return (
    <div className="mt-10 w-full">
      {/* Connection lines from codons to amino acids */}
      <div className="h-8 relative">
        <div className="absolute left-0 right-0 border-l-2 border-r-2 border-dashed border-gray-700/30 h-full mx-auto w-0"></div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex gap-4 w-max min-w-full">
          {aminoAcids.map((aa, index) => {
            const colorClass = getAminoAcidColor(aa);
            const fullName = aminoAcidNames[aa] || aa;
            const codonPosition = startCodonIndex + index;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05 // Staggered animation
                }}
              >
                <CustomTooltip content={`${fullName} (position ${index + 1})`}>
                  <div 
                    className={`flex flex-col items-center min-w-[4rem] h-14 border ${colorClass} rounded-md transition-all hover:scale-105 cursor-default`}
                    id={`aa-${index}`}
                  >
                    <div className="font-mono text-lg font-medium pt-2">{aa}</div>
                    <div className="text-xs text-muted-foreground">{index + 1}</div>
                  </div>
                </CustomTooltip>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <div className="text-xs text-right text-muted-foreground mt-4">
        Protein length: {aminoAcids.length} amino acids
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 text-xs">
        <div className="bg-amber-950/40 border border-amber-800/50 py-1 px-2 rounded">Hydrophobic</div>
        <div className="bg-teal-950/40 border border-teal-800/50 py-1 px-2 rounded">Polar</div>
        <div className="bg-blue-950/40 border border-blue-800/50 py-1 px-2 rounded">Positive charged</div>
        <div className="bg-red-950/40 border border-red-800/50 py-1 px-2 rounded">Negative charged</div>
      </div>
    </div>
  );
}
