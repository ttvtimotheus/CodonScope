import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  generatePrimers,
  validatePrimer,
  calculateTm,
  calculateGCContent
} from '@/lib/primer-utils';
import { CustomTooltip } from './CustomTooltip';

interface PrimerDesignToolProps {
  sequence: string;
}

export function PrimerDesignTool({ sequence }: PrimerDesignToolProps) {
  const [startPos, setStartPos] = useState(0);
  const [endPos, setEndPos] = useState(Math.min(sequence.length - 1, 500));
  const [primerLength, setPrimerLength] = useState({ min: 18, max: 25 });
  const [optimalTm, setOptimalTm] = useState(60);
  const [optimalGC, setOptimalGC] = useState(50);
  const [primers, setPrimers] = useState<{ 
    forward: string; 
    reverse: string;
    forwardTm: number;
    reverseTm: number;
    forwardGC: number;
    reverseGC: number;
    forwardValidation?: { valid: boolean; issues: string[] };
    reverseValidation?: { valid: boolean; issues: string[] };
  } | null>(null);
  const [customForward, setCustomForward] = useState('');
  const [customReverse, setCustomReverse] = useState('');
  const [amplifiedRegion, setAmplifiedRegion] = useState('');
  const [productSize, setProductSize] = useState(0);

  const handleDesignPrimers = () => {
    if (!sequence || sequence.length < 50) return;

    try {
      const designedPrimers = generatePrimers(sequence, startPos, endPos, {
        minLength: primerLength.min,
        maxLength: primerLength.max,
        optimalGC,
        optimalTm
      });

      // Validate primers
      const forwardValidation = validatePrimer(designedPrimers.forward);
      const reverseValidation = validatePrimer(designedPrimers.reverse);

      setPrimers({
        ...designedPrimers,
        forwardValidation,
        reverseValidation
      });

      setCustomForward(designedPrimers.forward);
      setCustomReverse(designedPrimers.reverse);

      // Calculate amplified region
      const region = sequence.substring(startPos, endPos + 1);
      setAmplifiedRegion(region);
      setProductSize(region.length);
    } catch (error) {
      console.error('Error generating primers:', error);
    }
  };

  useEffect(() => {
    if (sequence && sequence.length > 50) {
      // Auto-set end position to a reasonable length from the start
      setEndPos(Math.min(startPos + 500, sequence.length - 1));
    }
  }, [sequence, startPos]);

  // Update validation status when custom primers change
  useEffect(() => {
    if (customForward || customReverse) {
      const forwardValidation = customForward ? validatePrimer(customForward) : undefined;
      const reverseValidation = customReverse ? validatePrimer(customReverse) : undefined;

      setPrimers(prev => prev ? {
        ...prev,
        forward: customForward,
        reverse: customReverse,
        forwardTm: customForward ? calculateTm(customForward) : prev.forwardTm,
        reverseTm: customReverse ? calculateTm(customReverse) : prev.reverseTm,
        forwardGC: customForward ? calculateGCContent(customForward) : prev.forwardGC,
        reverseGC: customReverse ? calculateGCContent(customReverse) : prev.reverseGC,
        forwardValidation,
        reverseValidation
      } : null);
    }
  }, [customForward, customReverse]);

  if (!sequence) {
    return (
      <div className="text-center p-4 border border-border rounded-lg bg-gray-900/30">
        <p className="text-muted-foreground">Enter a DNA sequence to design primers</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Region Selection */}
        <Card className="border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-sm font-semibold mb-2">Target Region</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Start Position</label>
                <Input
                  type="number"
                  min={0}
                  max={sequence.length - 50}
                  value={startPos}
                  onChange={(e) => setStartPos(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">End Position</label>
                <Input
                  type="number"
                  min={startPos + 50}
                  max={sequence.length - 1}
                  value={endPos}
                  onChange={(e) => setEndPos(Math.min(sequence.length - 1, parseInt(e.target.value) || 0))}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">Target Size: {endPos - startPos + 1} bp</label>
              <div className="h-2 bg-secondary/20 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-primary/50"
                  style={{ width: `${((endPos - startPos + 1) / sequence.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>1</span>
                <span>{sequence.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primer Parameters */}
        <Card className="border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-sm font-semibold mb-2">Primer Parameters</h3>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Primer Length: {primerLength.min}-{primerLength.max} bp
              </label>
              <Slider
                defaultValue={[primerLength.min, primerLength.max]}
                min={15}
                max={35}
                step={1}
                onValueChange={(value) => setPrimerLength({ min: value[0], max: value[1] })}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Optimal Tm: {optimalTm}°C
              </label>
              <Slider
                defaultValue={[optimalTm]}
                min={50}
                max={70}
                step={0.5}
                onValueChange={(value) => setOptimalTm(value[0])}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Optimal GC Content: {optimalGC}%
              </label>
              <Slider
                defaultValue={[optimalGC]}
                min={40}
                max={60}
                step={1}
                onValueChange={(value) => setOptimalGC(value[0])}
                className="w-full"
              />
            </div>

            <Button onClick={handleDesignPrimers} className="w-full mt-4">
              Design Primers
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Primer Results */}
      {primers && (
        <Card className="border-primary/10 overflow-hidden">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-sm font-semibold mb-2">Designed Primers</h3>

            <div className="grid grid-cols-1 gap-4">
              {/* Forward Primer */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Forward Primer</label>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${primers.forwardValidation?.valid ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {primers.forwardValidation?.valid ? 'Good' : 'Issues'}
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded">
                      Tm: {primers.forwardTm.toFixed(1)}°C
                    </span>
                    <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded">
                      GC: {primers.forwardGC.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={customForward}
                    onChange={(e) => setCustomForward(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(customForward)}>
                    Copy
                  </Button>
                </div>

                {primers.forwardValidation?.issues.length ? (
                  <div className="text-xs text-amber-500 space-y-1 p-2 bg-amber-500/10 rounded">
                    {primers.forwardValidation.issues.map((issue, i) => (
                      <div key={i}>⚠️ {issue}</div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Reverse Primer */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Reverse Primer</label>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${primers.reverseValidation?.valid ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {primers.reverseValidation?.valid ? 'Good' : 'Issues'}
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded">
                      Tm: {primers.reverseTm.toFixed(1)}°C
                    </span>
                    <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded">
                      GC: {primers.reverseGC.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={customReverse}
                    onChange={(e) => setCustomReverse(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(customReverse)}>
                    Copy
                  </Button>
                </div>

                {primers.reverseValidation?.issues.length ? (
                  <div className="text-xs text-amber-500 space-y-1 p-2 bg-amber-500/10 rounded">
                    {primers.reverseValidation.issues.map((issue, i) => (
                      <div key={i}>⚠️ {issue}</div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* PCR Product Preview */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">PCR Product</label>
                  <span className="text-xs bg-secondary/20 px-2 py-0.5 rounded">
                    Size: {productSize} bp
                  </span>
                </div>

                <CustomTooltip content="Click to copy the entire amplicon sequence">
                  <div 
                    className="p-2 bg-secondary/10 rounded font-mono text-xs max-h-24 overflow-y-auto cursor-pointer border border-border hover:border-primary/30 transition-colors"
                    onClick={() => navigator.clipboard.writeText(amplifiedRegion)}
                  >
                    <span className="text-[#1D7874] font-bold">{primers.forward}</span>
                    <span className="text-muted-foreground">
                      {amplifiedRegion.substring(primers.forward.length, amplifiedRegion.length - primers.reverse.length)}
                    </span>
                    <span className="text-[#8B1E3F] font-bold">{primers.reverse}</span>
                  </div>
                </CustomTooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
