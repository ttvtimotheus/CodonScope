// DNA sequence analysis utilities

// Codon to amino acid mapping (using 3-letter codes)
export const codonToAminoAcid: Record<string, string> = {
  // Start codon
  'ATG': 'Met',
  
  // Alanine
  'GCT': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
  
  // Arginine
  'CGT': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg', 'AGA': 'Arg', 'AGG': 'Arg',
  
  // Asparagine
  'AAT': 'Asn', 'AAC': 'Asn',
  
  // Aspartic Acid
  'GAT': 'Asp', 'GAC': 'Asp',
  
  // Cysteine
  'TGT': 'Cys', 'TGC': 'Cys',
  
  // Glutamic Acid
  'GAA': 'Glu', 'GAG': 'Glu',
  
  // Glutamine
  'CAA': 'Gln', 'CAG': 'Gln',
  
  // Glycine
  'GGT': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly',
  
  // Histidine
  'CAT': 'His', 'CAC': 'His',
  
  // Isoleucine
  'ATT': 'Ile', 'ATC': 'Ile', 'ATA': 'Ile',
  
  // Leucine
  'TTA': 'Leu', 'TTG': 'Leu', 'CTT': 'Leu', 'CTC': 'Leu', 'CTA': 'Leu', 'CTG': 'Leu',
  
  // Lysine
  'AAA': 'Lys', 'AAG': 'Lys',
  
  // Methionine (already defined as Start codon above)
  
  // Phenylalanine
  'TTT': 'Phe', 'TTC': 'Phe',
  
  // Proline
  'CCT': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
  
  // Serine
  'TCT': 'Ser', 'TCC': 'Ser', 'TCA': 'Ser', 'TCG': 'Ser', 'AGT': 'Ser', 'AGC': 'Ser',
  
  // Threonine
  'ACT': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
  
  // Tryptophan
  'TGG': 'Trp',
  
  // Tyrosine
  'TAT': 'Tyr', 'TAC': 'Tyr',
  
  // Valine
  'GTT': 'Val', 'GTC': 'Val', 'GTA': 'Val', 'GTG': 'Val',
  
  // Stop codons
  'TAA': 'Stop', 'TAG': 'Stop', 'TGA': 'Stop'
};

// Check if a codon is a start codon
export const isStartCodon = (codon: string): boolean => {
  return codon === 'ATG';
};

// Check if a codon is a stop codon
export const isStopCodon = (codon: string): boolean => {
  return codon === 'TAA' || codon === 'TAG' || codon === 'TGA';
};

// Calculate GC content of a DNA sequence
export const calculateGCContent = (sequence: string): number => {
  if (!sequence) return 0;
  
  const gc = sequence.split('').filter(base => base === 'G' || base === 'C').length;
  return parseFloat(((gc / sequence.length) * 100).toFixed(2));
};

// Get color for each DNA base - using scientific, visually pleasing color values
export const getBaseColor = (base: string): string => {
  switch (base.toUpperCase()) {
    case 'A': return 'text-[#1D7874]'; // Darker, more professional green
    case 'T': return 'text-[#8B1E3F]'; // Wine red instead of bright red
    case 'C': return 'text-[#3D348B]'; // Indigo blue instead of bright blue
    case 'G': return 'text-[#E3B23C]'; // Muted ochre instead of bright yellow
    case 'U': return 'text-[#8B1E3F]'; // Same as T for RNA
    default: return 'text-gray-400';
  }
};

// Get background color for each codon with improved visibility
export const getCodonBackground = (codon: string): string => {
  if (isStartCodon(codon)) {
    return 'bg-[#1D7874]/30 ring-2 ring-[#1D7874]/70';
  } else if (isStopCodon(codon)) {
    return 'bg-[#8B1E3F]/30 ring-2 ring-[#8B1E3F]/70';
  }
  return 'bg-gray-900/30';
};

// Validate DNA sequence (only A, T, G, C allowed)
export const validateDNA = (sequence: string): boolean => {
  return /^[ATGC]+$/i.test(sequence);
};

// Split DNA into codons (groups of 3) with optional grouping
export const splitIntoCodons = (sequence: string, groupSize: number = 0): Array<string[]> => {
  const codons: string[] = [];
  for (let i = 0; i < sequence.length; i += 3) {
    const codon = sequence.slice(i, i + 3);
    if (codon.length === 3) {
      codons.push(codon);
    } else {
      // Handle incomplete codons at the end
      codons.push(codon.padEnd(3, '-'));
    }
  }
  
  // Group codons for better readability if groupSize > 0
  if (groupSize > 0) {
    const groupedCodons: Array<string[]> = [];
    for (let i = 0; i < codons.length; i += groupSize) {
      groupedCodons.push(codons.slice(i, i + groupSize));
    }
    return groupedCodons;
  }
  
  // Return each codon as its own group if no grouping
  return codons.map(codon => [codon]);
};

// Translate DNA sequence to amino acids starting from first ATG until stop codon
export const translateDNA = (sequence: string): string[] => {
  const upperSeq = sequence.toUpperCase();
  const flatCodons = splitIntoCodons(upperSeq).flat();
  
  // Find the first start codon (ATG)
  const startIndex = flatCodons.findIndex(codon => isStartCodon(codon));
  
  if (startIndex === -1) {
    return []; // No start codon found
  }
  
  const aminoAcids: string[] = [];
  for (let i = startIndex; i < flatCodons.length; i++) {
    const codon = flatCodons[i];
    // Handle incomplete codons
    if (codon.includes('-')) {
      break;
    }
    
    const aa = codonToAminoAcid[codon] || '???';
    
    // Stop translation if we hit a stop codon
    if (aa === 'Stop') {
      break;
    }
    
    aminoAcids.push(aa);
  }
  
  return aminoAcids;
};

// Get reverse complement of DNA sequence
export const getReverseComplement = (sequence: string): string => {
  const complement: Record<string, string> = {
    'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G',
    'a': 't', 't': 'a', 'g': 'c', 'c': 'g',
  };
  
  return sequence
    .split('')
    .map(base => complement[base] || base)
    .reverse()
    .join('');
};

// Example DNA sequence
export const exampleDNA = 'ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATTATGTCTGCATCGTTAAAGTCGATGTCGATCGCCGGAATGTCTTGGATCATGTAAGTCTAG';
