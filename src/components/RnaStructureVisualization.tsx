import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  dnaToRna, 
  predictRnaStructure, 
  calculateRnaLayout, 
  generateMountainPlot 
} from '@/lib/rna-utils';
import { CustomTooltip } from './CustomTooltip';

interface RnaStructureVisualizationProps {
  sequence: string;
}

export function RnaStructureVisualization({ sequence }: RnaStructureVisualizationProps) {
  const [rnaSequence, setRnaSequence] = useState('');
  const [dotBracket, setDotBracket] = useState('');
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'circle' | 'mountain'>('circle');
  const [pairs, setPairs] = useState<[number, number][]>([]);
  const [mfe, setMfe] = useState(0);
  const [visData, setVisData] = useState<{
    bases: { x: number; y: number; base: string }[];
    pairs: { i: number; j: number; probability: number }[];
  } | null>(null);
  const [mountainData, setMountainData] = useState<{ x: number; y: number }[]>([]);
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Convert DNA to RNA and predict structure when sequence changes
  useEffect(() => {
    if (!sequence || sequence.length < 10) {
      setRnaSequence('');
      setDotBracket('');
      setPairs([]);
      setVisData(null);
      return;
    }
    
    // Use only first 200 bases for performance reasons
    const limitedSeq = sequence.substring(0, 200);
    const rna = dnaToRna(limitedSeq);
    setRnaSequence(rna);
    
    try {
      // Predict structure
      const { dotBracket: db, pairs: p, mfe: m } = predictRnaStructure(rna);
      setDotBracket(db);
      setPairs(p);
      setMfe(m);
      
      // Calculate visualization data
      const layoutData = calculateRnaLayout(rna, 120);
      setVisData(layoutData);
      
      // Calculate mountain plot data
      const mountain = generateMountainPlot(db);
      setMountainData(mountain);
    } catch (e) {
      console.error('Error predicting RNA structure:', e);
    }
  }, [sequence]);
  
  const handleBaseHover = (index: number | null) => {
    setHighlightIndex(index);
  };
  
  // When no sequence is provided
  if (!sequence) {
    return (
      <div className="text-center p-4 border border-border rounded-lg bg-gray-900/30">
        <p className="text-muted-foreground">Enter a DNA sequence to visualize RNA secondary structure</p>
      </div>
    );
  }
  
  // When sequence is too short
  if (sequence.length < 10) {
    return (
      <div className="text-center p-4 border border-border rounded-lg bg-gray-900/30">
        <p className="text-muted-foreground">Sequence too short for RNA structure prediction. Need at least 10 nucleotides.</p>
      </div>
    );
  }
  
  // Get the base color based on RNA nucleotide
  const getBaseColor = (base: string) => {
    switch (base.toUpperCase()) {
      case 'A': return '#1D7874'; // Green
      case 'U': return '#8B1E3F'; // Red
      case 'G': return '#E3B23C'; // Yellow
      case 'C': return '#3D348B'; // Blue
      default: return '#718096';
    }
  };
  
  // Calculate dimensions for the SVG viewBox
  const svgWidth = 300;
  const svgHeight = 300;
  const svgViewBox = `-150 -150 300 300`;
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="visualization">Structure Visualization</TabsTrigger>
          <TabsTrigger value="details">Sequence &amp; Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visualization" className="space-y-4 pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">RNA Secondary Structure</h3>
              <p className="text-xs text-muted-foreground">
                First 200 nucleotides shown. {sequence.length > 200 && 'Sequence truncated for visualization.'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'circle' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setViewMode('circle')}
              >
                Circle
              </Button>
              <Button 
                variant={viewMode === 'mountain' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setViewMode('mountain')}
              >
                Mountain
              </Button>
            </div>
          </div>
          
          <div className="rounded-lg border border-border bg-black/20 p-4 flex justify-center items-center">
            <div className="relative">
              {viewMode === 'circle' && visData && (
                <div className="relative">
                  <div className="text-center mb-4 flex items-center justify-center gap-2">
                    <Badge variant="outline">Pairs: {pairs.length}</Badge>
                    <Badge variant="outline" className="bg-primary/10">MFE: {mfe.toFixed(1)} kcal/mol</Badge>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="w-[300px] h-[300px] relative">
                      <svg 
                        ref={svgRef}
                        width={svgWidth} 
                        height={svgHeight} 
                        viewBox={svgViewBox}
                        className="transform scale-y-[-1]" // Flip y-axis to match typical RNA visualizations
                        style={{ transform: `scale(${zoomLevel})` }}
                      >
                        {/* Base pairs */}
                        {visData.pairs.map(({ i, j, probability }, index) => (
                          <motion.line
                            key={`pair-${i}-${j}`}
                            x1={visData.bases[i].x}
                            y1={visData.bases[i].y}
                            x2={visData.bases[j].x}
                            y2={visData.bases[j].y}
                            strokeWidth={probability * 2}
                            stroke={`rgba(255,255,255,${probability * 0.5})`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.01 }}
                            className={`${
                              (highlightIndex === i || highlightIndex === j) 
                                ? 'stroke-primary stroke-2' 
                                : ''
                            }`}
                          />
                        ))}
                        
                        {/* Bases */}
                        {visData.bases.map((base, index) => (
                          <motion.g
                            key={`base-${index}`}
                            onMouseEnter={() => handleBaseHover(index)}
                            onMouseLeave={() => handleBaseHover(null)}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.01 }}
                          >
                            <circle
                              cx={base.x}
                              cy={base.y}
                              r={8}
                              fill={getBaseColor(base.base)}
                              fillOpacity={highlightIndex === index ? 1 : 0.7}
                              stroke={highlightIndex === index ? 'white' : 'none'}
                              strokeWidth={1.5}
                              className="cursor-pointer transition-all"
                            />
                            <text
                              x={base.x}
                              y={-base.y} // Adjust text position due to SVG y-flip
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="10"
                              fontWeight="bold"
                              fill="white"
                              style={{ pointerEvents: 'none' }}
                              className="select-none"
                              transform={`scale(1,-1)`} // Flip text back to readable orientation
                            >
                              {base.base}
                            </text>
                          </motion.g>
                        ))}
                        
                        {/* Position labels (every 10th base) */}
                        {visData.bases.filter((_, i) => i % 10 === 0).map((base, index) => {
                          const i = index * 10;
                          return (
                            <g key={`label-${i}`}>
                              <text
                                x={base.x * 1.15}
                                y={-base.y * 1.15}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="8"
                                fill="#64748b"
                                transform={`scale(1,-1)`}
                              >
                                {i + 1}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="text-xs text-muted-foreground block mb-1">
                      Zoom: {zoomLevel.toFixed(1)}x
                    </label>
                    <Slider
                      value={[zoomLevel]}
                      min={0.5}
                      max={2}
                      step={0.1}
                      onValueChange={(value: number[]) => setZoomLevel(value[0])}
                    />
                  </div>
                </div>
              )}
              
              {viewMode === 'mountain' && mountainData.length > 0 && (
                <div className="relative">
                  <div className="text-center mb-4 flex items-center justify-center gap-2">
                    <Badge variant="outline">Pairs: {pairs.length}</Badge>
                    <Badge variant="outline" className="bg-primary/10">MFE: {mfe.toFixed(1)} kcal/mol</Badge>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="w-[400px] h-[200px] relative">
                      <svg 
                        width="100%" 
                        height="100%" 
                        viewBox={`0 0 ${rnaSequence.length} ${Math.max(...mountainData.map(d => d.y)) + 1}`}
                        preserveAspectRatio="none"
                        className="overflow-visible"
                      >
                        {/* Y-axis */}
                        <line
                          x1="0"
                          y1="0"
                          x2="0"
                          y2={Math.max(...mountainData.map(d => d.y)) + 1}
                          stroke="#64748b"
                          strokeWidth="1"
                        />
                        
                        {/* X-axis */}
                        <line
                          x1="0"
                          y1="0"
                          x2={rnaSequence.length}
                          y2="0"
                          stroke="#64748b"
                          strokeWidth="1"
                        />
                        
                        {/* Mountain plot path */}
                        <motion.path
                          d={`M0,0 ${mountainData.map(d => `L${d.x},${d.y}`).join(' ')}`}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                        
                        {/* Mountain fill */}
                        <motion.path
                          d={`M0,0 ${mountainData.map(d => `L${d.x},${d.y}`).join(' ')} L${rnaSequence.length},0 Z`}
                          fill="url(#mountainGradient)"
                          fillOpacity="0.3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1.5 }}
                        />
                        
                        {/* X-axis labels */}
                        {Array.from({ length: Math.ceil(rnaSequence.length / 20) }).map((_, i) => (
                          <text
                            key={`xlabel-${i}`}
                            x={i * 20}
                            y="15"
                            textAnchor="middle"
                            fontSize="8"
                            fill="#64748b"
                            transform="translate(0, 3)"
                          >
                            {i * 20}
                          </text>
                        ))}
                        
                        {/* Y-axis labels */}
                        {Array.from({ length: Math.max(...mountainData.map(d => d.y)) + 1 }).map((_, i) => (
                          <text
                            key={`ylabel-${i}`}
                            x="-5"
                            y={i}
                            textAnchor="end"
                            dominantBaseline="middle"
                            fontSize="8"
                            fill="#64748b"
                          >
                            {i}
                          </text>
                        ))}
                        
                        {/* Gradient definition */}
                        <defs>
                          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center text-xs text-muted-foreground">
                    The mountain plot shows the depth of base pairing in the RNA structure.<br />
                    Higher peaks indicate deeper nested structures.
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">RNA Sequence</h3>
                <div className="p-2 bg-secondary/10 rounded font-mono text-xs overflow-x-auto whitespace-pre-wrap border border-border">
                  {rnaSequence.split('').map((base, i) => (
                    <span
                      key={i}
                      className={`${
                        highlightIndex === i ? 'bg-primary/30 rounded px-0.5' : ''
                      }`}
                      style={{ color: getBaseColor(base) }}
                      onMouseEnter={() => handleBaseHover(i)}
                      onMouseLeave={() => handleBaseHover(null)}
                    >
                      {base}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Dot-Bracket Notation</h3>
                <div className="p-2 bg-secondary/10 rounded font-mono text-xs overflow-x-auto whitespace-pre-wrap border border-border">
                  {dotBracket.split('').map((char, i) => (
                    <span
                      key={i}
                      className={`${
                        highlightIndex === i ? 'bg-primary/30 rounded px-0.5' : ''
                      } ${char === '(' ? 'text-green-400' : char === ')' ? 'text-amber-400' : 'text-gray-400'}`}
                      onMouseEnter={() => handleBaseHover(i)}
                      onMouseLeave={() => handleBaseHover(null)}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="text-green-400 font-mono">(</span> = Base forms a pair with a downstream base<br />
                  <span className="text-amber-400 font-mono">)</span> = Base forms a pair with an upstream base<br />
                  <span className="text-gray-400 font-mono">.</span> = Unpaired base
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Base Pairs</h3>
                <div className="grid grid-cols-5 gap-2">
                  {pairs.slice(0, 25).map(([i, j], index) => (
                    <CustomTooltip 
                      key={`pair-${index}`} 
                      content={`Pair: ${rnaSequence[i]}-${rnaSequence[j]}`}
                    >
                      <div 
                        className="flex gap-1 items-center justify-center text-xs bg-secondary/10 p-1 rounded border border-border hover:border-primary/50 transition-colors"
                        onMouseEnter={() => handleBaseHover(i)}
                        onMouseLeave={() => handleBaseHover(null)}
                      >
                        <span className="font-mono" style={{ color: getBaseColor(rnaSequence[i]) }}>
                          {i+1}:{rnaSequence[i]}
                        </span>
                        <span>-</span>
                        <span className="font-mono" style={{ color: getBaseColor(rnaSequence[j]) }}>
                          {rnaSequence[j]}:{j+1}
                        </span>
                      </div>
                    </CustomTooltip>
                  ))}
                </div>
                {pairs.length > 25 && (
                  <div className="text-center text-xs text-muted-foreground">
                    + {pairs.length - 25} more pairs
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Structure Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/10 p-3 rounded border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Pairs</div>
                    <div className="text-base font-semibold">{pairs.length}</div>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Est. Free Energy</div>
                    <div className="text-base font-semibold">{mfe.toFixed(1)} kcal/mol</div>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Paired Bases</div>
                    <div className="text-base font-semibold">
                      {((pairs.length * 2 / rnaSequence.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Max Nesting Depth</div>
                    <div className="text-base font-semibold">
                      {Math.max(...mountainData.map(d => d.y))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-xs text-muted-foreground">
            <strong>Note:</strong> This is a simplified RNA structure prediction using a base-pairing algorithm.
            It doesn't account for pseudoknots, tertiary interactions, or energy parameters used in advanced tools like ViennaRNA.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
