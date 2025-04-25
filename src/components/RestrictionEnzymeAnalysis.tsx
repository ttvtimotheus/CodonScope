import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { 
  restrictionEnzymes, 
  findRestrictionSites, 
  simulateDigestion, 
  simulateGelElectrophoresis, 
  type RestrictionEnzyme 
} from '@/lib/restriction-enzymes';
import { CustomTooltip } from './CustomTooltip';
import { motion } from 'framer-motion';

interface RestrictionEnzymeAnalysisProps {
  sequence: string;
}

export function RestrictionEnzymeAnalysis({ sequence }: RestrictionEnzymeAnalysisProps) {
  const [restrictionSites, setRestrictionSites] = useState<{ enzyme: RestrictionEnzyme; positions: number[] }[]>([]);
  const [selectedEnzymes, setSelectedEnzymes] = useState<RestrictionEnzyme[]>([]);
  const [digestResults, setDigestResults] = useState<{ fragments: string[]; cutPositions: number[] } | null>(null);
  const [gelResults, setGelResults] = useState<{size: number; intensity: number; sequence: string; lane: number}[]>([]);
  const [view, setView] = useState<'sites' | 'gel'>('sites');
  
  useEffect(() => {
    if (sequence && sequence.length > 0) {
      const sites = findRestrictionSites(sequence);
      setRestrictionSites(sites);
      
      // Reset selections
      setSelectedEnzymes([]);
      setDigestResults(null);
      setGelResults([]);
    }
  }, [sequence]);
  
  const handleEnzymeToggle = (enzyme: RestrictionEnzyme) => {
    const isSelected = selectedEnzymes.some(e => e.name === enzyme.name);
    
    if (isSelected) {
      setSelectedEnzymes(selectedEnzymes.filter(e => e.name !== enzyme.name));
    } else {
      setSelectedEnzymes([...selectedEnzymes, enzyme]);
    }
  };
  
  const handleDigest = () => {
    if (selectedEnzymes.length === 0 || !sequence) return;
    
    const result = simulateDigestion(sequence, selectedEnzymes);
    setDigestResults(result);
    
    const gel = simulateGelElectrophoresis(result.fragments);
    setGelResults(gel);
    
    // Switch to gel view
    setView('gel');
  };
  
  if (!sequence) {
    return (
      <div className="text-center p-4 border border-border rounded-lg bg-gray-900/30">
        <p className="text-muted-foreground">Enter a DNA sequence to analyze restriction sites</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Button 
          variant={view === 'sites' ? 'default' : 'outline'} 
          onClick={() => setView('sites')}
          size="sm"
        >
          Restriction Sites
        </Button>
        <Button 
          variant={view === 'gel' ? 'default' : 'outline'} 
          onClick={() => setView('gel')}
          size="sm"
          disabled={gelResults.length === 0}
        >
          Gel Simulation
        </Button>
      </div>
      
      {view === 'sites' ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-medium">Restriction Sites ({restrictionSites.length} enzymes found)</h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedEnzymes([])}
                  disabled={selectedEnzymes.length === 0}
                >
                  Clear Selection
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleDigest}
                  disabled={selectedEnzymes.length === 0}
                >
                  Digest {selectedEnzymes.length > 0 && `(${selectedEnzymes.length})`}
                </Button>
              </div>
            </div>
            
            {restrictionSites.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {restrictionSites.map(({ enzyme, positions }) => (
                    <div 
                      key={enzyme.name} 
                      className={`
                        p-3 border rounded-lg flex flex-col gap-2
                        ${selectedEnzymes.some(e => e.name === enzyme.name) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'}
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={selectedEnzymes.some(e => e.name === enzyme.name)}
                            onCheckedChange={() => handleEnzymeToggle(enzyme)}
                            id={`enzyme-${enzyme.name}`}
                          />
                          <div>
                            <Label 
                              htmlFor={`enzyme-${enzyme.name}`}
                              className="text-base font-medium cursor-pointer"
                            >
                              {enzyme.name}
                            </Label>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {enzyme.source}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs font-normal"
                          >
                            {positions.length} site{positions.length !== 1 ? 's' : ''}
                          </Badge>
                          <Badge className="text-xs font-normal bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-0">
                            {enzyme.overhang === 'blunt' 
                              ? 'Blunt' 
                              : enzyme.overhang === '5prime' 
                                ? "5' Overhang" 
                                : "3' Overhang"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-1 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-medium">Recognition:</div>
                          <code className="text-xs bg-secondary/20 px-1.5 py-0.5 rounded font-mono">
                            {enzyme.recognitionSequence}
                          </code>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Cut positions: {positions.map(p => p + 1).join(', ')}
                        </div>
                        
                        {enzyme.bufferCompatibility && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {enzyme.bufferCompatibility.map(buffer => (
                              <span 
                                key={buffer} 
                                className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-sm"
                              >
                                {buffer}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {restrictionSites.length === 0 && (
                    <div className="text-center p-4 text-muted-foreground">
                      No restriction sites found for common enzymes.
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                No restriction sites found for common enzymes in this sequence.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-medium">
                Digestion Results ({gelResults.length} fragment{gelResults.length !== 1 ? 's' : ''})
              </h3>
              <div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setView('sites')}
                >
                  Back to Sites
                </Button>
              </div>
            </div>
            
            <div className="flex gap-4">
              {/* Enzyme selection summary */}
              <div className="w-1/4">
                <div className="text-sm font-medium mb-2">Enzymes Used:</div>
                <div className="space-y-1">
                  {selectedEnzymes.map(enzyme => (
                    <div key={enzyme.name} className="text-sm flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary/70"></div>
                      <span>{enzyme.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Gel visualization */}
              <div className="w-3/4">
                <div className="relative w-full bg-gray-950 rounded-lg overflow-hidden p-2 h-[400px]">
                  {/* Gel lanes */}
                  <div className="absolute top-0 left-0 w-full h-full flex">
                    {/* Ladder lane */}
                    <div className="w-16 h-full border-r border-gray-800 relative flex justify-center">
                      <div className="absolute top-0 left-0 w-full h-8 bg-gray-900/50 flex items-center justify-center text-xs">
                        Ladder
                      </div>
                      
                      {/* Ladder bands */}
                      {[10000, 8000, 6000, 4000, 3000, 2000, 1000, 500, 100].map((size, i) => {
                        // Calculate position (approximate)
                        const position = Math.log(size) / Math.log(10000) * 80;
                        return (
                          <div
                            key={`ladder-${size}`}
                            className="absolute w-12 h-2 bg-gray-400/50 rounded-full"
                            style={{ top: `${8 + position * 100}%` }}
                          >
                            <span className="absolute -right-14 transform -translate-y-1/2 text-[10px] text-gray-400 whitespace-nowrap">
                              {size > 1000 ? `${size/1000}kb` : `${size}bp`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Sample lanes */}
                    <div className="flex-1 flex">
                      {gelResults.length > 0 ? (
                        <div className="flex-1 relative flex items-end justify-center">
                          <div className="absolute top-0 left-0 w-full h-8 bg-gray-900/50 flex items-center justify-center text-xs">
                            Digest
                          </div>
                          
                          {gelResults.map((fragment, index) => {
                            // Calculate position based on logarithmic scale (approximate gel mobility)
                            // The formula maps fragment sizes to positions in the gel
                            // Larger fragments move slower (appear higher in the gel)
                            const maxSize = Math.max(...gelResults.map(f => f.size), 10000);
                            const position = Math.min(90, Math.max(10, Math.log(fragment.size) / Math.log(maxSize) * 70));
                            
                            // Calculate band width/intensity based on fragment size
                            const bandWidth = Math.min(90, Math.max(30, (fragment.size / maxSize) * 100));
                            
                            return (
                              <motion.div
                                key={`fragment-${index}`}
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: `${bandWidth}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="absolute h-3 bg-primary rounded-full cursor-pointer"
                                style={{ 
                                  top: `${8 + position}%`,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  opacity: 0.7 + (fragment.size / maxSize) * 0.3
                                }}
                                onClick={() => {
                                  // Highlight this fragment in the table below
                                  const tableRow = document.getElementById(`fragment-row-${index}`);
                                  if (tableRow) {
                                    tableRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    tableRow.classList.add('bg-primary/10');
                                    setTimeout(() => tableRow.classList.remove('bg-primary/10'), 2000);
                                  }
                                }}
                              >
                                <div className="relative w-full h-full">
                                  <CustomTooltip content={
                                    <div className="p-1">
                                      <div className="font-bold">Fragment {index + 1}</div>
                                      <div>Size: {fragment.size} bp</div>
                                      <div className="text-xs text-muted-foreground mt-1">Click to highlight in table</div>
                                    </div>
                                  }>
                                    <span className="absolute inset-0"></span>
                                  </CustomTooltip>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-muted-foreground text-sm">No digest results</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fragment Table */}
            {gelResults.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Fragment Sizes</h4>
                <div className="border border-border rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/20">
                      <tr>
                        <th className="p-2 text-left font-medium">#</th>
                        <th className="p-2 text-left font-medium">Size</th>
                        <th className="p-2 text-left font-medium">Ends</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {gelResults.map((fragment, index) => (
                        <tr key={index} id={`fragment-row-${index}`} className="hover:bg-secondary/5">
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2 font-mono">{fragment.size}bp</td>
                          <td className="p-2 text-muted-foreground text-xs truncate max-w-[200px]">
                            {fragment.sequence.substring(0, 8)}...{fragment.sequence.substring(fragment.sequence.length - 8)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
