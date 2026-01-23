import { CheeseType } from '@/types';

// Funzione per caricare un'immagine da URL e convertirla in base64
async function loadImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return '';
  }
}

export async function generateCheesePDF(cheese: CheeseType) {
  // Import dinamico di jsPDF per evitare errori se non installato
  let jsPDF: any;
  try {
    const jsPDFModule = await import('jspdf');
    jsPDF = jsPDFModule.default || jsPDFModule;
  } catch (error) {
    throw new Error('jspdf non è installato. Esegui: npm install jspdf html2canvas');
  }
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Colori ispirati al sito Corzano e Paterno
  const primaryColor = [139, 115, 85]; // #8B7355 (marrone)
  const secondaryColor = [166, 139, 111]; // #A68B6F (marrone chiaro)
  const textColor = [44, 44, 44]; // #2C2C2C (grigio scuro)
  const lightBg = [245, 245, 240]; // #F5F5F0 (beige chiaro)

  // Header con logo e titolo
  let logoAdded = false;
  try {
    // Prova a caricare il logo dal sito
    const logoUrl = 'https://www.corzanoepaterno.com/organic-farm/wp-content/uploads/2020/02/corzanopaternologo.svg';
    try {
      const logoBase64 = await loadImageAsBase64(logoUrl);
      if (logoBase64 && logoBase64.startsWith('data:image')) {
        // Prova ad aggiungere l'immagine (funziona per PNG/JPG, non per SVG)
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoBase64;
        await new Promise((resolve) => {
          img.onload = () => {
            try {
              const logoWidth = 50;
              const logoHeight = (img.height / img.width) * logoWidth;
              doc.addImage(logoBase64, 'PNG', margin, yPosition, logoWidth, logoHeight);
              logoAdded = true;
              yPosition += logoHeight + 10;
            } catch (e) {
              // Se fallisce (probabilmente è SVG), continua senza logo
              console.log('Logo non supportato, uso testo');
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
        });
      }
    } catch (e) {
      // Se il caricamento fallisce, continua senza logo
      console.log('Errore nel caricamento del logo:', e);
    }
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Titolo principale (solo se il logo non è stato aggiunto)
  if (!logoAdded) {
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Fattoria Corzano e Paterno', margin, yPosition);
    yPosition += 8;
  } else {
    // Se il logo è stato aggiunto, aggiungi il titolo accanto o sotto
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Fattoria Corzano e Paterno', margin + 60, yPosition - 30);
  }

  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Via San Vito di Sopra - 50020 San Casciano in Val di Pesa (Firenze)', margin, yPosition);
  yPosition += 15;

  // Linea separatrice
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Badge del formaggio (simulato con un rettangolo colorato)
  const badgeColor = cheese.color || '#F5E6D3';
  const rgb = hexToRgb(badgeColor);
  if (rgb) {
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(margin, yPosition, contentWidth, 12, 3, 3, 'F');
  }
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(cheese.name, margin + 5, yPosition + 8);
  yPosition += 20;

  // Sezione Resa
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Resa', margin, yPosition);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`${cheese.yieldPercentage || (cheese.yieldPerLiter ? (cheese.yieldPerLiter * 100).toFixed(1) : 'N/A')}%`, margin + 40, yPosition);
  yPosition += 10;

  // Sezione Prezzi
  if (cheese.prices) {
    doc.setFont('helvetica', 'bold');
    doc.text('Prezzi e Percentuali di Vendita', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    
    if (cheese.prices.price1 > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Franco Caseificio:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`€ ${cheese.prices.price1.toFixed(2)}/kg (${cheese.prices.salesPercentage1}%)`, margin + 50, yPosition);
      yPosition += 6;
    }
    if (cheese.prices.price2 > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Franco Cliente:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`€ ${cheese.prices.price2.toFixed(2)}/kg (${cheese.prices.salesPercentage2}%)`, margin + 50, yPosition);
      yPosition += 6;
    }
    if (cheese.prices.price3 > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Vendita Diretta:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`€ ${cheese.prices.price3.toFixed(2)}/kg (${cheese.prices.salesPercentage3}%)`, margin + 50, yPosition);
      yPosition += 6;
    }
  } else if (cheese.pricePerKg) {
    doc.setFont('helvetica', 'bold');
    doc.text('Prezzo', margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`€ ${cheese.pricePerKg.toFixed(2)}/kg`, margin + 5, yPosition);
    yPosition += 6;
  }
  yPosition += 5;

  // Linea separatrice
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Sezione Campi Predefiniti
  if (cheese.defaultFields) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Parametri di Produzione', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    const valueStartX = margin + 75; // Posizione fissa per tutti i valori
    
    if (cheese.defaultFields.temperaturaCoagulazione) {
      doc.setFont('helvetica', 'bold');
      doc.text('Temperatura Coagulazione:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(cheese.defaultFields.temperaturaCoagulazione, valueStartX, yPosition);
      yPosition += 6;
    }
    if (cheese.defaultFields.nomeFermento) {
      doc.setFont('helvetica', 'bold');
      doc.text('Nome Fermento:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(cheese.defaultFields.nomeFermento, valueStartX, yPosition);
      if (cheese.defaultFields.quantitaFermento) {
        doc.setFont('helvetica', 'bold');
        doc.text('Quantità:', valueStartX, yPosition + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(`${cheese.defaultFields.quantitaFermento} unità`, valueStartX + 25, yPosition + 6);
      }
      yPosition += cheese.defaultFields.quantitaFermento ? 12 : 6;
    }
    if (cheese.defaultFields.muffe) {
      doc.setFont('helvetica', 'bold');
      doc.text('Muffe:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(cheese.defaultFields.muffe, valueStartX, yPosition);
      if (cheese.defaultFields.quantitaMuffe) {
        doc.setFont('helvetica', 'bold');
        doc.text('Quantità:', valueStartX, yPosition + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(`${cheese.defaultFields.quantitaMuffe} unità`, valueStartX + 25, yPosition + 6);
      }
      yPosition += cheese.defaultFields.quantitaMuffe ? 12 : 6;
    }
    if (cheese.defaultFields.caglio) {
      doc.setFont('helvetica', 'bold');
      doc.text('Caglio:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(cheese.defaultFields.caglio, valueStartX, yPosition);
      if (cheese.defaultFields.quantitaCaglio) {
        doc.setFont('helvetica', 'bold');
        doc.text('Quantità:', valueStartX, yPosition + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(`${cheese.defaultFields.quantitaCaglio} cc`, valueStartX + 25, yPosition + 6);
      }
      yPosition += cheese.defaultFields.quantitaCaglio ? 12 : 6;
    }
    yPosition += 5;
  }

  // Sezione Campi Personalizzati
  if (cheese.customFields && cheese.customFields.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Campi Personalizzati', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    cheese.customFields.forEach((field) => {
      if (field.key && field.value) {
        doc.text(`${field.key}: ${field.value}`, margin + 5, yPosition);
        yPosition += 6;
      }
    });
    yPosition += 5;
  }

  // Linea separatrice
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = margin;
  }
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Sezione Protocollo
  if (cheese.protocol && cheese.protocol.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Protocollo di Produzione (${cheese.protocol.length} fasi)`, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Ordina il protocollo per giorno
    const sortedProtocol = [...cheese.protocol].sort((a, b) => a.day - b.day);
    
    sortedProtocol.forEach((step) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`Giorno ${step.day}:`, margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(step.activity, margin + 40, yPosition);
      yPosition += 6;
    });
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'italic');
  doc.text('Fattoria Corzano e Paterno - www.corzanoepaterno.com', margin, footerY);
  doc.text(`Generato il ${new Date().toLocaleDateString('it-IT')}`, pageWidth - margin - 40, footerY);

  // Salva il PDF
  doc.save(`Scheda_${cheese.name.replace(/\s+/g, '_')}.pdf`);
}

// Funzione helper per convertire hex a RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
