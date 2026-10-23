import { jsPDF } from 'jspdf';

export interface CertificateData {
  recipientName: string;
  companyName: string;
  trackName: string;
  certificateNumber: string;
  trainingHours: number;
  issueDate: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  studentName: string;
  courseName: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
}

export interface ResourceDocumentData {
  title: string;
  cohort: string;
  fileType: string;
}

/**
 * Generate a professional landscape Certificate of Competence in PDF format
 */
export const downloadCertificatePdf = (data: CertificateData): void => {
  // A4 Landscape: 297 x 210 mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Outer border & background accent
  doc.setFillColor(252, 253, 255);
  doc.rect(0, 0, width, height, 'F');

  // Decorative double border
  doc.setDrawColor(24, 43, 73); // Deep Navy
  doc.setLineWidth(2.5);
  doc.rect(10, 10, width - 20, height - 20);

  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(0.8);
  doc.rect(13, 13, width - 26, height - 26);

  // Top header branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(24, 43, 73);
  doc.text('MAXY ACADEMY INDONESIA', width / 2, 28, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('LEMBAGA PENGEMBANGAN TALENTA DIGITAL & SISTEM LMS MULTI SEGMEN', width / 2, 33, { align: 'center' });

  // Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42);
  doc.text('SERTIFIKAT KOMPETENSI PROFESIONAL', width / 2, 48, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('Sertifikat ini secara resmi dianugerahkan kepada:', width / 2, 58, { align: 'center' });

  // Recipient Name
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(29, 78, 216); // Royal Blue
  doc.text(data.recipientName.toUpperCase(), width / 2, 72, { align: 'center' });

  // Recipient Org / Detail
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`Perwakilan dari: ${data.companyName}`, width / 2, 80, { align: 'center' });

  // Body text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text('Telah sukses menuntaskan seluruh kurikulum pelatihan teknis dan lulus audit evaluasi kompetensi pada program:', width / 2, 95, { align: 'center' });

  // Track Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(data.trackName, width / 2, 107, { align: 'center' });

  // Hours badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(212, 140, 20);
  doc.text(`[ TOTAL AKUMULASI: ${data.trainingHours} JAM PELATIHAN TERVERIFIKASI ]`, width / 2, 116, { align: 'center' });

  // Verification Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(width / 2 - 60, 126, 120, 15, 2, 2, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`NO. REGISTRASI: ${data.certificateNumber}`, width / 2, 133, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Tanggal Terbit: ${data.issueDate} • Status: Terverifikasi Sistem Maxy`, width / 2, 138, { align: 'center' });

  // Signatures
  const leftSigX = 55;
  const rightSigX = width - 55;
  const sigY = 165;

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(leftSigX - 30, sigY, leftSigX + 30, sigY);
  doc.line(rightSigX - 30, sigY, rightSigX + 30, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Dr. Hendra Gunawan, M.Cs', leftSigX, sigY + 5, { align: 'center' });
  doc.text('Budi Santoso, S.Kom, M.T', rightSigX, sigY + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Direktur Akademik Maxy Academy', leftSigX, sigY + 10, { align: 'center' });
  doc.text('Lead Technical Assessor', rightSigX, sigY + 10, { align: 'center' });

  // Official Stamp watermark
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.circle(width / 2, 170, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(212, 175, 55);
  doc.text('MAXY ACADEMY', width / 2, 169, { align: 'center' });
  doc.text('SEAL OF EXCELLENCE', width / 2, 172, { align: 'center' });

  // Trigger browser download
  doc.save(`${data.certificateNumber}.pdf`);
};

/**
 * Generate a formal payment receipt / invoice in PDF format
 */
export const downloadInvoicePdf = (data: InvoiceData): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();

  // Header Branding
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, width, 35, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('MAXY ACADEMY', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('Kwitansi Resmi Bukti Pembayaran Digital', 15, 25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('PAID / LUNAS', width - 15, 20, { align: 'right' });

  // Meta Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('DITERBITKAN UNTUK:', 15, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(data.studentName, 15, 54);
  doc.text('Status Akun: Siswa Terdaftar Maxy Academy', 15, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('DETAIL TRANSAKSI:', width - 80, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. Invoice: ${data.invoiceNumber}`, width - 80, 54);
  doc.text(`Tanggal: ${data.paymentDate}`, width - 80, 60);
  doc.text(`Metode: ${data.paymentMethod}`, width - 80, 66);

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 78, width - 30, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('DESKRIPSI PROGRAM / KURSUS', 20, 83);
  doc.text('JUMLAH (IDR)', width - 20, 83, { align: 'right' });

  // Table Row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(data.courseName, 20, 95);
  doc.text(new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(data.originalAmount), width - 20, 95, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 102, width - 15, 102);

  // Summary Rows
  let curY = 112;
  if (data.discountAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    doc.text('Potongan Voucher Diskon', width - 80, curY);
    doc.text(`- ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(data.discountAmount)}`, width - 20, curY, { align: 'right' });
    curY += 8;
  }

  doc.setFillColor(248, 250, 252);
  doc.rect(width - 90, curY, 75, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(29, 78, 216);
  doc.text('TOTAL DIBAYAR:', width - 85, curY + 8);
  doc.text(new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(data.finalAmount), width - 20, curY + 8, { align: 'right' });

  // Footer Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen ini adalah bukti transaksi digital sah yang dihasilkan secara otomatis oleh sistem LMS Maxy Academy.', 15, 160);
  doc.text('Jika Anda membutuhkan klarifikasi pembayaran, silakan hubungi finance@maxy.academy.', 15, 165);

  doc.save(`${data.invoiceNumber}.pdf`);
};

/**
 * Generate a study resource / guide document in PDF format
 */
export const downloadResourcePdf = (data: ResourceDocumentData): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, width, 30, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('LEMBAGA BIMBINGAN BELAJAR MITRA', 15, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Kohort: ${data.cohort} • Materi Eksklusif LMS Maxy`, 15, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(data.title, 15, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Tipe Dokumen: ${data.fileType} • Status: Terverifikasi Tutor Lembaga`, 15, 52);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 58, width - 15, 58);

  // Body syllabus preview
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('RINGKASAN & SILABUS MATERI BIMBINGAN:', 15, 68);

  const points = [
    '1. Pemahaman Konseptual & Strategi Pengerjaan Cepat',
    '2. Drilling Latihan Soal Standar UTBK / Ujian Mandiri PTN',
    '3. Analisis Pola Soal Paling Sering Muncul (Hot Topics)',
    '4. Pembahasan Lengkap Trik Eliminasi Opsi Jawaban',
    '5. Evaluasi Mandiri dengan Kunci Jawaban Terperinci',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  let y = 78;
  points.forEach((p) => {
    doc.text(p, 18, y);
    y += 10;
  });

  doc.setFillColor(248, 250, 252);
  doc.rect(15, y + 5, width - 30, 25, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Catatan Tutor:', 20, y + 13);
  doc.text('Pelajari rangkuman ini sebelum menghadiri sesi bimbingan live interaktif.', 20, y + 20);

  doc.save(`${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
};
