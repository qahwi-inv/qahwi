// src/Monitor.jsx
import React, { useState, useEffect } from 'react';

const Monitor = () => {
  const [invoices, setInvoices] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    setInvoices(JSON.parse(localStorage.getItem('invoices')) || []);
    setInventory(JSON.parse(localStorage.getItem('inventory')) || []);
  }, []);

  return (
    <div className="container py-5" dir="rtl">
      <h1 className="mb-4">سجل الإنشاء الخاص (للمطور فقط)</h1>

      <h3>الفواتير المُنشأة</h3>
      {invoices.length === 0 ? (
        <p>لا توجد فواتير بعد</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>رقم الفاتورة</th>
              <th>التاريخ</th>
              <th>أنشئ بواسطة</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{new Date(inv.createdAt || inv.date).toLocaleString('ar-SA')}</td>
                <td>{inv.createdBy || 'غير معروف'}</td>
                <td>{inv.total.toFixed(2)} ريال</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="mt-5">العناصر في المخزون</h3>
      {inventory.length === 0 ? (
        <p>لا توجد عناصر بعد</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الكمية</th>
              <th>أنشئ بواسطة</th>
              <th>تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.createdBy || 'غير معروف'}</td>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleString('ar-SA') : 'غير متوفر'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Monitor;