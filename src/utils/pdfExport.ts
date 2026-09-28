import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PDFExportResult {
  success: boolean;
  blobUrl?: string;
  pdfBlob?: Blob;
  pdfFile?: File;
  fileName?: string;
  error?: Error;
}

export interface PDFExportOptions {
  fileName?: string;
  onStart?: () => void;
  onSuccess?: (result: PDFExportResult) => void;
  onError?: (err: Error) => void;
  autoShareOnMobile?: boolean;
}

/**
 * Mobile-hardened 1-Page PDF Generator and Downloader
 * Works reliably on Android Chrome, iOS Safari, Samsung Internet, and Desktop browsers.
 */
export async function exportPrescriptionToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<PDFExportResult> {
  const {
    fileName = 'Clinical_Sports_Nutrition_Diet_Chart.pdf',
    onStart,
    onSuccess,
    onError,
    autoShareOnMobile = true,
  } = options;

  try {
    if (onStart) onStart();

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found for PDF export.`);
    }

    const originalScrollPos = window.scrollY;

    // Use html2canvas-pro with retina 2.0 scale, safely handling oklch colors & tainted images
    const canvas = await html2canvas(element, {
      scale: 2.0,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.borderRadius = '0';
          clonedElement.style.margin = '0 auto';
          clonedElement.style.width = '780px';
          clonedElement.style.maxWidth = '780px';

          // Extra safety layer: Convert any computed or inline oklch/lab colors to rgb
          try {
            const canvasHelper = clonedDoc.createElement('canvas');
            const ctxHelper = canvasHelper.getContext('2d');
            if (ctxHelper) {
              const allNodes = clonedElement.querySelectorAll('*');
              const colorKeys = ['color', 'backgroundColor', 'borderColor', 'outlineColor'] as const;
              allNodes.forEach((node) => {
                const el = node as HTMLElement;
                if (!el.style) return;
                const computed = window.getComputedStyle(el);
                for (const key of colorKeys) {
                  const val = computed[key];
                  if (val && typeof val === 'string' && val.includes('oklch')) {
                    try {
                      ctxHelper.fillStyle = '#000000';
                      ctxHelper.fillStyle = val;
                      el.style[key] = ctxHelper.fillStyle;
                    } catch {
                      // ignore conversion failure
                    }
                  }
                }
              });
            }
          } catch (sanitizeErr) {
            console.warn('oklch sanitize warning:', sanitizeErr);
          }
        }
      },
    });

    window.scrollTo(0, originalScrollPos);

    let imgData: string;
    try {
      imgData = canvas.toDataURL('image/jpeg', 0.95);
    } catch (e) {
      console.warn('Canvas toDataURL failed, retrying with PNG', e);
      imgData = canvas.toDataURL('image/png');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // EXACT 1 SINGLE PAGE: Scale content proportionally to fit cleanly on 1 A4 sheet
    const margin = 6; // 6mm clean border
    const maxWidth = pageWidth - margin * 2; // 198mm
    const maxHeight = pageHeight - margin * 2; // 285mm

    const canvasAspect = canvas.width / canvas.height;
    const pageAspect = maxWidth / maxHeight;

    let finalWidth: number;
    let finalHeight: number;

    if (canvasAspect > pageAspect) {
      finalWidth = maxWidth;
      finalHeight = maxWidth / canvasAspect;
    } else {
      finalHeight = maxHeight;
      finalWidth = maxHeight * canvasAspect;
    }

    // Strictly enforce single page bounds
    finalWidth = Math.min(finalWidth, maxWidth);
    finalHeight = Math.min(finalHeight, maxHeight);

    // Center on the single page
    const posX = margin + (maxWidth - finalWidth) / 2;
    const posY = margin + (maxHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'JPEG', posX, posY, finalWidth, finalHeight, undefined, 'FAST');

    // Guarantee STRICTLY 1 single page by removing any accidentally created extra page
    while (pdf.getNumberOfPages() > 1) {
      pdf.deletePage(pdf.getNumberOfPages());
    }

    // Create a real Blob and File object for phone download & Web Share
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // 1. Try mobile Web Share API first if supported and enabled
    let sharedSuccessfully = false;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (autoShareOnMobile && isMobile && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: 'Diet Chart',
          text: 'Clinical & Sports Nutrition Diet Chart Prescription',
        });
        sharedSuccessfully = true;
      } catch (shareErr: any) {
        // User cancelled share or dismissed dialog; proceed to fallback download
        if (shareErr.name !== 'AbortError') {
          console.warn('Web Share failed, using direct download', shareErr);
        }
      }
    }

    // 2. Trigger single clean direct anchor download (without calling duplicate pdf.save)
    if (!sharedSuccessfully) {
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.rel = 'noopener';
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        if (downloadLink.parentNode) {
          document.body.removeChild(downloadLink);
        }
      }, 10000);
    }

    const result: PDFExportResult = {
      success: true,
      blobUrl,
      pdfBlob,
      pdfFile,
      fileName,
    };

    if (onSuccess) onSuccess(result);
    return result;
  } catch (error) {
    console.error('PDF export failed:', error);
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) onError(err);
    return {
      success: false,
      error: err,
    };
  }
}

export function triggerNativePrint(): void {
  window.print();
}
