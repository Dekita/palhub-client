import React, { useState, useEffect } from 'react';

const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300); // Duration should match the CSS
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" 
        onClick={() => setIsOpen(true)}
      >
        Open Modal
      </button>
      {(isOpen || isAnimating) && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsOpen(false)}
        >
          <div 
            className={`bg-white p-6 rounded-lg shadow-lg transform transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span 
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer text-xl"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </span>
            <p className="text-gray-800 text-lg">This is a modal popup</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
