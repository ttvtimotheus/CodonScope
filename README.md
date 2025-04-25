# 🧬 CodonScope

A modern, biological web application for DNA sequence analysis and visualization. CodonScope allows users to analyze DNA sequences, visualize codons, identify start/stop codons, translate to amino acids, and calculate GC content with an interactive and educational interface.

## Features

- 🧪 DNA sequence input with validation (only A, T, G, C allowed)
- 🎨 Color-coded visualization of DNA bases (A=green, T=red, C=blue, G=yellow)
- 🔍 Highlighting of start codons (ATG) and stop codons (TAA, TAG, TGA)
- 🧩 Translation of DNA to amino acids (3-letter code)
- 📊 GC content calculation and visualization
- 🔄 Reverse complement display
- 🧫 Example sequence loading
- 🌙 Dark mode by default with light mode toggle

## Technology Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **Framer Motion** for animations
- **Zustand** for state management

## Target Audience

- Laboratory medicine apprentices
- Biology students
- Genetics educators
- Web developers interested in biovisualization

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
