'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Type definitions for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    setFillColor(r: number, g: number, b: number): void;
    rect(x: number, y: number, w: number, h: number, style?: string): void;
    addImage(imageData: string | HTMLImageElement, format: string, x: number, y: number, w: number, h: number): void;
    setTextColor(r: number, g: number, b: number): void;
    setFontSize(size: number): void;
    setFont(font: string, style?: string): void;
    text(text: string, x: number, y: number, options?: { align?: string }): void;
    addPage(format?: string, orientation?: string): void;
    setDrawColor(r: number, g: number, b: number): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    splitTextToSize(text: string, maxWidth: number): string[];
    save(filename: string): void;
  }
}

export interface PDFExportData {
  selectedRegion: string;
  timeRange: string;
  activeTab: string;
  filteredData: any[];
  totalProfiles?: number;
  avgTemperature?: number;
  avgSalinity?: number;
  regionCount?: number;
}

export interface PDFExporterProps {
  data: PDFExportData;
  onExport?: (success: boolean, error?: Error) => void;
  fileName?: string;
  logoUrl?: string;
  children: (exportFunction: () => Promise<void>) => React.ReactNode;
}

// Helper function to load images with CORS support and retry logic
const loadImage = async (url: string, retries = 3, delay = 1000): Promise<HTMLImageElement> => {
  for (let i = 0; i < retries; i++) {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      // Add cache buster to prevent caching issues
      const cachedUrl = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      
      const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
          // Ensure image is fully loaded
          if (img.complete && img.naturalWidth > 0) {
            resolve(img);
          } else {
            reject(new Error('Image failed to load properly'));
          }
        };
        img.onerror = (err) => reject(new Error('Image load error'));
        img.src = cachedUrl;
      });
      
      // Add timeout to prevent hanging
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

const PDFExporter: React.FC<PDFExporterProps> = ({
  data,
  onExport,
  fileName,
  logoUrl = '/images/incois-logo.png',
  children
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExport = async (): Promise<void> => {
    if (!contentRef.current) {
      const error = new Error('Content reference not found');
      onExport?.(false, error);
      return;
    }

    try {
      // Hide elements with no-export class before capturing
      const exportElements = document.querySelectorAll('.no-export');
      exportElements.forEach(el => {
        (el as HTMLElement).style.visibility = 'hidden';
      });

      // Capture the content as an image with better error handling
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight,
        ignoreElements: (element) => {
          return element.classList.contains('no-export') || 
                 element.tagName === 'BUTTON' ||
                 element.classList.contains('no-print');
        },
        onclone: (clonedDoc) => {
          // Remove any problematic elements from the cloned document
          const elementsToRemove = clonedDoc.querySelectorAll('.no-export, button, .no-print');
          elementsToRemove.forEach(el => el.remove());
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Restore UI controls
      exportElements.forEach(el => {
        (el as HTMLElement).style.visibility = 'visible';
      });

      // Create PDF with TypeScript type assertion
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
          // Use smaller, more compact logo size
          const logoWidth = 40; // mm - much smaller
          const logoHeight = 20; // mm - fixed height for consistency
          
          // Center the logo horizontally
          const xPos = (210 - logoWidth) / 2; // A4 width is 210mm
          
          pdf.addImage(logo, 'PNG', xPos, 25, logoWidth, logoHeight);
        } catch (err) {
          console.error('Error adding logo to PDF:', err);
          // Fallback with shorter text
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text('INCOIS', 105, 35, { align: 'center' });
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Indian National Centre for Ocean Information Services', 105, 42, { align: 'center' });
        }
      } else {
        // Fallback with shorter, cleaner text
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INCOIS', 105, 35, { align: 'center' });
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Indian National Centre for Ocean Information Services', 105, 42, { align: 'center' });
      }
      
      // Title and subtitle - moved up due to smaller logo
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ARGO Ocean Data Analysis Report', 105, 60, { align: 'center' });
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${data.selectedRegion} Ocean - ${data.timeRange}`, 105, 70, { align: 'center' });
      
      // Author information - more compact
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Prepared by', 105, 90, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text('Ocean Observation Network Division (OOND)', 105, 105, { align: 'center' });
      pdf.text('INCOIS, Ministry of Earth Sciences', 105, 115, { align: 'center' });
      pdf.text('Government of India', 105, 125, { align: 'center' });
      
      // Date
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Report Date: ${currentDate}`, 105, 145, { align: 'center' });
      
      // Add INCOIS address in footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('INDIAN NATIONAL CENTRE FOR OCEAN INFORMATION SERVICES (INCOIS)', 105, 285, { align: 'center' });
      pdf.text('Ministry of Earth Sciences, Govt. of India, "Ocean Valley", P.B.No. 21, IDA Jeedimetla, Hyderabad - 500 055, India', 105, 290, { align: 'center' });
      
      // Page number
      pdf.text('1', 20, 20);
      
      // Page 2 - Data and Analysis
      pdf.addPage();
      
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
      
      // Document title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DOCUMENT CONTROL SHEET', 105, 40, { align: 'center' });
      
      // Add a line separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 45, 190, 45);
      
      // Document details
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const details = [
        ['Title of the report:', `Performance Evaluation of ARGO Ocean Buoy Data Analysis in the ${data.selectedRegion} Ocean During ${data.timeRange}`],
        ['Author(s):', 'Ocean Observation Network Division (OOND), INCOIS'],
        ['Originating unit:', 'Ocean Observation Network Division (OOND), INCOIS'],
        ['Type of Document:', 'Technical Report (TR)'],
        ['Number of pages and figures:', '2 pages, 1 figure, and 1 table'],
        ['Keywords:', 'ARGO Floats, Oceanography, Sea Surface Temperature, Salinity, Ocean Currents'],
        ['Security classification:', 'Open'],
        ['Distribution:', 'Open'],
        ['Date of publication:', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })]
      ];
      
      let yPos = 60;
      details.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPos);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(value, 120);
        pdf.text(lines, 70, yPos);
        yPos += Math.max(5, lines.length * 5);
      });
      
      // Statistics
      const avgTemp = data.avgTemperature?.toFixed(1) || '--';
      const avgSalinity = data.avgSalinity?.toFixed(1) || '--';
      const totalProfiles = data.totalProfiles || data.filteredData.length;
      const regionCount = data.regionCount || new Set(data.filteredData.map(item => item.region)).size;
      
      yPos += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATA SUMMARY:', 20, yPos);
      yPos += 7;
      
      const stats = [
        `Total Profiles Analyzed: ${totalProfiles}`,
        `Average Temperature: ${avgTemp}°C`,
        `Average Salinity: ${avgSalinity} PSU`,
        `Ocean Regions Covered: ${regionCount}`,
        `Analysis Period: ${data.timeRange}`,
        `Data View: ${data.activeTab.charAt(0).toUpperCase() + data.activeTab.slice(1)}`
      ];
      
      pdf.setFont('helvetica', 'normal');
      stats.forEach(stat => {
        pdf.text(stat, 25, yPos);
        yPos += 5;
      });
      
      // Add chart image
      yPos += 10;
      const imgWidth = 170;
      const imgHeight = Math.min((canvasHeight * imgWidth) / canvasWidth, 120);
      pdf.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight);
      
      // Add footer with logo and page number
      if (logo) {
        try {
          const footerLogoWidth = 12;
          const footerLogoHeight = 6;
          pdf.addImage(logo, 'PNG', 20, 275, footerLogoWidth, footerLogoHeight);
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
      pdf.text('2', 20, 20);
      
      // Save the PDF
      const defaultFileName = `INCOIS_ARGO_Report_${data.selectedRegion.replace(/\s+/g, '_')}_${data.timeRange.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName || defaultFileName);
      
      onExport?.(true);
    } catch (error) {
      console.error('PDF export failed:', error);
      onExport?.(false, error as Error);
    }
  };

  return (
    <div ref={contentRef}>
      {children(handleExport)}
    </div>
  );
};

export default PDFExporter;