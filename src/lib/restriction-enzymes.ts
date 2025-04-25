// Database of common restriction enzymes
// Format: { name, recognitionSequence, cutPosition (relative to start of recognition site), overhang, methylationSensitive }

export interface RestrictionEnzyme {
  name: string;
  recognitionSequence: string;
  cutPosition: number;  // 0-based position where the enzyme cuts
  overhang: 'blunt' | '5prime' | '3prime';
  methylationSensitive: boolean;
  source?: string;
  bufferCompatibility?: string[];
}

// Common restriction enzymes database
export const restrictionEnzymes: RestrictionEnzyme[] = [
  {
    name: "EcoRI",
    recognitionSequence: "GAATTC",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: true,
    source: "Escherichia coli",
    bufferCompatibility: ["NEB 1", "NEB 2", "NEB CutSmart"]
  },
  {
    name: "BamHI",
    recognitionSequence: "GGATCC",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: true,
    source: "Bacillus amyloliquefaciens",
    bufferCompatibility: ["NEB 3", "NEB CutSmart"] 
  },
  {
    name: "HindIII",
    recognitionSequence: "AAGCTT",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: true,
    source: "Haemophilus influenzae",
    bufferCompatibility: ["NEB 2", "NEB CutSmart"]
  },
  {
    name: "NotI",
    recognitionSequence: "GCGGCCGC",
    cutPosition: 2,
    overhang: '5prime',
    methylationSensitive: true,
    source: "Nocardia otitidis",
    bufferCompatibility: ["NEB 3", "NEB CutSmart"]
  },
  {
    name: "XhoI",
    recognitionSequence: "CTCGAG",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: true,
    source: "Xanthomonas holcicola",
    bufferCompatibility: ["NEB 2", "NEB CutSmart"]
  },
  {
    name: "SmaI",
    recognitionSequence: "CCCGGG",
    cutPosition: 3,
    overhang: 'blunt',
    methylationSensitive: true,
    source: "Serratia marcescens",
    bufferCompatibility: ["NEB 4"]
  },
  {
    name: "KpnI",
    recognitionSequence: "GGTACC",
    cutPosition: 5,
    overhang: '3prime',
    methylationSensitive: true,
    source: "Klebsiella pneumoniae",
    bufferCompatibility: ["NEB 1", "NEB CutSmart"]
  },
  {
    name: "SalI",
    recognitionSequence: "GTCGAC",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: true,
    source: "Streptomyces albus",
    bufferCompatibility: ["NEB 3", "NEB CutSmart"]
  },
  {
    name: "PstI",
    recognitionSequence: "CTGCAG",
    cutPosition: 5,
    overhang: '3prime',
    methylationSensitive: true,
    source: "Providencia stuartii",
    bufferCompatibility: ["NEB 3", "NEB CutSmart"]
  },
  {
    name: "EcoRV",
    recognitionSequence: "GATATC",
    cutPosition: 3,
    overhang: 'blunt',
    methylationSensitive: true,
    source: "Escherichia coli",
    bufferCompatibility: ["NEB 3", "NEB CutSmart"]
  },
  {
    name: "NcoI",
    recognitionSequence: "CCATGG",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: true,
    source: "Nocardia corallina",
    bufferCompatibility: ["NEB 3", "NEB CutSmart"]
  },
  {
    name: "SpeI",
    recognitionSequence: "ACTAGT",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: true,
    source: "Sphaerotilus species",
    bufferCompatibility: ["NEB 2", "NEB CutSmart"]
  },
  {
    name: "BglII",
    recognitionSequence: "AGATCT",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: true,
    source: "Bacillus globigii",
    bufferCompatibility: ["NEB 3", "NEB CutSmart"]
  },
  {
    name: "XbaI",
    recognitionSequence: "TCTAGA",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: true,
    source: "Xanthomonas badrii",
    bufferCompatibility: ["NEB 2", "NEB CutSmart"]
  },
  {
    name: "ApaI",
    recognitionSequence: "GGGCCC",
    cutPosition: 5,
    overhang: '3prime',
    methylationSensitive: false,
    source: "Acetobacter pasteurianus",
    bufferCompatibility: ["NEB 4"]
  },
  {
    name: "BsrGI",
    recognitionSequence: "TGTACA",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: false,
    source: "Bacillus stearothermophilus",
    bufferCompatibility: ["NEB 2", "NEB CutSmart"]
  },
  {
    name: "MluI",
    recognitionSequence: "ACGCGT",
    cutPosition: 1,
    overhang: '5prime',
    methylationSensitive: false,
    source: "Micrococcus luteus",
    bufferCompatibility: ["NEB 3", "NEB CutSmart"]
  },
  {
    name: "PvuII",
    recognitionSequence: "CAGCTG",
    cutPosition: 3,
    overhang: 'blunt',
    methylationSensitive: true,
    source: "Proteus vulgaris",
    bufferCompatibility: ["NEB 3", "NEB CutSmart"]
  },
  {
    name: "SacI",
    recognitionSequence: "GAGCTC",
    cutPosition: 5,
    overhang: '3prime',
    methylationSensitive: true,
    source: "Streptomyces achromogenes",
    bufferCompatibility: ["NEB 1", "NEB CutSmart"]
  },
  {
    name: "SphI",
    recognitionSequence: "GCATGC",
    cutPosition: 5,
    overhang: '3prime',
    methylationSensitive: true,
    source: "Streptomyces phaeochromogenes",
    bufferCompatibility: ["NEB 2", "NEB CutSmart"]
  }
];

// Find restriction sites in a DNA sequence
export function findRestrictionSites(
  sequence: string, 
  enzymes: RestrictionEnzyme[] = restrictionEnzymes
): { enzyme: RestrictionEnzyme; positions: number[] }[] {
  const upperSeq = sequence.toUpperCase();
  const results: { enzyme: RestrictionEnzyme; positions: number[] }[] = [];
  
  for (const enzyme of enzymes) {
    const recoSeq = enzyme.recognitionSequence.toUpperCase();
    const positions: number[] = [];
    
    // Find all occurrences of the recognition sequence
    let pos = upperSeq.indexOf(recoSeq);
    while (pos !== -1) {
      positions.push(pos);
      pos = upperSeq.indexOf(recoSeq, pos + 1);
    }
    
    if (positions.length > 0) {
      results.push({ enzyme, positions });
    }
  }
  
  // Sort results by number of cut sites (fewer cuts first)
  return results.sort((a, b) => a.positions.length - b.positions.length);
}

// Get fragments after digestion with one or more enzymes
export function simulateDigestion(
  sequence: string, 
  selectedEnzymes: RestrictionEnzyme[]
): { fragments: string[]; cutPositions: number[] } {
  const upperSeq = sequence.toUpperCase();
  
  // Find all cut positions for all selected enzymes
  let cutPositions: number[] = [];
  
  for (const enzyme of selectedEnzymes) {
    const recoSeq = enzyme.recognitionSequence.toUpperCase();
    
    // Find all occurrences of the recognition sequence
    let pos = upperSeq.indexOf(recoSeq);
    while (pos !== -1) {
      const cutPos = pos + enzyme.cutPosition;
      cutPositions.push(cutPos);
      pos = upperSeq.indexOf(recoSeq, pos + 1);
    }
  }
  
  // Remove duplicates and sort cut positions
  cutPositions = [...new Set(cutPositions)].sort((a, b) => a - b);
  
  // Generate fragments
  const fragments: string[] = [];
  let lastCutPos = 0;
  
  for (const cutPos of cutPositions) {
    fragments.push(upperSeq.substring(lastCutPos, cutPos));
    lastCutPos = cutPos;
  }
  
  // Add the last fragment
  if (lastCutPos < upperSeq.length) {
    fragments.push(upperSeq.substring(lastCutPos));
  }
  
  return { fragments, cutPositions };
}

// Simulate gel electrophoresis based on fragment sizes
export function simulateGelElectrophoresis(fragments: string[]): {
  size: number; 
  intensity: number; 
  sequence: string;
  lane: number;
}[] {
  return fragments
    .map((fragment, index) => ({
      size: fragment.length,
      // More intensity for larger fragments (simple model)
      intensity: Math.min(100, Math.max(20, fragment.length / 10)), 
      sequence: fragment,
      lane: index + 1
    }))
    .sort((a, b) => b.size - a.size); // Sort by decreasing size
}
