import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Row, Col, Badge } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import InvoicePreview from './InvoicePreview.jsx';
import toast from 'react-hot-toast';

const SalesHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('invoices')) || [];
    const sorted = stored.sort((a, b) => new Date(b.date) - new Date(a.date));
    setInvoices(sorted);
  }, []);

  // Save updated invoices back to localStorage
  const updateInvoices = (updated) => {
    localStorage.setItem('invoices', JSON.stringify(updated));
    setInvoices(updated.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  // Toggle delete/undelete single invoice
  const toggleDelete = (id, shouldDelete) => {
    const updated = invoices.map(inv =>
      inv.id === id ? { ...inv, isDeleted: shouldDelete } : inv
    );
    updateInvoices(updated);
  };

  // Reset ALL sales history (with confirmation)
  const resetSalesHistory = () => {
    if (window.confirm('هل أنت متأكد من حذف سجل المبيعات بالكامل؟\nهذا الإجراء لا يمكن التراجع عنه!')) {
      localStorage.removeItem('invoices');
      setInvoices([]);
      toast.success('تم حذف سجل المبيعات بالكامل');
    }
  };

  // ── Statistics ── only non-deleted invoices
  const activeInvoices = invoices.filter(inv => !inv.isDeleted);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const dailyInvoices = activeInvoices.filter(inv => new Date(inv.date) >= todayStart);
  const monthlyInvoices = activeInvoices.filter(inv => new Date(inv.date) >= monthStart);

  const dailyTotal = dailyInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const monthlyTotal = monthlyInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const dailyCount = dailyInvoices.length;
  const monthlyCount = monthlyInvoices.length;

  const handleViewReceipt = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const closePreview = () => {
    setSelectedInvoice(null);
  };

  // Export only active (non-deleted) invoices
  const exportToExcel = () => {
    if (activeInvoices.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }

    const rows = activeInvoices.flatMap(inv =>
      inv.items.map(item => ({
        'رقم الفاتورة': inv.id,
        'التاريخ': new Date(inv.date).toLocaleString('ar-SA'),
        'اسم المتجر': inv.merchantName || '',
        'الإجمالي الفاتورة': inv.total.toFixed(2),
        'ضريبة الفاتورة': inv.vat?.toFixed(2) || '0.00',
        'اسم المنتج': item.name,
        'سعر الوحدة': item.price.toFixed(2),
        'الكمية': item.qty,
        'المجموع للصنف': (item.price * item.qty).toFixed(2),
      }))
    );

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المبيعات');
    XLSX.writeFile(wb, `مبيعات_تفصيلية_${new Date().toISOString().slice(0,10)}.xlsx`);
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
                <h3>{dailyTotal.toFixed(2)} ريال</h3>
                <Badge bg="primary">{dailyCount} فاتورة</Badge>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="text-center border-success h-100">
              <Card.Body>
                <Card.Title className="text-success fw-bold">مبيعات الشهر</Card.Title>
                <h3>{monthlyTotal.toFixed(2)} ريال</h3>
                <Badge bg="success">{monthlyCount} فاتورة</Badge>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="text-center border-info h-100">
              <Card.Body>
                <Card.Title className="text-info fw-bold">إجمالي الفواتير</Card.Title>
                <h3>{activeInvoices.length}</h3>
                <small className="text-muted">النشطة فقط</small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="text-center border-warning h-100">
              <Card.Body>
                <Card.Title className="text-warning fw-bold">متوسط الفاتورة</Card.Title>
                <h3>
                  {activeInvoices.length > 0
                    ? (activeInvoices.reduce((sum, inv) => sum + inv.total, 0) / activeInvoices.length).toFixed(2)
                    : '0.00'} ريال
                </h3>
                <small className="text-muted">النشطة فقط</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="mb-4 d-flex justify-content-start gap-3">
          <Button
            variant="warning"
            onClick={exportToExcel}
            disabled={activeInvoices.length === 0}
            className="fw-bold"
          >
            تصدير إلى Excel
          </Button>

          <Button
            variant="danger"
            onClick={resetSalesHistory}
            disabled={invoices.length === 0}
            className="fw-bold"
          >
           حذف جميع الفواتير
          </Button>
        </div>

        {invoices.length === 0 ? (
          <p className="text-center text-muted py-5">لا توجد فواتير سابقة بعد</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>التاريخ</th>
                <th>المتجر</th>
                <th>الإجمالي (ريال)</th>
                <th>عدد الأصناف</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  style={{
                    textDecoration: inv.isDeleted ? 'line-through' : 'none',
                    color: inv.isDeleted ? '#6c757d' : 'inherit',
                    backgroundColor: inv.isDeleted ? '#f8f9fa' : 'inherit'
                  }}
                >
                  <td>{inv.id}</td>
                  <td>{new Date(inv.date).toLocaleString('ar-SA')}</td>
                  <td>{inv.merchantName}</td>
                  <td>{inv.total.toFixed(2)}</td>
                  <td>{inv.items.length}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleViewReceipt(inv)}
                    >
                      عرض الفاتورة
                    </Button>

                    {inv.isDeleted ? (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => toggleDelete(inv.id, false)}
                      >
                        استعادة
                      </Button>
                    ) : (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => toggleDelete(inv.id, true)}
                      >
                        حذف
                      </Button>
                    )}
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