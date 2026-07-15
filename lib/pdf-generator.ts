// PDF Generator utility for reservation tickets using jsPDF
import { jsPDF } from 'jspdf'
import { BRAND } from '@/lib/brand'

export interface ReservationTicketData {
  queueNumber: string
  serviceName: string
  name: string
  date: string
  time: string
  estimatedTime: string
  phone: string
  purpose: string
}

export async function generateTicketPDF(data: ReservationTicketData): Promise<void> {
  try {
    // Create new PDF document (A5 size - 148 x 210 mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    })

    // Set font
    doc.setFont('helvetica')

    // Colors
    const blue = BRAND.accent
    const darkGray = '#374151'
    const lightGray = '#6b7280'

    // Helper function to add centered text
    const addCenteredText = (text: string, y: number, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal', color: string = darkGray) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', fontStyle)
      // Convert hex to RGB
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      doc.setTextColor(r, g, b)
      const textWidth = doc.getTextWidth(text)
      const x = (148 - textWidth) / 2
      doc.text(text, x, y)
    }

    // Add dashed border
    doc.setDrawColor(51, 51, 51)
    doc.setLineDash([3, 3])
    doc.setLineWidth(0.5)
    doc.rect(10, 10, 128, 190)
    doc.setLineDash([]) // Reset to solid line

    let yPosition = 25

    // Header
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(102, 102, 102)
    addCenteredText('DINAS PENDIDIKAN KOTA BANJARMASIN', yPosition, 10, 'bold', '#666666')
    
    yPosition += 8
    doc.setTextColor(37, 99, 235)
    addCenteredText('TIKET RESERVASI ONLINE', yPosition, 14, 'bold', blue)

    // Top border line
    yPosition += 8
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(20, yPosition, 128, yPosition)

    // Queue Number (Large)
    yPosition += 15
    doc.setFontSize(36)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(37, 99, 235)
    addCenteredText(data.queueNumber, yPosition, 36, 'bold', blue)

    // Service Name
    yPosition += 10
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 64, 175)
    addCenteredText(data.serviceName, yPosition, 14, 'bold', '#1e40af')

    // Bottom border line
    yPosition += 8
    doc.setDrawColor(229, 231, 235)
    doc.line(20, yPosition, 128, yPosition)

    // Details section
    yPosition += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 65, 81)

    const details = [
      { label: 'Nama:', value: data.name },
      { label: 'Tanggal:', value: data.date },
      { label: 'Waktu:', value: data.time },
      { label: 'Est. Panggilan:', value: data.estimatedTime, highlight: true },
      { label: 'No. HP:', value: data.phone },
      { label: 'Tujuan:', value: data.purpose, multiline: true }
    ]

    details.forEach((detail, index) => {
      // Label (left)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(55, 65, 81)
      doc.text(detail.label, 20, yPosition)

      // Value (right)
      doc.setFont('helvetica', 'normal')
      
      if (detail.highlight) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(37, 99, 235)
      } else {
        doc.setTextColor(17, 24, 39)
      }

      // Handle multiline text for purpose
      if (detail.multiline && detail.value.length > 40) {
        const lines = doc.splitTextToSize(detail.value, 60)
        doc.text(lines, 75, yPosition, { align: 'right', maxWidth: 60 })
        yPosition += (lines.length - 1) * 5
      } else {
        doc.text(detail.value, 128, yPosition, { align: 'right' })
      }

      // Separator line (except for last item)
      if (index < details.length - 1) {
        yPosition += 6
        doc.setDrawColor(243, 244, 246)
        doc.setLineWidth(0.3)
        doc.line(20, yPosition, 128, yPosition)
      }

      yPosition += 8
    })

    // Important note
    yPosition += 5
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(20, yPosition, 128, yPosition)

    yPosition += 8
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 64, 175)
    doc.text('Penting:', 20, yPosition)
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    const noteText = 'Simpan atau cetak tiket ini sebagai bukti reservasi Anda.'
    const noteLines = doc.splitTextToSize(noteText, 100)
    doc.text(noteLines, 20, yPosition + 5)

    // Save PDF
    doc.save(`Tiket-Reservasi-${data.queueNumber}.pdf`)

  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}
