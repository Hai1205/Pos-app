import React, { useState, useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export function PayPalButton({ amount, onSuccess }) {
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setError("PayPal Client ID chưa được cấu hình");
      return;
    }
    setPaypalClientId(clientId);
  }, []);

  const convertVNDtoUSD = (vndAmount) => {
    const exchangeRate = 24000; // 1 USD = 24,000 VND
    return Math.round((vndAmount / exchangeRate) * 100) / 100;
  };

  const usdAmount = convertVNDtoUSD(amount);

  const createPayPalOrder = async (data, actions) => {
    setIsProcessing(true);
    try {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: usdAmount.toString(),
            },
            description: "Thanh toán đơn hàng",
            custom_id: amount.toString(),
          },
        ],
      });
    } catch (err) {
      setError("Không thể tạo đơn hàng PayPal. Vui lòng thử lại.");
      setIsProcessing(false);
      throw err;
    }
  };

  const onApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      onSuccess({
        paypal_order_id: data.orderID,
        paypal_payer_id: details.payer.payer_id,
        paypal_payment_id: details.purchase_units[0].payments.captures[0].id,
        vnd_amount: amount,
        usd_amount: usdAmount,
        payment_method: 'paypal'
      });
    } catch (err) {
      setError("Không thể hoàn tất thanh toán. Vui lòng thử lại.");
      console.error("PayPal Capture Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onError = (err) => {
    setError("Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.");
    console.error("PayPal Error:", err);
    setIsProcessing(false);
  };

  if (!paypalClientId) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        Không thể tải PayPal. Vui lòng kiểm tra cấu hình.
      </div>
    );
  }

  return (
    <PayPalScriptProvider 
      options={{
        "client-id": paypalClientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className="w-full">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-4">Đang xử lý thanh toán...</div>
        )}

        <PayPalButtons
          createOrder={createPayPalOrder}
          onApprove={onApprove}
          onError={onError}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay',
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
