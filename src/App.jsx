import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import Inventory from './Inventory.jsx';
import Invoice from './Invoice.jsx';
import SalesHistory from './SalesHistory.jsx';
import Footer from './components/Footer.jsx';
import './index.css';  // make sure this imports the new styles

function App() {
  return (
    <Router>
      <div className="d-flex flex-column vh-100">
        {/* Top Navbar */}
        <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
          <Container fluid>
            <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
              نظام إدارة المخزون والفواتير
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/inventory">المخزون</Nav.Link>
                <Nav.Link as={Link} to="/invoice">فواتير جديدة</Nav.Link>
                <Nav.Link as={Link} to="/sales-history">سجل المبيعات</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div className="d-flex flex-grow-1">
          {/* Sidebar */}
          <div 
            className="bg-white border-end shadow-sm d-none d-md-block" 
            style={{ width: '260px', overflowY: 'auto' }}
          >
            <div className="p-4">
              <h5 className="mb-4 fw-bold text-primary">القائمة الرئيسية</h5>
              <Nav className="flex-column gap-2">
                <Button 
                  as={Link} 
                  to="/inventory"
                  variant="outline-primary"
                  className="text-end justify-content-start py-3 fs-5"
                >
                  إدارة المخزون
                </Button>
                <Button 
                  as={Link} 
                  to="/invoice"
                  variant="outline-success"
                  className="text-end justify-content-start py-3 fs-5"
                >
                  إنشاء فاتورة جديدة
                </Button>
                <Button 
                  as={Link} 
                  to="/sales-history"
                  variant="outline-info"
                  className="text-end justify-content-start py-3 fs-5"
                >
                  سجل المبيعات
                </Button>
              </Nav>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-grow-1 p-4 bg-light overflow-auto">
            <Container fluid>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/invoice" element={<Invoice />} />
                <Route path="/sales-history" element={<SalesHistory />} />
              </Routes>
            </Container>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="text-center py-5">
      <h1 className="mb-4">مرحباً بك في نظام إدارة المخزون</h1>
      <p className="lead text-muted">
        اختر من القائمة الموجودة أو من الأعلى لإدارة مخزونك أو إنشاء فواتير سريعة.
      </p>
      <div className="mt-5 d-flex flex-column align-items-center gap-4">
  <Button
    variant="primary"
    size="lg"
    as={Link}
    to="/inventory"
    className="w-75 w-md-50 fw-bold"
    style={{ minWidth: '300px' }}
  >
    ادارة المخزون
  </Button>

  <Button
    variant="success"
    size="lg"
    as={Link}
    to="/invoice"
    className="w-75 w-md-50 fw-bold"
    style={{ minWidth: '300px' }}
  >
    فاتورة جديدة
  </Button>

  <Button
    variant="warning"  // changed to info to distinguish from success
    size="lg"
    as={Link}
    to="/sales-history"
    className="w-75 w-md-50 fw-bold"
    style={{ minWidth: '300px' }}
  >
    سجل المبيعات
  </Button>
</div>
    </div>
  );
}

export default App;