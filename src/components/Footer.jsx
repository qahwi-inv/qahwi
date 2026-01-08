// src/components/Footer.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPhoneAlt, FaEnvelope, FaWhatsapp } from 'react-icons/fa'; // optional icons

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row className="text-center text-md-end">
          <Col md={6} className="mb-3 mb-md-0">
            <p className="mb-1 fw-bold">نظام إدارة المخزون والفواتير</p>
            <p className="mb-0 small">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
          </Col>

          <Col md={6}>
            <p className="mb-2 fw-bold">للتواصل والدعم:</p>
            <p className="mb-1">
              <FaPhoneAlt className="me-2" />
              <a href="tel:+966500588724" className="text-light text-decoration-none">
                +966500588724
              </a>
            </p>
            <p className="mb-0">
              <FaEnvelope className="me-2" />
              <a href="mailto:qahwi.biz@gmail.com" className="text-light text-decoration-none">
                qahwi.biz@gmail.com
              </a>
            </p>
            <p className="mb-1">
            <FaWhatsapp className="me-2 text-success" />
            <a 
                href="https://wa.me/966500588724" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-light text-decoration-none"
            >
                واتساب: +966500588724
            </a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;