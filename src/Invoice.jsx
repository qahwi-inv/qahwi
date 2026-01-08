import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Card } from 'react-bootstrap';
import InvoicePreview from './InvoicePreview.jsx';
import toast from 'react-hot-toast';

const Invoice = () => {
  const [items, setItems] = useState([]);                    // available inventory
  const [selectedItems, setSelectedItems] = useState([]);    // current selection (resets after invoice)
  const [previewItems, setPreviewItems] = useState([]);      // ← NEW: saved copy for preview
  const [invoiceData, setInvoiceData] = useState({
    merchantName: '',
    invoiceNumber: '',
    date: '',
    total: 0,
    vat: 0,
  });
  const [showPreview, setShowPreview] = useState(false);

  // Load inventory
  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('inventory')) || [];
    setItems(storedItems);
  }, []);

  const handleSelect = (item, qty) => {
    const qtyNum = parseInt(qty) || 0;

    if (qtyNum > item.quantity) {
      toast.error(`الكمية المتاحة لـ "${item.name}" هي ${item.quantity} فقط`);
      return;
    }

    if (qtyNum <= 0) {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
      return;
    }

    const existing = selectedItems.find(i => i.id === item.id);
    let updated;
    if (existing) {
      updated = selectedItems.map(i =>
        i.id === item.id ? { ...i, qty: qtyNum } : i
      );
    } else {
      updated = [...selectedItems, { ...item, qty: qtyNum }];
    }

    setSelectedItems(updated);
  };

  const generateInvoice = () => {
    if (selectedItems.length === 0) {
      toast.error('يرجى اختيار عنصر واحد على الأقل');
      return;
    }

    // Validation: no negative stock
    const currentInventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const invalidItem = selectedItems.find(sel => {
      const stockItem = currentInventory.find(i => i.id === sel.id);
      return stockItem && sel.qty > stockItem.quantity;
    });

    if (invalidItem) {
      toast.error(`الكمية المطلوبة لـ "${invalidItem.name}" تتجاوز المخزون المتاح`);
      return;
    }

    const now = new Date();
    const invId = 'INV-' + now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);

    const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const vat = subtotal * 0.05;
    const total = subtotal + vat;

    const newInvoice = {
      id: invId,
      date: now.toISOString(),
      merchantName: invoiceData.merchantName || 'غير محدد',
      total,
      vat,
      items: selectedItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty
      })),
      isDeleted: false
    };

    // Save invoice
    const existingInvoices = JSON.parse(localStorage.getItem('invoices')) || [];
    localStorage.setItem('invoices', JSON.stringify([newInvoice, ...existingInvoices]));

    // Reduce stock
    const updatedInventory = currentInventory.map(stockItem => {
      const sold = selectedItems.find(s => s.id === stockItem.id);
      if (sold) {
        return {
          ...stockItem,
          quantity: Math.max(0, stockItem.quantity - sold.qty)
        };
      }
      return stockItem;
    });
    localStorage.setItem('inventory', JSON.stringify(updatedInventory));

    // Update visible table immediately
    setItems(updatedInventory);

    // IMPORTANT: Save a copy of selected items for preview BEFORE clearing
    setPreviewItems([...selectedItems]);   // ← copy the array

    // Reset form for next invoice
    setSelectedItems([]);
    setInvoiceData({
      merchantName: invoiceData.merchantName, // keep merchant name if you want
      invoiceNumber: '',
      date: '',
      total: 0,
      vat: 0,
    });

    // Prepare preview data
    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: invId,
      date: now.toISOString(),
      total,
      vat
    }));

    setShowPreview(true);

    toast.success('تم إنشاء الفاتورة وتخفيض المخزون بنجاح!');
  };

  const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-success text-white">
        <h2 className="mb-0">إنشاء فاتورة جديدة</h2>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-4">
          <Form.Label>اسم المتجر</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم المتجر (اختياري)"
            value={invoiceData.merchantName}
            onChange={e => setInvoiceData({ ...invoiceData, merchantName: e.target.value })}
          />
        </Form.Group>

        <h4 className="mb-3">اختر المنتجات</h4>
        <div style={{ overflowX: 'auto' }}>
  <Table striped bordered hover className="mb-0" style={{ tableLayout: 'auto', width: 'auto' }}>
    <thead>
      <tr>
        <th>المنتج</th>
        <th>السعر</th>
        <th style={{ width: '1%', whiteSpace: 'nowrap' }}>الكمية المتاحة</th>
        <th style={{ whiteSpace: 'nowrap' }}>الكمية المطلوبة</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id}>
          <td style={{ whiteSpace: 'nowrap' }}>{item.name}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{item.price.toFixed(2)}</td>
          <td style={{ width: '1%', whiteSpace: 'nowrap' }}>{item.quantity}</td>
          <td style={{ whiteSpace: 'nowrap' }}>
            <Form.Control
              type="number"
              min="0"
              max={item.quantity}
              value={selectedItems.find(s => s.id === item.id)?.qty || ''}
              onChange={e => handleSelect(item, e.target.value)}
              style={{ width: '70px', minWidth: '60px' }}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
</div>


        <div className="text-end mt-4">
          <h5>الإجمالي المبدئي: {subtotal.toFixed(2)} ريال</h5>
          <Button
            variant="primary"
            size="lg"
            onClick={generateInvoice}
            disabled={selectedItems.length === 0}
            className="mt-3"
          >
            عرض وطباعة الفاتورة
          </Button>
        </div>

        {showPreview && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
            style={{ zIndex: 1050 }}
          >
            <div className="bg-white rounded p-4" style={{ maxWidth: '95%', maxHeight: '95vh', overflow: 'auto' }}>
              <InvoicePreview
                invoiceData={invoiceData}
                selectedItems={previewItems}  // ← Use the saved copy!
                onClose={() => {
                  setShowPreview(false);
                  // Optional: reload inventory if needed
                  const fresh = JSON.parse(localStorage.getItem('inventory')) || [];
                  setItems(fresh);
                }}
              />
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Invoice;