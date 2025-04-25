import { saveAs } from 'file-saver';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Exports the DNA sequence in FASTA format
 */
export function exportToFASTA(sequence: string, sequenceName: string = 'DNA_Sequence'): void {
  const header = `>${sequenceName}`;
  // Split sequence into 60 character lines (FASTA standard)
  const formattedSequence = sequence.match(/.{1,60}/g)?.join('\n') || sequence;
  const fastaContent = `${header}\n${formattedSequence}`;
  
  const blob = new Blob([fastaContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${sequenceName}.fasta`);
}

/**
 * Exports the DNA sequence in GenBank format
 */
export function exportToGenBank(
  sequence: string, 
  sequenceName: string = 'DNA_Sequence', 
  metadata: {
    definition?: string;
    accession?: string;
    version?: string;
    source?: string;
    organism?: string;
    reference?: string;
    authors?: string;
    title?: string;
    journal?: string;
  } = {}
): void {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  // Format sequence according to GenBank standards
  const formattedSequence = formatGenBankSequence(sequence);
  
  let genBankContent = `LOCUS       ${sequenceName.padEnd(16)}${sequence.length} bp    DNA     linear   SYN ${date}\n`;
  genBankContent += `DEFINITION  ${metadata.definition || 'Exported from CodonScope'}\n`;
  genBankContent += `ACCESSION   ${metadata.accession || 'Unknown'}\n`;
  genBankContent += `VERSION     ${metadata.version || '1.0'}\n`;
  genBankContent += `SOURCE      ${metadata.source || 'Unknown'}\n`;
  genBankContent += `  ORGANISM  ${metadata.organism || 'Unknown'}\n`;
  
  if (metadata.reference || metadata.authors || metadata.title || metadata.journal) {
    genBankContent += 'REFERENCES   1  (bases 1 to ' + sequence.length + ')\n';
    genBankContent += `  AUTHORS   ${metadata.authors || 'CodonScope User'}\n`;
    genBankContent += `  TITLE     ${metadata.title || 'DNA Sequence Analysis'}\n`;
    genBankContent += `  JOURNAL   ${metadata.journal || 'Unpublished'}\n`;
  }
  
  genBankContent += 'FEATURES             Location/Qualifiers\n';
  genBankContent += '     source          1..' + sequence.length + '\n';
  genBankContent += '                     /organism="' + (metadata.organism || 'Unknown') + '"\n';
  genBankContent += '                     /mol_type="genomic DNA"\n';
  genBankContent += 'ORIGIN\n';
  genBankContent += formattedSequence;
  genBankContent += '//\n';
  
  const blob = new Blob([genBankContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${sequenceName}.gb`);
}

/**
 * Helper function to format DNA sequence as per GenBank format
 */
function formatGenBankSequence(sequence: string): string {
  let formatted = '';
  let sequenceIndex = 0;
  
  // GenBank format: 6 blocks of 10 nucleotides per line, with line numbers
  while (sequenceIndex < sequence.length) {
    // Add line number
    formatted += `${(sequenceIndex + 1).toString().padStart(9, ' ')}`;
    
    // Add 6 blocks of 10 nucleotides
    for (let blockIndex = 0; blockIndex < 6; blockIndex++) {
      if (sequenceIndex >= sequence.length) break;
      
      const end = Math.min(sequenceIndex + 10, sequence.length);
      const block = sequence.slice(sequenceIndex, end);
      formatted += ` ${block.toLowerCase()}`;
      sequenceIndex = end;
      
      if (sequenceIndex >= sequence.length) break;
    }
    
    formatted += '\n';
  }
  
  return formatted;
}

/**
 * Exports an HTML element to an image file (PNG)
 */
export async function exportToPNG(elementId: string, fileName: string = 'dna_analysis'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with ID "${elementId}" not found`);
  
  try {
    const dataUrl = await htmlToImage.toPng(element, { quality: 1, pixelRatio: 2 });
    saveAs(dataUrl, `${fileName}.png`);
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw error;
  }
}

/**
 * Exports an HTML element to an SVG file
 */
export async function exportToSVG(elementId: string, fileName: string = 'dna_analysis'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with ID "${elementId}" not found`);
  
  try {
    const dataUrl = await htmlToImage.toSvg(element, { quality: 1 });
    saveAs(dataUrl, `${fileName}.svg`);
  } catch (error) {
    console.error('Error exporting to SVG:', error);
    throw error;
  }
}

/**
 * Exports an HTML element to a PDF file
 */
export async function exportToPDF(elementId: string, fileName: string = 'dna_analysis'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with ID "${elementId}" not found`);
  
  try {
    // First convert element to PNG image
    const dataUrl = await htmlToImage.toPng(element, { quality: 1, pixelRatio: 2 });
    
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
    });
    
    // Calculate aspect ratio
    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve) => {
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate dimensions to fit on page while preserving aspect ratio
        let imgWidth = pageWidth - 20; // Margins
        let imgHeight = imgWidth / aspectRatio;
        
        // If height is too large, scale down
        if (imgHeight > pageHeight - 20) {
          imgHeight = pageHeight - 20;
          imgWidth = imgHeight * aspectRatio;
        }
        
        // Center image on page
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        
        // Add title
        pdf.setFontSize(14);
        pdf.text('CodonScope DNA Analysis', pageWidth / 2, 10, { align: 'center' });
        
        // Add image
        pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
        
        // Add footer
        pdf.setFontSize(8);
        const today = new Date().toLocaleDateString();
        pdf.text(`Generated by CodonScope on ${today}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        
        // Save PDF
        pdf.save(`${fileName}.pdf`);
        resolve();
      };
    });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

/**
 * Exports JSON data to a file
 */
export function exportToJSON(data: any, fileName: string = 'dna_data'): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${fileName}.json`);
}

/**
 * Exports plain text
 */
export function exportToTXT(text: string, fileName: string = 'dna_sequence'): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${fileName}.txt`);
}
