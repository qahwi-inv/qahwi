import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Card } from 'react-bootstrap';
import InvoicePreview from './InvoicePreview.jsx';
import toast from 'react-hot-toast';

const Invoice = () => {
  const [items, setItems] = useState([]);           // available inventory
  const [selectedItems, setSelectedItems] = useState([]); // what user picked
  const [invoiceData, setInvoiceData] = useState({
    merchantName: '',
    invoiceNumber: '',
  });
  const [showPreview, setShowPreview] = useState(false);

  // Load inventory
  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('inventory')) || [];
    setItems(storedItems);
  }, []);

  // When user changes quantity input
  const handleSelect = (item, qty) => {
    const qtyNum = parseInt(qty) || 0;

    // Optional: prevent entering more than available
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

    // Step 1: Check if any item would go negative
    const currentInventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const invalidItem = selectedItems.find(sel => {
      const stockItem = currentInventory.find(i => i.id === sel.id);
      return stockItem && sel.qty > stockItem.quantity;
    });

    if (invalidItem) {
      toast.error(`الكمية المطلوبة لـ "${invalidItem.name}" تتجاوز المخزون المتاح`);
      return;
    }

    // Step 2: Proceed to create invoice
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

    // Step 3: Immediately update the table on this page
    setItems(updatedInventory);

    // Step 4: Reset selections (clear all quantity inputs)
    setSelectedItems([]);

    // Step 5: Show preview
    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: invId,
      date: now.toISOString(),
      total,
      vat
    }));
    setShowPreview(true);

    // Success feedback
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
          <Form.Label>اسم التاجر</Form.Label>
          <Form.Control
            type="text"
            placeholder="أدخل اسم التاجر (اختياري)"
            value={invoiceData.merchantName}
            onChange={e => setInvoiceData({ ...invoiceData, merchantName: e.target.value })}
          />
        </Form.Group>

        <h4 className="mb-3">اختر المنتجات</h4>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>السعر</th>
              <th>الكمية المتاحة</th>
              <th>الكمية المطلوبة</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    max={item.quantity}
                    value={
                      selectedItems.find(s => s.id === item.id)?.qty || ''
                    }
                    onChange={e => handleSelect(item, e.target.value)}
                    style={{ width: '100px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

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
                selectedItems={selectedItems}  // pass the original selected items for preview only
                onClose={() => {
                  setShowPreview(false);
                  // Optional: if you want to reload again after closing preview
                  // const fresh = JSON.parse(localStorage.getItem('inventory')) || [];
                  // setItems(fresh);
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