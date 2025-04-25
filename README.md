<div align="center">

# 🧬 CodonScope

### Advanced DNA Analysis & Visualization Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

<img src="/public/codonscope-preview.png" alt="CodonScope Preview" width="650px" />

</div>

## 📋 Overview

CodonScope is a comprehensive bioinformatics web application designed for DNA sequence analysis and visualization. Built with modern web technologies, it provides an interactive and educational interface for biologists, students, and researchers to analyze genetic sequences.

### ✨ Key Features

#### 🧪 Core DNA Analysis
- **DNA Sequence Validation**: Input sequences with real-time validation (A, T, G, C bases)
- **Scientific Color Coding**: Industry-standard base coloring (A=green, T=red, C=blue, G=yellow)
- **Codon Visualization**: Interactive display with grouping options (3, 5, or 10 codons)
- **Highlight System**: Automatic marking of start codons (ATG) and stop codons (TAA, TAG, TGA)
- **Reverse Complement**: One-click generation of reverse complementary sequences

#### 🔬 Advanced Bioinformatics Tools
- **Reading Frame Analysis**: Visualization of all three reading frames with ORF detection
- **Primer Design Tool**: Automatic primer generation with customizable parameters
- **Restriction Enzyme Analysis**: Enzyme database, site visualization, and gel electrophoresis simulation
- **RNA Secondary Structure Prediction**: Interactive circle and mountain plot visualizations

#### 📊 Data Insights
- **Sequence Statistics**: Nucleotide composition, GC content, codon usage tables
- **Circular GC Content Chart**: Visual representation of GC distribution
- **Amino Acid Translation**: Color-coded protein sequence with property annotations

#### 📤 Export Capabilities
- **Bioinformatics Formats**: FASTA, GenBank exports with proper formatting
- **Data Formats**: JSON, TXT exports for further processing

## 🔧 Technology Stack

- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript for enhanced type safety
- **Styling**: TailwindCSS with shadcn/ui components
- **Animation**: Framer Motion for smooth transitions
- **UI Components**: Custom scientific visualizations
- **Dependencies**: file-saver for exports

## 👩‍🔬 Target Audience

- **Educational**: Biology students, genetics educators
- **Professional**: Bioinformaticians, laboratory researchers
- **Medical**: Laboratory medicine practitioners
- **Technical**: Developers interested in biological visualization

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/codonscope.git
cd codonscope

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🧩 Project Structure

```
src/
├── app/             # Next.js app router files
├── components/      # React components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Feature components (CodonVisualization, etc.)
├── lib/             # Utility functions
│   ├── dna-utils.ts # DNA processing utilities
│   └── ...          # Other utilities
└── ...
```

## 📚 Documentation

### DNA Analysis Workflow

1. **Input DNA Sequence**: Enter or paste a valid DNA sequence 
2. **Automatic Analysis**: View codons, amino acids, and statistical information
3. **Advanced Analysis**: Use specialized tabs for deeper analysis:
   - Reading Frame Analysis for ORF detection
   - Primer Design for PCR applications
   - Restriction Analysis for enzyme digestion simulation
   - RNA Structure for secondary structure prediction
4. **Export Results**: Save analysis in various formats for documentation or further processing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For questions or feedback, please open an issue in the GitHub repository.

---

<div align="center">

**CodonScope** - Advanced DNA Analysis for Everyone

</div>
