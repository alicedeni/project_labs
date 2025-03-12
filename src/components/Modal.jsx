import React from 'react'

const Modal = ({ visible, message, success, onClose }) => {
  if (!visible) return null

  return (
    <div className={`modal ${success ? 'success' : 'error'}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <p>{message}</p>
      </div>
    </div>
  )
}

export default Modal
