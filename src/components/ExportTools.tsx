import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import {
  exportToFASTA,
  exportToGenBank,
  exportToJSON,
  exportToTXT
} from '@/lib/export-utils';
import { CustomTooltip } from './CustomTooltip';

interface ExportToolsProps {
  sequence: string;
  elementId: string;
}

export function ExportTools({ sequence, elementId }: ExportToolsProps) {
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
      
      // Find a suitable element to capture for image/PDF exports
      let captureElement: HTMLElement | null = null;
      
      if (['png', 'svg', 'pdf'].includes(format)) {
        // First try with provided elementId
        if (elementId) {
          captureElement = document.getElementById(elementId);
        }
        
        // If not found, try finding the main content
        if (!captureElement) {
          // Try different selectors that might contain the visualization
          captureElement = document.querySelector('[data-state="active"]') as HTMLElement ||
                          document.querySelector('.tabs-content') as HTMLElement ||
                          document.querySelector('main') as HTMLElement;
        }
        
        // Last resort - use entire body
        if (!captureElement) {
          captureElement = document.body;
        }
        
        // Check if we found something
        if (!captureElement) {
          throw new Error(`Could not find any content to export as ${format}`);
        }
      }
      
      switch (format) {
        case 'fasta':
          exportToFASTA(sequence, sequenceName);
          break;
          
        case 'genbank':
          exportToGenBank(sequence, sequenceName);
          break;
          
        case 'png':
          if (captureElement) {
            const dataUrl = await htmlToImage.toPng(captureElement, { 
              quality: 1, 
              pixelRatio: 2,
              skipAutoScale: true,
              style: {
                // Force dark theme for consistent exports
                backgroundColor: '#000',
                color: '#fff'
              }
            });
            saveAs(dataUrl, `${sequenceName}.png`);
          }
          break;
          
        case 'svg':
          if (captureElement) {
            const dataUrl = await htmlToImage.toSvg(captureElement, { 
              quality: 1,
              skipAutoScale: true,
              style: {
                'background-color': '#000',
                'color': '#fff'
              }
            });
            saveAs(dataUrl, `${sequenceName}.svg`);
          }
          break;
          
        case 'pdf':
          if (captureElement) {
            const dataUrl = await htmlToImage.toPng(captureElement, { 
              quality: 1, 
              pixelRatio: 2,
              skipAutoScale: true,
              style: {
                'background-color': '#000',
                'color': '#fff'
              }
            });
            
            const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
            });
            
            const img = new Image();
            img.src = dataUrl;
            
            await new Promise<void>((resolve) => {
              img.onload = () => {
                const aspectRatio = img.width / img.height;
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                let imgWidth = pageWidth - 20; // Margins
                let imgHeight = imgWidth / aspectRatio;
                
                if (imgHeight > pageHeight - 30) {
                  imgHeight = pageHeight - 30;
                  imgWidth = imgHeight * aspectRatio;
                }
                
                const x = (pageWidth - imgWidth) / 2;
                const y = 20;
                
                // Add title
                pdf.setFontSize(14);
                pdf.text('CodonScope DNA Analysis', pageWidth / 2, 10, { align: 'center' });
                
                // Add sequence name
                pdf.setFontSize(10);
                pdf.text(`Sequence: ${sequenceName}`, pageWidth / 2, 15, { align: 'center' });
                
                // Add image
                pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
                
                // Add sequence info
                const infoY = y + imgHeight + 10;
                pdf.setFontSize(10);
                pdf.text(`Length: ${sequence.length} bp`, 10, infoY);
                
                // Add footer
                pdf.setFontSize(8);
                const today = new Date().toLocaleDateString();
                pdf.text(`Generated by CodonScope on ${today}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
                
                pdf.save(`${sequenceName}.pdf`);
                resolve();
              };
            });
          }
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
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Image & Document Formats</h4>
              <div className="flex flex-wrap gap-2">
                <CustomTooltip content="Export visualization as PNG image">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('png')}
                    disabled={isExporting || !sequence}
                    className="flex-1"
                  >
                    PNG
                  </Button>
                </CustomTooltip>
                
                <CustomTooltip content="Export visualization as SVG vector image">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('svg')}
                    disabled={isExporting || !sequence}
                    className="flex-1"
                  >
                    SVG
                  </Button>
                </CustomTooltip>
                
                <CustomTooltip content="Export report as PDF document">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting || !sequence}
                    className="flex-1"
                  >
                    PDF
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
            Note: Image and PDF exports capture the current view. Make sure the desired content is visible on screen.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
