
import React from 'react';
import { Modal } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';

const getTitle = (children) => {
  // Try to detect Login or Register from children type
  if (!children) return '';
  if (children.type && children.type.name === 'Login') return 'Login';
  if (children.type && children.type.name === 'Register') return 'Register';
  return '';
};

const AuthModal = ({ show, onHide, children }) => (
  <Modal
    show={show}
    onHide={onHide}
    centered
    backdrop="static"
    keyboard={false}
    contentClassName="auth-modal-content"
    dialogClassName="auth-modal-dialog"
  >
    <Modal.Header
      className="border-0 align-items-center justify-content-between px-4 pt-3 pb-2"
      style={{ background: '#f8fafc', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
    >
      <h5 className="mb-0 fw-bold" style={{ color: '#0ea5e9', fontSize: '1.45rem', letterSpacing: 0.5 }}>
        {getTitle(children)}
      </h5>
      <button
        type="button"
        className="btn-close ms-auto"
        aria-label="Close"
        style={{ fontSize: 24, background: 'none', border: 'none', color: '#222' }}
        onClick={onHide}
      >
        <X size={28} />
      </button>
    </Modal.Header>
    <Modal.Body
      className="d-flex flex-column align-items-center justify-content-center px-4 py-3"
      style={{ background: '#fff', borderBottomLeftRadius: 18, borderBottomRightRadius: 18, minWidth: 340 }}
    >
      {children}
    </Modal.Body>
  </Modal>
);

export default AuthModal;
