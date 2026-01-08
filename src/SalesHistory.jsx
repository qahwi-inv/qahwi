// src/SalesHistory.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Row, Col, Badge } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import InvoicePreview from './InvoicePreview.jsx';

const SalesHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('invoices')) || [];
    // Sort newest first
    const sorted = stored.sort((a, b) => new Date(b.date) - new Date(a.date));
    setInvoices(sorted);
  }, []);

  // ── Calculate stats ────────────────────────────────────────────────────────
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const dailyInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    return invDate >= todayStart;
  });

  const monthlyInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    return invDate >= monthStart;
  });

  const dailyTotal = dailyInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const monthlyTotal = monthlyInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const dailyCount = dailyInvoices.length;
  const monthlyCount = monthlyInvoices.length;

const exportToExcel = () => {
  if (invoices.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  const rows = invoices.flatMap(inv => 
    inv.items.map(item => ({
      'رقم الفاتورة': inv.id,
      'التاريخ': new Date(inv.date).toLocaleString('ar-SA'),
      'اسم التاجر': inv.merchantName || '',
      'الإجمالي الفاتورة': inv.total.toFixed(2),
      'ضريبة الفاتورة': inv.vat?.toFixed(2) || '0.00',
      'اسم المنتج': item.name,
      'سعر الوحدة': item.price.toFixed(2),
      'الكمية': item.qty,
      'المجموع للصنف': (item.price * item.qty).toFixed(2),
      'الضريبة المقدرة للصنف': ((item.price * item.qty) * 0.05).toFixed(2), // optional
    }))
  );

  const ws = XLSX.utils.json_to_sheet(rows);

  // Optional: make header row bold & add auto-filter
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cell_address]) continue;
    ws[cell_address].s = { font: { bold: true } };
  }
  ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'المبيعات');

  const fileName = `مبيعات_تفصيلية_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

  const handleViewReceipt = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const closePreview = () => {
    setSelectedInvoice(null);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-info text-white">
        <h2 className="mb-0">سجل المبيعات والفواتير</h2>
      </Card.Header>

      <Card.Body>
        {/* Statistics Cards */}
        <Row className="mb-4 g-3">
          <Col md={6} lg={3}>
            <Card className="text-center border-primary h-100">
              <Card.Body>
                <Card.Title className="text-primary fw-bold">مبيعات اليوم</Card.Title>
                <h3 className="mb-1">{dailyTotal.toFixed(2)} ريال</h3>
                <Badge bg="primary" pill>{dailyCount} فاتورة</Badge>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="text-center border-success h-100">
              <Card.Body>
                <Card.Title className="text-success fw-bold">مبيعات الشهر</Card.Title>
                <h3 className="mb-1">{monthlyTotal.toFixed(2)} ريال</h3>
                <Badge bg="success" pill>{monthlyCount} فاتورة</Badge>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="text-center border-info h-100">
              <Card.Body>
                <Card.Title className="text-info fw-bold">إجمالي الفواتير</Card.Title>
                <h3 className="mb-1">{invoices.length}</h3>
                <small className="text-muted">جميع الفترات</small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="text-center border-warning h-100">
              <Card.Body>
                <Card.Title className="text-warning fw-bold">متوسط الفاتورة</Card.Title>
                <h3 className="mb-1">
                  {invoices.length > 0 
                    ? (invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length).toFixed(2) 
                    : '0.00'} ريال
                </h3>
                <small className="text-muted">على الإجمالي</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Export Button */}
        <div className="mb-4 text-end">
          <Button
            variant="warning"
            onClick={exportToExcel}
            disabled={invoices.length === 0}
            className="fw-bold"
          >
            تصدير إلى Excel
          </Button>
        </div>

        {/* Invoice List */}
        {invoices.length === 0 ? (
          <p className="text-center text-muted py-5">لا توجد فواتير سابقة بعد</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>التاريخ</th>
                <th>التاجر</th>
                <th>الإجمالي (ريال)</th>
                <th>عدد الأصناف</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td>{new Date(inv.date).toLocaleString('ar-SA')}</td>
                  <td>{inv.merchantName}</td>
                  <td>{inv.total.toFixed(2)}</td>
                  <td>{inv.items.length}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewReceipt(inv)}
                    >
                      عرض الفاتورة
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Receipt Preview */}
        {selectedInvoice && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
            style={{ zIndex: 1050 }}
          >
            <div className="bg-white rounded p-4" style={{ maxWidth: '95%', maxHeight: '95vh', overflow: 'auto' }}>
              <InvoicePreview
                invoiceData={{
                  invoiceNumber: selectedInvoice.id,
                  merchantName: selectedInvoice.merchantName,
                  date: selectedInvoice.date,
                  total: selectedInvoice.total,
                  vat: selectedInvoice.vat,
                }}
                selectedItems={selectedInvoice.items}
                onClose={closePreview}
              />
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SalesHistory;