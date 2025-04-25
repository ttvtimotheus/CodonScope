// Primer design utilities

// Calculate melting temperature (Tm) using the simplified formula
// For primers < 14 bases: Tm = 2(A+T) + 4(G+C)
// For primers >= 14 bases: Tm = 64.9 + 41*(G+C-16.4)/(A+T+G+C)
export function calculateTm(sequence: string): number {
  const upperSeq = sequence.toUpperCase();
  const a = (upperSeq.match(/A/g) || []).length;
  const t = (upperSeq.match(/T/g) || []).length;
  const g = (upperSeq.match(/G/g) || []).length;
  const c = (upperSeq.match(/C/g) || []).length;
  
  if (sequence.length < 14) {
    return 2 * (a + t) + 4 * (g + c);
  } else {
    return 64.9 + 41 * (g + c - 16.4) / (a + t + g + c);
  }
}

// Calculate GC content percentage
export function calculateGCContent(sequence: string): number {
  const upperSeq = sequence.toUpperCase();
  const g = (upperSeq.match(/G/g) || []).length;
  const c = (upperSeq.match(/C/g) || []).length;
  
  return (g + c) / sequence.length * 100;
}

// Check for self-complementarity (simplified)
export function hasSelfComplementarity(sequence: string, threshold = 4): boolean {
  const reverseComp = getReverseComplement(sequence);
  
  // Check for consecutive complementary bases
  for (let i = 0; i <= sequence.length - threshold; i++) {
    const subSeq = sequence.substring(i, i + threshold);
    if (reverseComp.includes(subSeq)) {
      return true;
    }
  }
  
  return false;
}

// Get reverse complement
export function getReverseComplement(sequence: string): string {
  const complement: Record<string, string> = {
    'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G',
    'a': 't', 't': 'a', 'g': 'c', 'c': 'g'
  };
  
  return sequence
    .split('')
    .map(base => complement[base] || base)
    .reverse()
    .join('');
}

// Generate forward and reverse primers for a given target region
export function generatePrimers(
  sequence: string, 
  startPos: number, 
  endPos: number, 
  options = { 
    minLength: 18, 
    maxLength: 30, 
    optimalGC: 50, 
    optimalTm: 60 
  }
): { forward: string; reverse: string; forwardTm: number; reverseTm: number; forwardGC: number; reverseGC: number } {
  // Ensure valid range
  if (startPos < 0) startPos = 0;
  if (endPos >= sequence.length) endPos = sequence.length - 1;
  if (startPos >= endPos) throw new Error('Start position must be less than end position');
  
  const upperSeq = sequence.toUpperCase();
  
  // Generate forward primer (try different lengths to find optimal Tm)
  let forwardPrimer = '';
  let forwardTm = 0;
  let forwardGC = 0;
  
  for (let len = options.minLength; len <= options.maxLength; len++) {
    const primer = upperSeq.substring(startPos, startPos + len);
    const tm = calculateTm(primer);
    const gc = calculateGCContent(primer);
    
    // Check if this primer is better than the current one
    if (
      forwardPrimer === '' || 
      Math.abs(tm - options.optimalTm) < Math.abs(forwardTm - options.optimalTm) ||
      (Math.abs(tm - options.optimalTm) === Math.abs(forwardTm - options.optimalTm) && 
       Math.abs(gc - options.optimalGC) < Math.abs(forwardGC - options.optimalGC))
    ) {
      forwardPrimer = primer;
      forwardTm = tm;
      forwardGC = gc;
    }
  }
  
  // Generate reverse primer
  let reversePrimer = '';
  let reverseTm = 0;
  let reverseGC = 0;
  
  for (let len = options.minLength; len <= options.maxLength; len++) {
    const primer = getReverseComplement(upperSeq.substring(Math.max(endPos - len + 1, 0), endPos + 1));
    const tm = calculateTm(primer);
    const gc = calculateGCContent(primer);
    
    if (
      reversePrimer === '' || 
      Math.abs(tm - options.optimalTm) < Math.abs(reverseTm - options.optimalTm) ||
      (Math.abs(tm - options.optimalTm) === Math.abs(reverseTm - options.optimalTm) && 
       Math.abs(gc - options.optimalGC) < Math.abs(reverseGC - options.optimalGC))
    ) {
      reversePrimer = primer;
      reverseTm = tm;
      reverseGC = gc;
    }
  }
  
  return {
    forward: forwardPrimer,
    reverse: reversePrimer,
    forwardTm,
    reverseTm,
    forwardGC,
    reverseGC
  };
}

// Validate primer by checking common issues
export function validatePrimer(primer: string): { 
  valid: boolean; 
  issues: string[]; 
  gc: number; 
  tm: number; 
  hasSelfComp: boolean;
} {
  const issues: string[] = [];
  
  // Check length
  if (primer.length < 15) {
    issues.push('Primer is too short (< 15 bp)');
  } else if (primer.length > 35) {
    issues.push('Primer is too long (> 35 bp)');
  }
  
  // Calculate GC content
  const gc = calculateGCContent(primer);
  if (gc < 40) {
    issues.push('GC content is too low (< 40%)');
  } else if (gc > 60) {
    issues.push('GC content is too high (> 60%)');
  }
  
  // Calculate melting temperature
  const tm = calculateTm(primer);
  if (tm < 50) {
    issues.push('Melting temperature is too low (< 50°C)');
  } else if (tm > 65) {
    issues.push('Melting temperature is too high (> 65°C)');
  }
  
  // Check for runs of the same base
  if (/([ATGC])\1{3,}/i.test(primer)) {
    issues.push('Contains runs of 4+ identical bases');
  }
  
  // Check for self-complementarity
  const hasSelfComp = hasSelfComplementarity(primer);
  if (hasSelfComp) {
    issues.push('Has self-complementarity');
  }
  
  // Check 3' end stability (GC clamp)
  const last5 = primer.slice(-5);
  const gcCount = (last5.match(/[GC]/gi) || []).length;
  if (gcCount < 2) {
    issues.push('Weak 3\' end (less than 2 G/C in last 5 bases)');
  } else if (gcCount > 3) {
    issues.push('Too strong 3\' end (more than 3 G/C in last 5 bases)');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    gc,
    tm,
    hasSelfComp
  };
}
