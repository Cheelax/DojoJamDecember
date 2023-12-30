import React, { FC, useRef, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalRef: React.RefObject<HTMLDivElement>;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, modalRef }) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10 overflow-y-auto">
      <div ref={modalRef} className="bg-white p-5 rounded-lg shadow-xl m-4 max-w-3xl w-full relative">
        <img src="../assets/rules/1.png" alt="Rule 1" />
        <img src="../assets/rules/2.png" alt="Rule 2" />
        <img src="../assets/rules/3.png" alt="Rule 3" />
        <button className="text-black" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
