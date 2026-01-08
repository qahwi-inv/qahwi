import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Card } from 'react-bootstrap';
import InvoicePreview from './InvoicePreview.jsx';

const Invoice = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    merchantName: '',
    invoiceNumber: '',
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('inventory')) || [];
    setItems(storedItems);
  }, []);

  const handleSelect = (item, qty) => {
    const qtyNum = parseInt(qty) || 0;
    
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
      alert('يرجى اختيار عنصر واحد على الأقل');
      return;
    }

    // 1. Generate unique invoice ID
    const now = new Date();
    const invId = 'INV-' + now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);

    const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const vat = subtotal * 0.05;
    const total = subtotal + vat;

    // 2. Create invoice record
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
      }))
    };

    // 3. Save to localStorage - add to invoices list
    const existingInvoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const updatedInvoices = [newInvoice, ...existingInvoices];
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));

    // 4. Reduce stock in inventory
    const currentInventory = JSON.parse(localStorage.getItem('inventory')) || [];
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

    // 5. Prepare data for preview
    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: invId,
      date: now.toISOString(),
      total,
      vat
    }));

    setShowPreview(true);

    // Optional: reset selection after save (uncomment if desired)
    // setSelectedItems([]);
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
                    defaultValue="0"
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
           انشأء فاتورة
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
                selectedItems={selectedItems}
                onClose={() => setShowPreview(false)}
              />
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Invoice;