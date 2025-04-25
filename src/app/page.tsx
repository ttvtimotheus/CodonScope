"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DNASequenceInput } from "@/components/DNASequenceInput";
import { CodonVisualization } from "@/components/CodonVisualization";
import { AminoAcidVisualization } from "@/components/AminoAcidVisualization";
import { SequenceStats } from "@/components/SequenceStats";
import { SequenceTabs } from "@/components/SequenceTabs";
import { validateDNA } from "@/lib/dna-utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  const [dnaSequence, setDnaSequence] = useState("");
  const [analyzedSequence, setAnalyzedSequence] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">🧬 CodonScope</span>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <span className="text-xl">🌞</span>
            ) : (
              <span className="text-xl">🌙</span>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Input and info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>DNA Sequence Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <DNASequenceInput
                  value={dnaSequence}
                  onChange={handleSequenceChange}
                  onAnalyze={handleAnalyze}
                  error={error}
                />
              </CardContent>
            </Card>

            {analyzedSequence && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Sequence Visualization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SequenceTabs sequence={analyzedSequence} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right column - Stats and legend */}
          <div className="space-y-6">
            {analyzedSequence && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <SequenceStats sequence={analyzedSequence} />
              </motion.div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Color Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {/* DNA bases */}
                  <div className="font-mono text-green-500 font-bold">A: Adenine</div>
                  <div className="font-mono text-red-500 font-bold">T: Thymine</div>
                  <div className="font-mono text-blue-500 font-bold">C: Cytosine</div>
                  <div className="font-mono text-yellow-500 font-bold">G: Guanine</div>
                  
                  <div className="col-span-2 h-px bg-border my-2"></div>
                  
                  {/* Codon background */}
                  <div className="col-span-2 bg-green-800/30 p-2 rounded-md mb-1">
                    <span className="font-mono">ATG: Start Codon</span>
                  </div>
                  <div className="col-span-2 bg-red-800/30 p-2 rounded-md">
                    <span className="font-mono">TAA/TAG/TGA: Stop Codons</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About CodonScope</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  CodonScope is a modern, biological web application for DNA sequence analysis 
                  and visualization. Explore DNA sequences, codons, amino acids, and more with 
                  this interactive tool designed for biology students and professionals.
                </p>
                <div className="mt-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-muted-foreground">Created for:</span> 
                    <span>Biologie-Interessierte</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto p-4 text-center text-sm text-muted-foreground">
          <p>CodonScope © {new Date().getFullYear()} | Made with Next.js, TailwindCSS, and shadcn/ui</p>
        </div>
      </footer>
    </div>
  );
}
