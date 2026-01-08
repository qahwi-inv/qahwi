import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const InvoicePreview = ({ invoiceData, selectedItems, onClose }) => {
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  // Use saved date if available, otherwise current
  const invoiceDate = invoiceData.date ? new Date(invoiceData.date) : new Date();
  const dateStr = invoiceDate.toLocaleDateString('ar-SA');
  const timeStr = invoiceDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  const invoiceNumber = invoiceData.invoiceNumber || 'غير متوفر';

  // QR content (you can expand this for ZATCA compliance later)
  const qrValue = `
فاتورة رقم: ${invoiceNumber}
المتجر: ${invoiceData.merchantName || 'اسم المتجر'}
التاريخ: ${dateStr} ${timeStr}
المجموع قبل الضريبة: ${subtotal.toFixed(2)} ريال
ضريبة القيمة المضافة (15%): ${vat.toFixed(2)} ريال
الإجمالي: ${total.toFixed(2)} ريال
  `.trim();

  return (
    <div 
      dir="rtl" 
      className="invoice-preview p-4 bg-white mx-auto shadow position-relative" 
      style={{ 
        maxWidth: '380px',
        fontFamily: 'Tajawal, Cairo, sans-serif',
        fontSize: '1.05rem',
        lineHeight: '1.4'
      }}
    >
      {/* Header */}
      <button
        onClick={onClose}
        className="btn-close receipt-close d-print-none"
        aria-label="إغلاق"
        style={{
            position: 'absolute',
            fontSize: '20px',
            top: '10px',
            right: '10px', // RTL: left = visually right
            border: '3px solid #dc3545',
            borderRadius: '50%'
        }}
        ></button>
      <div className="text-center mb-3">
        <h4 className="fw-bold mb-1">فاتورة مبيعات</h4>
        <p className="mb-1 fw-bold">#{invoiceNumber} رقم الفاتورة</p>
        <p className="mb-1">اسم المتجر: {invoiceData.merchantName || 'اسم المتجر'}</p>
        <p className="mb-1 small">
          التاريخ: {dateStr}  
          <br />
          الوقت: {timeStr}
        </p>
      </div>

      <hr style={{ borderTop: '2px dashed #000', margin: '12px 0' }} />

      {/* Items */}
      <table className="w-100 mb-3" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr className="border-bottom">
            <th className="text-end py-1 fw-bold">السعر</th>
            <th className="text-center py-1 fw-bold">الكمية</th>
            <th className="text-end py-1 fw-bold">المنتج</th>
          </tr>
        </thead>
        <tbody>
          {selectedItems.map((item, idx) => (
            <tr key={idx} className="border-bottom">
              <td className="text-end py-1">{item.price.toFixed(2)}</td>
              <td className="text-center py-1">{item.qty}</td>
              <td className="text-end py-1">{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="text-end">
        <p className="mb-1">المجموع: {subtotal.toFixed(2)} ريال</p>
        <p className="mb-1">(15%) ضريبة القيمة المضافة: {vat.toFixed(2)} ريال</p>
        <hr style={{ borderTop: '1px solid #000', margin: '8px 0' }} />
        <h5 className="fw-bold">الإجمالي: {total.toFixed(2)} ريال</h5>
            <p className="small mt-2 fw-bold">
            يشمل الضريبة {'>>>>>>>>'}
            </p>
      </div>

      {/* QR Code */}
      <div className="text-center mt-4">
        <QRCodeSVG 
          value={qrValue} 
          size={180}
          level="M"
          fgColor="#000000"
          bgColor="#ffffff"
        />
        <p className="small mt-2 fw-bold">
          {'>>>>>>>> أغلق الفاتورة ' + (invoiceNumber.slice(-4) || '0100') + ' <<<<<<<<'}
        </p>
      </div>

      {/* Buttons (hidden when printing) */}
      <div className="text-center mt-4 d-print-none">
        <button className="btn btn-primary btn-lg me-3" onClick={() => window.print()}>
          طباعة الفاتورة
        </button>
        <button className="btn btn-secondary btn-lg" onClick={onClose}>
          إغلاق
        </button>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .d-print-none { display: none !important; }
          body { margin: 0; padding: 8mm; font-size: 11pt; }
          .invoice-preview { box-shadow: none; max-width: 80mm; margin: 0 auto; }
          hr { margin: 6px 0; }
        }
      `}</style>
    </div>
  );
};

export default InvoicePreview;