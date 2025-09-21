'use client';

import React from 'react';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, User, Building, Globe } from "lucide-react";

export interface ReportData {
  userQuery: string;
  aiResponse: string;
  timestamp: string;
  reportId: string;
  analysisType?: string;
  dataPoints?: number;
  imageData?: string;
}

// Helper function to load images with CORS support
const loadImage = async (url: string, retries = 3, delay = 1000): Promise<HTMLImageElement> => {
  for (let i = 0; i < retries; i++) {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      const cachedUrl = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      
      const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
          if (img.complete && img.naturalWidth > 0) {
            resolve(img);
          } else {
            reject(new Error('Image failed to load properly'));
          }
        };
        img.onerror = (err) => reject(new Error('Image load error'));
        img.src = cachedUrl;
      });
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Image load timeout')), 10000)
      );
      
      return await Promise.race([loadPromise, timeoutPromise]);
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed to load image:`, err);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Failed to load image after ${retries} attempts`);
};

// Function to add FloatChat watermark
const addFloatChatWatermark = (pdf: any) => {
  // Save current graphics state
  pdf.saveGraphicsState();
  
  // Set transparency (0.1 = 10% opacity)
  pdf.setGState(pdf.GState({ opacity: 0.1 }));
  
  // Set font and color for watermark
  pdf.setFontSize(48);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100); // Gray color
  
  // Calculate center position and rotation
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  // Rotate and add watermark text
  pdf.text('FloatChat', centerX, centerY, {
    align: 'center',
    angle: -45, // 45-degree rotation backwards (diagonal)
    baseline: 'middle'
  });
  
  // Restore graphics state
  pdf.restoreGraphicsState();
};

// Standalone function to generate reports
export const generateReport = async (
  data: ReportData,
  onGenerate?: (success: boolean, error?: Error) => void,
  logoUrl: string = '/images/incois-logo.png'
): Promise<void> => {
    try {
      // Create PDF
      const pdf = new (jsPDF as any)({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Load the INCOIS logo with error handling
      let logo: HTMLImageElement | null = null;
      try {
        logo = await loadImage(logoUrl);
      } catch (err) {
        console.error('Failed to load logo, using fallback text', err);
      }
      
      // Page 1 - Cover
      pdf.setFillColor(240, 248, 255); // Light blue background
      pdf.rect(0, 0, 210, 297, 'F');
      
      // Add compact logo to cover page
      if (logo) {
        try {
          const logoWidth = 40;
          const logoHeight = 20;
          const xPos = (210 - logoWidth) / 2;
          pdf.addImage(logo, 'PNG', xPos, 25, logoWidth, logoHeight);
        } catch (err) {
          console.error('Error adding logo to PDF:', err);
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text('INCOIS', 105, 35, { align: 'center' });
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Indian National Centre for Ocean Information Services', 105, 42, { align: 'center' });
        }
      } else {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INCOIS', 105, 35, { align: 'center' });
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Indian National Centre for Ocean Information Services', 105, 42, { align: 'center' });
      }
      
      // Title and subtitle
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI-Generated Oceanographic Analysis Report', 105, 60, { align: 'center' });
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Report ID: ${data.reportId}`, 105, 70, { align: 'center' });
      
      // Query information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('User Query:', 105, 90, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const queryLines = pdf.splitTextToSize(data.userQuery, 160);
      let yPos = 100;
      queryLines.forEach((line: string) => {
        pdf.text(line, 105, yPos, { align: 'center' });
        yPos += 5;
      });
      
      // Author information
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated by', 105, yPos, { align: 'center' });
      
      yPos += 10;
      pdf.setFontSize(10);
      pdf.text('INCOIS AI Assistant', 105, yPos, { align: 'center' });
      pdf.text('Ocean Observation Network Division (OOND)', 105, yPos + 10, { align: 'center' });
      pdf.text('INCOIS, Ministry of Earth Sciences', 105, yPos + 20, { align: 'center' });
      pdf.text('Government of India', 105, yPos + 30, { align: 'center' });
      
      // Date
      const currentDate = new Date(data.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(`Generated on: ${currentDate}`, 105, yPos + 50, { align: 'center' });
      
      // Add INCOIS address in footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('INDIAN NATIONAL CENTRE FOR OCEAN INFORMATION SERVICES (INCOIS)', 105, 285, { align: 'center' });
      pdf.text('Ministry of Earth Sciences, Govt. of India, "Ocean Valley", P.B.No. 21, IDA Jeedimetla, Hyderabad - 500 055, India', 105, 290, { align: 'center' });
      
      // Page number
      pdf.text('1', 20, 20);
      
      // Add FloatChat watermark to cover page
      addFloatChatWatermark(pdf);
      
      // Page 2 - Analysis Results
      pdf.addPage();
      
      // Add FloatChat watermark to analysis page
      addFloatChatWatermark(pdf);
      
      // Add header with logo and title
      if (logo) {
        try {
          const smallLogoWidth = 15;
          const smallLogoHeight = 8;
          pdf.addImage(logo, 'PNG', 20, 15, smallLogoWidth, smallLogoHeight);
        } catch (err) {
          console.error('Error adding header logo:', err);
        }
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('INCOIS - AI Analysis Report', 40, 20);
      
      // Document title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ANALYSIS RESULTS', 105, 40, { align: 'center' });
      
      // Add a line separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 45, 190, 45);
      
      // Report details
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const details = [
        ['Report ID:', data.reportId],
        ['Query Type:', data.analysisType || 'General Oceanographic Query'],
        ['Generated by:', 'INCOIS AI Assistant'],
        ['Data Points Analyzed:', data.dataPoints?.toString() || 'N/A'],
        ['Processing Time:', new Date(data.timestamp).toLocaleTimeString()],
        ['Classification:', 'AI-Generated Technical Analysis'],
        ['Distribution:', 'Internal Use']
      ];
      
      yPos = 60;
      details.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPos);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(value, 120);
        pdf.text(lines, 70, yPos);
        yPos += Math.max(5, lines.length * 5);
      });
      
      // AI Response Section
      yPos += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI ANALYSIS RESPONSE:', 20, yPos);
      yPos += 7;
      
      pdf.setFont('helvetica', 'normal');
      const responseLines = pdf.splitTextToSize(data.aiResponse, 170);
      responseLines.forEach((line: string) => {
        if (yPos > 250) { // Check if we need a new page
          pdf.addPage();
          yPos = 30;
          
          // Add FloatChat watermark to new page
          addFloatChatWatermark(pdf);
          
          // Add header to new page
          if (logo) {
            try {
              pdf.addImage(logo, 'PNG', 20, 15, 15, 8);
            } catch (err) {
              console.error('Error adding header logo:', err);
            }
          }
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('INCOIS - AI Analysis Report (Continued)', 40, 20);
          pdf.setFont('helvetica', 'normal');
        }
        
        pdf.text(line, 20, yPos);
        yPos += 5;
      });
      
      // Add image if available
      if (data.imageData) {
        yPos += 10;
        if (yPos > 200) {
          pdf.addPage();
          yPos = 30;
          
          // Add FloatChat watermark to new page
          addFloatChatWatermark(pdf);
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('GENERATED VISUALIZATION:', 20, yPos);
        yPos += 10;
        
        try {
          const imgWidth = 170;
          const imgHeight = 100; // Fixed height for consistency
          pdf.addImage(`data:image/png;base64,${data.imageData}`, 'PNG', 20, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 10;
        } catch (err) {
          console.error('Error adding image to PDF:', err);
          pdf.text('Error: Could not include generated visualization', 20, yPos);
          yPos += 10;
        }
      }
      
      // Add footer with logo and page number on all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        if (logo && i > 1) {
          try {
            pdf.addImage(logo, 'PNG', 20, 275, 12, 6);
          } catch (err) {
            console.error('Error adding footer logo:', err);
          }
        }
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INDIAN NATIONAL CENTRE FOR OCEAN INFORMATION SERVICES (INCOIS)', 105, 285, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.text('Ministry of Earth Sciences, Govt. of India, "Ocean Valley", P.B.No. 21, IDA Jeedimetla, Hyderabad - 500 055, India', 105, 290, { align: 'center' });
        
        // Page number
        pdf.text(`${i}`, 20, 20);
      }
      
      // Save the PDF
      const fileName = `INCOIS_AI_Report_${data.reportId}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      onGenerate?.(true);
    } catch (error) {
      console.error('Report generation failed:', error);
      onGenerate?.(false, error as Error);
    }
  };

export const ReportPreview: React.FC<{ data: ReportData; onGenerateReport: () => void }> = ({ 
  data, 
  onGenerateReport 
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 my-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Official Analysis Report</h3>
            <p className="text-sm text-blue-700">AI-Generated Oceanographic Analysis</p>
          </div>
        </div>
        <Button
          onClick={onGenerateReport}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Generate PDF
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Calendar className="w-4 h-4" />
          <span>Generated: {new Date(data.timestamp).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <User className="w-4 h-4" />
          <span>Report ID: {data.reportId}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Building className="w-4 h-4" />
          <span>INCOIS AI Assistant</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Globe className="w-4 h-4" />
          <span>Official Government Report</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border border-blue-100">
        <h4 className="font-medium text-gray-900 mb-2">Query Summary:</h4>
        <p className="text-sm text-gray-700 mb-3">{data.userQuery}</p>
        
        <h4 className="font-medium text-gray-900 mb-2">Analysis Preview:</h4>
        <p className="text-sm text-gray-700 line-clamp-3">
          {data.aiResponse.substring(0, 200)}...
        </p>
      </div>
      
      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> This report will be generated as an official INCOIS document with proper formatting, 
          logos, and government authentication. The PDF will include the complete analysis, metadata, and any 
          generated visualizations.
        </p>
      </div>
    </div>
  );
};

// Default export for the generateReport function
export default generateReport;
