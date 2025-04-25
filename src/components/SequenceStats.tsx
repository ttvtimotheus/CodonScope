import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateGCContent } from '@/lib/dna-utils';

interface SequenceStatsProps {
  sequence: string;
}

export function SequenceStats({ sequence }: SequenceStatsProps) {
  const gcContent = calculateGCContent(sequence);
  const atContent = sequence ? 100 - gcContent : 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sequence Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Length</p>
            <p className="text-2xl font-bold">{sequence.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">GC Content</p>
            <p className="text-2xl font-bold">{gcContent}%</p>
          </div>
          
          {/* Visualization of GC content */}
          <div className="col-span-2">
            <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-yellow-500" 
                style={{ width: `${gcContent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>AT: {atContent.toFixed(2)}%</span>
              <span>GC: {gcContent.toFixed(2)}%</span>
            </div>
          </div>
          
          {/* Base counts */}
          <div className="col-span-2 grid grid-cols-4 gap-2 mt-2">
            {['A', 'T', 'G', 'C'].map(base => {
              const count = sequence.split('').filter(b => b.toUpperCase() === base).length;
              const percentage = sequence ? ((count / sequence.length) * 100).toFixed(1) : '0';
              
              const baseColors = {
                'A': 'bg-green-500/20 text-green-500',
                'T': 'bg-red-500/20 text-red-500',
                'G': 'bg-yellow-500/20 text-yellow-500',
                'C': 'bg-blue-500/20 text-blue-500'
              };
              
              return (
                <div 
                  key={base} 
                  className={`rounded-md p-2 ${baseColors[base as keyof typeof baseColors]}`}
                >
                  <div className="font-mono text-lg font-bold">{base}</div>
                  <div className="text-xs">{count} ({percentage}%)</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
