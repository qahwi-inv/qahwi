import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Modal, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // IMPORTANT: quantity & price are STRINGS here
  const [currentItem, setCurrentItem] = useState({
    id: null,
    name: '',
    quantity: '',
    price: ''
  });

  // Load inventory
  const loadItems = () => {
    const storedItems = JSON.parse(localStorage.getItem('inventory')) || [];
    setItems(storedItems);
  };

  useEffect(() => {
    loadItems();
    window.addEventListener('focus', loadItems);
    return () => window.removeEventListener('focus', loadItems);
  }, []);

  const saveToLocal = (updatedItems) => {
    localStorage.setItem('inventory', JSON.stringify(updatedItems));
    setItems(updatedItems);
  };

  const openModal = (
    item = { id: null, name: '', quantity: '', price: '' },
    edit = false
  ) => {
    setCurrentItem({
      ...item,
      quantity: item.quantity?.toString() || '',
      price: item.price?.toString() || ''
    });
    setIsEdit(edit);
    setShowModal(true);
  };

  const handleAddOrEdit = () => {
    if (!currentItem.name.trim()) {
      toast.error('يرجى إدخال اسم العنصر');
      return;
    }

    const quantity = Number(currentItem.quantity);
    const price = Number(currentItem.price || 0);

    if (!quantity || quantity <= 0) {
      toast.error('الكمية يجب أن تكون أكبر من 0');
      return;
    }

    const itemToSave = {
      ...currentItem,
      quantity,
      price
    };

    let updatedItems;
    if (isEdit) {
      updatedItems = items.map(item =>
        item.id === currentItem.id ? itemToSave : item
      );
      toast.success('تم تعديل العنصر بنجاح!');
    } else {
      updatedItems = [...items, { ...itemToSave, id: Date.now() }];
      toast.success('تم إضافة العنصر بنجاح!');
    }

    saveToLocal(updatedItems);
    setShowModal(false);
    setCurrentItem({ id: null, name: '', quantity: '', price: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      const updatedItems = items.filter(item => item.id !== id);
      saveToLocal(updatedItems);
      toast.success('تم حذف العنصر بنجاح!');
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h2 className="mb-0">إدارة المخزون</h2>
      </Card.Header>

      <Card.Body>
        {items.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted mb-4">لا يوجد عناصر في المخزون بعد</h4>
            <Button size="lg" onClick={() => openModal()}>
              إضافة عنصر جديد
            </Button>
          </div>
        ) : (
          <div className="mb-4" style={{ direction: 'rtl' }}>
            <Button size="lg" onClick={() => openModal()}>
              إضافة عنصر جديد
            </Button>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
  <Table striped bordered hover className="inventory-table mb-0">
    <thead>
      <tr>
        <th>الاسم</th>
        <th>الكمية</th>
        <th>السعر (ريال)</th>
        <th>إجراءات</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id}>
          <td>{item.name}</td>
          <td>{item.quantity}</td>
          <td>{item.price.toFixed(2)}</td>
          <td>
            <div className="d-flex gap-2">
              <Button
                variant="warning"
                size="sm"
                onClick={() => openModal(item, true)}
              >
                تعديل
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(item.id)}
              >
                حذف
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
</div>

      </Card.Body>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEdit ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>اسم العنصر <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={currentItem.name}
                placeholder="مثال: قهوة عربية"
                onChange={e =>
                  setCurrentItem({ ...currentItem, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الكمية <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                inputMode="numeric"
                value={currentItem.quantity}
                onChange={e =>
                  setCurrentItem({ ...currentItem, quantity: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>السعر (ريال)</Form.Label>
              <Form.Control
                type="number"
                inputMode="decimal"
                step="0.01"
                value={currentItem.price}
                onChange={e =>
                  setCurrentItem({ ...currentItem, price: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={handleAddOrEdit}>
            {isEdit ? 'حفظ التعديل' : 'إضافة'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default Inventory;
