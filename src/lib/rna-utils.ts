// RNA secondary structure utilities

// Convert DNA to RNA
export function dnaToRna(dna: string): string {
  return dna.replace(/T/g, 'U').replace(/t/g, 'u');
}

// Simple pair checking - returns true if bases can form a pair
function canPair(a: string, b: string): boolean {
  const pairs: Record<string, string> = {
    'A': 'U', 'U': 'A', 'G': 'C', 'C': 'G'
  };
  return pairs[a.toUpperCase()] === b.toUpperCase();
}

// Calculate simple dot-bracket notation using Nussinov algorithm
// This is a simplified version that doesn't account for pseudoknots or complex structures
export function predictRnaStructure(rna: string): {
  dotBracket: string;
  pairs: [number, number][];
  mfe: number;
} {
  const seq = rna.toUpperCase();
  const n = seq.length;
  
  // Initialize dp matrix and traceback matrix
  const dp: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  const traceback: string[][] = Array(n).fill(0).map(() => Array(n).fill(''));
  
  // Fill dp matrix - Nussinov algorithm
  for (let l = 4; l < n; l++) {  // Min hairpin loop size is 3
    for (let i = 0; i < n - l; i++) {
      const j = i + l;
      
      // Case 1: i is unpaired
      dp[i][j] = dp[i+1][j];
      traceback[i][j] = 'L';
      
      // Case 2: j is unpaired
      if (dp[i][j] < dp[i][j-1]) {
        dp[i][j] = dp[i][j-1];
        traceback[i][j] = 'R';
      }
      
      // Case 3: i and j form a pair
      if (canPair(seq[i], seq[j]) && j - i > 3) {  // Check distance constraint
        if (dp[i][j] < dp[i+1][j-1] + 1) {
          dp[i][j] = dp[i+1][j-1] + 1;
          traceback[i][j] = 'P';
        }
      }
      
      // Case 4: bifurcation
      for (let k = i + 1; k < j; k++) {
        if (dp[i][j] < dp[i][k] + dp[k+1][j]) {
          dp[i][j] = dp[i][k] + dp[k+1][j];
          traceback[i][j] = k.toString();
        }
      }
    }
  }
  
  // Traceback to get dot-bracket notation
  const pairs: [number, number][] = [];
  let dotBracket = '.'.repeat(n);
  
  function traceStructure(i: number, j: number): void {
    if (i >= j) return;
    
    const tb = traceback[i][j];
    if (tb === 'L') {
      traceStructure(i+1, j);
    } else if (tb === 'R') {
      traceStructure(i, j-1);
    } else if (tb === 'P') {
      // i and j pair
      dotBracket = dotBracket.substring(0, i) + '(' + dotBracket.substring(i+1);
      dotBracket = dotBracket.substring(0, j) + ')' + dotBracket.substring(j+1);
      pairs.push([i, j]);
      traceStructure(i+1, j-1);
    } else {
      // Bifurcation
      const k = parseInt(tb);
      traceStructure(i, k);
      traceStructure(k+1, j);
    }
  }
  
  traceStructure(0, n-1);
  
  // Calculate a simple "minimum free energy" score (not actual MFE)
  // For visualization purposes only - real MFE would use energy parameters
  const mfe = -pairs.length * 2;  // Simple scoring: each pair contributes -2 energy
  
  return { dotBracket, pairs, mfe };
}

// Calculate base pairing probabilities (simplified)
export function calculatePairingProbabilities(
  rna: string
): { i: number; j: number; probability: number }[] {
  const seq = rna.toUpperCase();
  const n = seq.length;
  const probabilities: { i: number; j: number; probability: number }[] = [];
  
  // Generate the main structure
  const { pairs } = predictRnaStructure(seq);
  
  // Add the main structure pairs with high probability
  for (const [i, j] of pairs) {
    probabilities.push({ i, j, probability: 0.95 });
  }
  
  // Add some "alternative" pairs with lower probabilities
  for (let i = 0; i < n - 4; i++) {
    for (let j = i + 4; j < n; j++) {
      if (canPair(seq[i], seq[j])) {
        // Check if this pair is not already in the main structure
        if (!pairs.some(([a, b]) => (a === i && b === j))) {
          // Calculate a pseudo-probability based on distance
          // Pairs that are closer are more likely (simple heuristic)
          const distance = j - i;
          const probability = Math.min(0.7, 0.9 * Math.exp(-distance / 30));
          
          // Only add if probability is significant
          if (probability > 0.1) {
            probabilities.push({ i, j, probability });
          }
        }
      }
    }
  }
  
  return probabilities;
}

// Calculate coordinates for visualization (simple circular layout)
export function calculateRnaLayout(
  rna: string, 
  radius: number = 100
): { bases: { x: number; y: number; base: string }[]; pairs: { i: number; j: number; probability: number }[] } {
  const seq = rna.toUpperCase();
  const n = seq.length;
  const bases = [];
  
  // Calculate position for each base in a circular layout
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    bases.push({ x, y, base: seq[i] });
  }
  
  const pairs = calculatePairingProbabilities(rna);
  
  return { bases, pairs };
}

// Generate a simple mountain plot from dot-bracket notation
export function generateMountainPlot(
  dotBracket: string
): { x: number; y: number }[] {
  const plot: { x: number; y: number }[] = [];
  let height = 0;
  
  for (let i = 0; i < dotBracket.length; i++) {
    if (dotBracket[i] === '(') {
      height++;
    } else if (dotBracket[i] === ')') {
      height--;
    }
    plot.push({ x: i, y: height });
  }
  
  return plot;
}
