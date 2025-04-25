"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DNASequenceInput } from "@/components/DNASequenceInput";
import { SequenceStats } from "@/components/SequenceStats";
import { SequenceTabs } from "@/components/SequenceTabs";
import { validateDNA, exampleDNA } from "@/lib/dna-utils";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const [dnaSequence, setDnaSequence] = useState("");
  const [analyzedSequence, setAnalyzedSequence] = useState("");
  const [comparisonSequence, setComparisonSequence] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Scroll-based effects
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  
  // Auto-analyze on sequence change after a short delay (for better UX)
  useEffect(() => {
    if (!dnaSequence || dnaSequence.length < 5) return;
    
    const timer = setTimeout(() => {
      if (validateDNA(dnaSequence)) {
        setAnalyzedSequence(dnaSequence);
        setError(null);
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [dnaSequence]);

  const handleSequenceChange = (newSequence: string) => {
    setDnaSequence(newSequence);
    setError(null);
  };

  const handleAnalyze = () => {
    if (!dnaSequence) {
      setError("Please enter a DNA sequence");
      return;
    }

    if (!validateDNA(dnaSequence)) {
      setError("Invalid DNA sequence. Only A, T, G, C are allowed.");
      return;
    }

    setAnalyzedSequence(dnaSequence);
    setError(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };
  
  // Add a mutated sequence for comparison
  const generateMutatedSequence = () => {
    if (!analyzedSequence) return;
    
    // Simple random mutation of ~5% of the sequence
    const bases = ['A', 'T', 'G', 'C'];
    const mutationRate = 0.05;
    const mutated = analyzedSequence.split('').map(base => {
      if (Math.random() < mutationRate) {
        // Choose a different base than the current one
        const otherBases = bases.filter(b => b !== base.toUpperCase());
        return otherBases[Math.floor(Math.random() * otherBases.length)];
      }
      return base;
    }).join('');
    
    setComparisonSequence(mutated);
  };

  return (
    <div className="min-h-screen pb-16 bg-background">
      {/* Header with parallax effect */}
      <motion.header 
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-border"
        style={{ 
          opacity: headerOpacity,
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(20, 20, 80, 0.15), transparent 60%)'
        }}
      >
        <div className="backdrop-blur-md bg-background/80">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                <span className="mr-2">🧬</span>
                CodonScope
              </span>
              <span className="hidden sm:block text-xs bg-secondary/20 py-1 px-2 rounded-full text-secondary-foreground">
                DNA Analysis Tool
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setDnaSequence(exampleDNA);
                  setAnalyzedSequence(exampleDNA);
                }}
                className="hidden sm:flex text-xs"
              >
                <span className="mr-1">🧪</span>
                Load Example
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleDarkMode}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="transition-transform hover:rotate-12"
              >
                {isDarkMode ? (
                  <span className="text-xl">🌞</span>
                ) : (
                  <span className="text-xl">🌙</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        {/* App intro section */}
        <motion.div 
          className="mb-12 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">DNA Sequence Analysis & Visualization</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Analyze genetic sequences with codon highlighting, amino acid translation, and advanced analytics 
          </p>
        </motion.div>
      
        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left column - Input area */}
          <div className="lg:col-span-3 space-y-8">
            {/* DNA Input Card */}
            <Card className="overflow-hidden border-primary/20 shadow-lg">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span>DNA Sequence Input</span>
                </CardTitle>
                <CardDescription>
                  Enter a DNA sequence (only A, T, G, C) to analyze its structure and properties
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <DNASequenceInput
                  value={dnaSequence}
                  onChange={handleSequenceChange}
                  onAnalyze={handleAnalyze}
                  error={error}
                />
              </CardContent>
            </Card>

            {/* Visualization area */}
            {analyzedSequence && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-5 bg-primary"></div>
                    <h2 className="text-xl font-semibold">Sequence Analysis</h2>
                  </div>
                  
                  {!comparisonSequence && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={generateMutatedSequence}
                      className="text-xs"
                    >
                      Generate Mutation
                    </Button>
                  )}
                </div>
                
                <Card className="border-primary/10">
                  <CardContent className="pt-6">
                    <SequenceTabs 
                      sequence={analyzedSequence} 
                      comparisonSequence={comparisonSequence || undefined} 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right column - Stats and info */}
          <div className="space-y-8">
            {/* Statistics */}
            {analyzedSequence && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <SequenceStats sequence={analyzedSequence} />
              </motion.div>
            )}

            {/* Color Legend Card */}
            <Card className="overflow-hidden bg-secondary/5 border-secondary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Scientific Color Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {/* DNA bases with updated scientific colors */}
                  <div className="p-2 rounded-md font-mono text-[#1D7874]">A: Adenine</div>
                  <div className="p-2 rounded-md font-mono text-[#8B1E3F]">T: Thymine</div>
                  <div className="p-2 rounded-md font-mono text-[#3D348B]">C: Cytosine</div>
                  <div className="p-2 rounded-md font-mono text-[#E3B23C]">G: Guanine</div>
                  
                  <div className="col-span-2 h-px bg-border my-1"></div>
                  
                  {/* Codon highlights with improved visual design */}
                  <div className="col-span-2 bg-[#1D7874]/20 ring-1 ring-[#1D7874]/30 p-2 rounded-md mb-1 flex justify-between items-center">
                    <span className="font-mono">ATG</span>
                    <span className="text-xs">Start Codon</span>
                  </div>
                  <div className="col-span-2 bg-[#8B1E3F]/20 ring-1 ring-[#8B1E3F]/30 p-2 rounded-md flex justify-between items-center">
                    <span className="font-mono">TAA/TAG/TGA</span>
                    <span className="text-xs">Stop Codons</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Card */}
            <Card className="bg-secondary/5 border-secondary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">About CodonScope</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  CodonScope is a modern, scientific web application for DNA sequence analysis 
                  and visualization. Explore genetic sequences with interactive tools designed for 
                  biology students, researchers, and educators.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      Codons
                    </span> 
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      Translation
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      GC Content
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      Mutations
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16 bg-muted/30 dark:bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-primary text-2xl">🧬</span>
                <h3 className="text-xl font-bold">CodonScope</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced DNA sequence analysis and visualization for education, research, and bioinformatics applications.
              </p>
              <p className="text-sm text-primary/80 font-medium">
                © {new Date().getFullYear()} CodonScope
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold">Features</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span> DNA Visualization</li>
                <li className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span> Reading Frame Analysis</li>
                <li className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span> Primer Design</li>
                <li className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span> Restriction Enzyme Analysis</li>
                <li className="flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span> RNA Secondary Structure</li>
              </ul>
            </div>

            {/* Links and Tech */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold">Technology</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">Next.js 15</span>
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">React 18</span>
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">TypeScript</span>
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">TailwindCSS</span>
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">shadcn/ui</span>
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">Framer Motion</span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  For education and research purposes only. Not for clinical use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
