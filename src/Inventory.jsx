import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Modal, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: null, name: '', quantity: 0, price: 0 });
  const [isEdit, setIsEdit] = useState(false);

  // Load items from localStorage
  const loadItems = () => {
    const storedItems = JSON.parse(localStorage.getItem('inventory')) || [];
    setItems(storedItems);
  };

  // Initial load + re-load when page gets focus (after invoice creation)
  useEffect(() => {
    loadItems(); // first load

    const handleFocus = () => {
      loadItems();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const saveToLocal = (updatedItems) => {
    localStorage.setItem('inventory', JSON.stringify(updatedItems));
    setItems(updatedItems);
  };

  const handleAddOrEdit = () => {
    let updatedItems;
    if (isEdit) {
      updatedItems = items.map(item => item.id === currentItem.id ? currentItem : item);
      toast.success('تم تعديل العنصر بنجاح!');
    } else {
      updatedItems = [...items, { ...currentItem, id: Date.now() }];
      toast.success('تم إضافة العنصر بنجاح!');
    }
    saveToLocal(updatedItems);
    setShowModal(false);
    setCurrentItem({ id: null, name: '', quantity: 0, price: 0 });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      const updatedItems = items.filter(item => item.id !== id);
      saveToLocal(updatedItems);
      toast.success('تم حذف العنصر بنجاح!');
    }
  };

  const openModal = (item = { id: null, name: '', quantity: 0, price: 0 }, edit = false) => {
    setCurrentItem(item);
    setIsEdit(edit);
    setShowModal(true);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h2 className="mb-0">إدارة المخزون</h2>
      </Card.Header>
      <Card.Body>
        <Button variant="primary" size="lg" onClick={() => openModal()} className="mb-4">
          إضافة عنصر جديد
        </Button>

        {items.length === 0 ? (
          <p className="text-center text-muted py-5">لا يوجد عناصر في المخزون بعد</p>
        ) : (
          <Table striped bordered hover responsive>
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
                    <Button variant="warning" size="sm" onClick={() => openModal(item, true)} className="me-2">
                      تعديل
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} dir="rtl">
          <Modal.Header closeButton>
            <Modal.Title>{isEdit ? 'تعديل العنصر' : 'إضافة عنصر جديد'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>اسم العنصر</Form.Label>
                <Form.Control
                  type="text"
                  value={currentItem.name}
                  onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })}
                  placeholder="مثال: قهوة عربية"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>الكمية</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={currentItem.quantity}
                  onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>السعر (ريال)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentItem.price}
                  onChange={e => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) || 0 })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleAddOrEdit}>
              {isEdit ? 'حفظ التعديل' : 'إضافة العنصر'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default Inventory;