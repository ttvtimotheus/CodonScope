import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateGCContent } from '@/lib/dna-utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SequenceStatsProps {
  sequence: string;
}

type NucleotideDistribution = {
  [position: number]: {
    A: number;
    T: number;
    G: number;
    C: number;
  };
};

export function SequenceStats({ sequence }: SequenceStatsProps) {
  const gcContent = calculateGCContent(sequence);
  const atContent = sequence ? 100 - gcContent : 0;
  const [distribution, setDistribution] = useState<NucleotideDistribution>({});
  const [codonUsage, setCodonUsage] = useState<Record<string, number>>({});
  
  // Calculate nucleotide distribution across sequence (for graphing)
  useEffect(() => {
    if (!sequence) return;
    
    // Split into sections of 10 bases for charting
    const sectionSize = Math.max(10, Math.floor(sequence.length / 20));
    const newDistribution: NucleotideDistribution = {};
    
    for (let i = 0; i < sequence.length; i += sectionSize) {
      const section = sequence.slice(i, i + sectionSize);
      const sectionIndex = Math.floor(i / sectionSize);
      
      newDistribution[sectionIndex] = {
        A: 0, T: 0, G: 0, C: 0
      };
      
      // Count nucleotides in this section
      for (const base of section) {
        const upperBase = base.toUpperCase();
        if (['A', 'T', 'G', 'C'].includes(upperBase)) {
          newDistribution[sectionIndex][upperBase as 'A' | 'T' | 'G' | 'C']++;
        }
      }
    }
    
    setDistribution(newDistribution);
    
    // Calculate codon usage
    const codons: Record<string, number> = {};
    for (let i = 0; i < sequence.length - 2; i += 3) {
      const codon = sequence.substring(i, i + 3).toUpperCase();
      if (codon.length === 3) {
        codons[codon] = (codons[codon] || 0) + 1;
      }
    }
    setCodonUsage(codons);
    
  }, [sequence]);
  
  // Get the most common codons
  const topCodons = Object.entries(codonUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  
  // Count bases
  const baseCounts = {
    A: sequence.split('').filter(b => b.toUpperCase() === 'A').length,
    T: sequence.split('').filter(b => b.toUpperCase() === 'T').length,
    G: sequence.split('').filter(b => b.toUpperCase() === 'G').length,
    C: sequence.split('').filter(b => b.toUpperCase() === 'C').length
  };
  
  // Optimized scientific color scheme for bases
  const baseColors = {
    'A': 'bg-[#1D7874]/20 text-[#1D7874]',
    'T': 'bg-[#8B1E3F]/20 text-[#8B1E3F]',
    'G': 'bg-[#E3B23C]/20 text-[#E3B23C]',
    'C': 'bg-[#3D348B]/20 text-[#3D348B]'
  };
  
  // Maximum section count for scaling the distribution graph
  const maxSectionCount = Object.values(distribution).reduce((max, section) => {
    const sectionTotal = section.A + section.T + section.G + section.C;
    return Math.max(max, sectionTotal);
  }, 0);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sequence Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Sequence Length</p>
            <p className="text-2xl font-bold">{sequence.length} bp</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">GC Content</p>
            <p className="text-2xl font-bold">{gcContent.toFixed(2)}%</p>
          </div>
        </div>
        
        {/* GC Content Visualization - Circular chart */}
        <div className="relative h-32 flex justify-center items-center">
          <div className="absolute h-28 w-28 rounded-full border-8 border-[#3D348B]/30 overflow-hidden">
            <motion.div 
              className="absolute bottom-0 w-full bg-[#3D348B]/70" 
              initial={{ height: 0 }}
              animate={{ height: `${gcContent}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <div className="absolute h-28 w-28 rounded-full flex justify-center items-center">
            <span className="text-3xl font-bold">{gcContent.toFixed(1)}%</span>
          </div>
        </div>
        
        {/* Base counts - improved visual presentation */}
        <div className="grid grid-cols-4 gap-2">
          {['A', 'T', 'G', 'C'].map(base => {
            const count = baseCounts[base as keyof typeof baseCounts];
            const percentage = sequence.length ? ((count / sequence.length) * 100).toFixed(1) : '0';
            
            return (
              <motion.div 
                key={base} 
                className={`rounded-md p-3 ${baseColors[base as keyof typeof baseColors]} flex flex-col items-center`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * ['A', 'T', 'G', 'C'].indexOf(base) }}
              >
                <div className="font-mono text-2xl font-bold">{base}</div>
                <div className="text-sm font-semibold">{count}</div>
                <div className="text-xs">({percentage}%)</div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Nucleotide distribution graph */}
        {sequence.length > 10 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Nucleotide Distribution</p>
            <div className="h-24 flex items-end gap-px">
              {Object.entries(distribution).map(([sectionIndex, counts], index) => {
                const sectionTotal = counts.A + counts.T + counts.G + counts.C;
                const heightPercentage = (sectionTotal / maxSectionCount) * 100;
                
                // Calculate percentages for each base in this section
                const aPercent = sectionTotal ? (counts.A / sectionTotal) * 100 : 0;
                const tPercent = sectionTotal ? (counts.T / sectionTotal) * 100 : 0;
                const gPercent = sectionTotal ? (counts.G / sectionTotal) * 100 : 0;
                const cPercent = sectionTotal ? (counts.C / sectionTotal) * 100 : 0;
                
                return (
                  <div 
                    key={sectionIndex} 
                    className="flex-1 flex flex-col-reverse"
                    style={{ height: `${heightPercentage}%` }}
                  >
                    <div 
                      className="w-full bg-[#1D7874]" 
                      style={{ height: `${aPercent}%` }}
                    />
                    <div 
                      className="w-full bg-[#8B1E3F]" 
                      style={{ height: `${tPercent}%` }}
                    />
                    <div 
                      className="w-full bg-[#E3B23C]" 
                      style={{ height: `${gPercent}%` }}
                    />
                    <div 
                      className="w-full bg-[#3D348B]" 
                      style={{ height: `${cPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5' end</span>
              <span>3' end</span>
            </div>
          </div>
        )}
        
        {/* Most common codons */}
        {sequence.length >= 3 && topCodons.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Most Common Codons</p>
            <div className="grid grid-cols-3 gap-2">
              {topCodons.map(([codon, count]) => {
                const percentage = ((count / (sequence.length / 3)) * 100).toFixed(1);
                return (
                  <div key={codon} className="border border-border rounded p-1 text-center">
                    <div className="font-mono text-sm">{codon}</div>
                    <div className="text-xs text-muted-foreground">{count} ({percentage}%)</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
