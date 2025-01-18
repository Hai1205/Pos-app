import React from 'react';
import { motion } from 'framer-motion';
import { QuantityInput } from './QuantityInput';
import { X, CircleX, CreditCard } from 'lucide-react';

export function Cart({ cart, total, onUpdateQuantity, onRemove, onCheckout, onClose }) {
  const apiUrl = import.meta.env.VITE_API_URL;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "tween" 
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Giỏ hàng</h2>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </motion.button>
      </div>

      {cart.length === 0 ? (
        <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <>
          {cart.map((item) => (
            <motion.div 
              key={`${item.id}-${item.selectedSize}`} 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="mb-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <motion.img
                    src={`${apiUrl}${item.image}`}
                    alt={item.name}
                    initial={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="ml-4">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Phần: {item.selectedSize === 'default' ? 'Vừa' : 'Lớn'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.price.toLocaleString()}đ x {item.quantity}
                    </p>
                    {item.note && (
                      <p className="text-sm text-gray-500 italic mt-1">
                        Ghi chú: {item.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <QuantityInput
                    value={item.quantity}
                    onChange={(newQuantity) => onUpdateQuantity(item.id, item.selectedSize, newQuantity - item.quantity)}
                    min={1}
                  />
                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemove(item.id, item.selectedSize)}
                    className="ml-2 text-red-500 hover:text-red-600"
                  >
                    <CircleX size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Tổng cộng:</span>
              <span className="font-bold">{total.toLocaleString()}đ</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCheckout}
              className="w-full bg-blue-900 text-white py-2 px-4 rounded hover:bg-blue-600 flex items-center justify-center"
            >
              <CreditCard className="mr-2" size={20} />
              Thanh toán
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
}
