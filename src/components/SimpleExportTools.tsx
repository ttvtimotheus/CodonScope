import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { saveAs } from 'file-saver';
import { CustomTooltip } from './CustomTooltip';

// Simple utility functions for export
const exportToFASTA = (sequence: string, name: string): void => {
  const header = `>${name}`;
  const formattedSequence = sequence.match(/.{1,60}/g)?.join('\n') || sequence;
  const fastaContent = `${header}\n${formattedSequence}`;
  
  const blob = new Blob([fastaContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${name}.fasta`);
};

const exportToGenBank = (sequence: string, name: string): void => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  // Format sequence according to GenBank standards
  const formattedSequence = formatGenBankSequence(sequence);
  
  let genBankContent = `LOCUS       ${name.padEnd(16)}${sequence.length} bp    DNA     linear   SYN ${date}\n`;
  genBankContent += `DEFINITION  Exported from CodonScope\n`;
  genBankContent += `ACCESSION   Unknown\n`;
  genBankContent += `VERSION     1.0\n`;
  genBankContent += `SOURCE      Unknown\n`;
  genBankContent += `  ORGANISM  Unknown\n`;
  
  genBankContent += 'REFERENCES   1  (bases 1 to ' + sequence.length + ')\n';
  genBankContent += `  AUTHORS   CodonScope User\n`;
  genBankContent += `  TITLE     DNA Sequence Analysis\n`;
  genBankContent += `  JOURNAL   Unpublished\n`;
  
  genBankContent += 'FEATURES             Location/Qualifiers\n';
  genBankContent += '     source          1..' + sequence.length + '\n';
  genBankContent += '                     /organism="Unknown"\n';
  genBankContent += '                     /mol_type="genomic DNA"\n';
  genBankContent += 'ORIGIN\n';
  genBankContent += formattedSequence;
  genBankContent += '//\n';
  
  const blob = new Blob([genBankContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${name}.gb`);
};

const formatGenBankSequence = (sequence: string): string => {
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
};

const exportToJSON = (data: any, name: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${name}.json`);
};

const exportToTXT = (text: string, name: string): void => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${name}.txt`);
};

interface SimpleExportToolsProps {
  sequence: string;
}

export function SimpleExportTools({ sequence }: SimpleExportToolsProps) {
  const [sequenceName, setSequenceName] = useState('DNA_Sequence');
  const [exportStatus, setExportStatus] = useState<null | { success: boolean; message: string }>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async (format: string) => {
    if (!sequence) {
      setExportStatus({
        success: false,
        message: 'No sequence available to export'
      });
      return;
    }
    
    try {
      setIsExporting(true);
      setExportStatus(null);
      
      switch (format) {
        case 'fasta':
          exportToFASTA(sequence, sequenceName);
          break;
          
        case 'genbank':
          exportToGenBank(sequence, sequenceName);
          break;
          
        case 'json':
          exportToJSON({
            name: sequenceName,
            sequence,
            length: sequence.length,
            date: new Date().toISOString()
          }, sequenceName);
          break;
          
        case 'txt':
          exportToTXT(sequence, sequenceName);
          break;
          
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      setExportStatus({
        success: true,
        message: `Successfully exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      setExportStatus({
        success: false,
        message: `Failed to export as ${format.toUpperCase()}: ${(error as Error).message}`
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Export Tools</h3>
            {exportStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm px-3 py-1 rounded-md ${
                  exportStatus.success 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                {exportStatus.message}
              </motion.div>
            )}
          </div>
          
          <div className="grid gap-4">
            <div>
              <Label htmlFor="sequence-name" className="mb-1 block text-sm">Sequence Name</Label>
              <Input
                id="sequence-name"
                value={sequenceName}
                onChange={(e) => setSequenceName(e.target.value)}
                placeholder="Enter a name for your sequence"
                className="w-full"
              />
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Bioinformatics Formats</h4>
              <div className="flex flex-wrap gap-2">
                <CustomTooltip content="Export as FASTA format, widely used for sequence data">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('fasta')}
                    disabled={isExporting || !sequence}
                    className="flex-1"
                  >
                    FASTA
                  </Button>
                </CustomTooltip>
                
                <CustomTooltip content="Export as GenBank format with annotations">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('genbank')}
                    disabled={isExporting || !sequence}
                    className="flex-1"
                  >
                    GenBank
                  </Button>
                </CustomTooltip>
                
                <CustomTooltip content="Export as plain text">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('txt')}
                    disabled={isExporting || !sequence}
                    className="flex-1"
                  >
                    Text
                  </Button>
                </CustomTooltip>
                
                <CustomTooltip content="Export as JSON with sequence metadata">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('json')}
                    disabled={isExporting || !sequence}
                    className="flex-1"
                  >
                    JSON
                  </Button>
                </CustomTooltip>
              </div>
            </div>
          </div>
          
          {isExporting && (
            <div className="text-center text-sm text-muted-foreground py-2">
              Exporting, please wait...
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-2">
            <p>This simplified export tool focuses on standard bioinformatics file formats.</p>
            <p className="mt-1">Image and PDF exports are currently unavailable due to technical limitations.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
