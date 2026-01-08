import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Modal } from 'react-bootstrap';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: null, name: '', quantity: 0, price: 0 });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('inventory')) || [];
    setItems(storedItems);
  }, []);

  const saveToLocal = (updatedItems) => {
    localStorage.setItem('inventory', JSON.stringify(updatedItems));
    setItems(updatedItems);
  };

  const handleAddOrEdit = () => {
    let updatedItems;
    if (isEdit) {
      updatedItems = items.map(item => item.id === currentItem.id ? currentItem : item);
    } else {
      updatedItems = [...items, { ...currentItem, id: Date.now() }];
    }
    saveToLocal(updatedItems);
    setShowModal(false);
    setCurrentItem({ id: null, name: '', quantity: 0, price: 0 });
  };

  const handleDelete = (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    saveToLocal(updatedItems);
  };

  const openModal = (item = { id: null, name: '', quantity: 0, price: 0 }, edit = false) => {
    setCurrentItem(item);
    setIsEdit(edit);
    setShowModal(true);
  };

  return (
    <div>
      <h2>إدارة المخزون</h2>
      <Button variant="primary" onClick={() => openModal()}>إضافة عنصر جديد</Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.price} ريال</td>
              <td>
                <Button variant="warning" onClick={() => openModal(item, true)}>تعديل</Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(item.id)}>حذف</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'تعديل العنصر' : 'إضافة عنصر'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>اسم العنصر</Form.Label>
              <Form.Control
                type="text"
                value={currentItem.name}
                onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>الكمية</Form.Label>
              <Form.Control
                type="number"
                value={currentItem.quantity}
                onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>السعر (ريال)</Form.Label>
              <Form.Control
                type="number"
                value={currentItem.price}
                onChange={e => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>إغلاق</Button>
          <Button variant="primary" onClick={handleAddOrEdit}>{isEdit ? 'حفظ التعديل' : 'إضافة'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Inventory;