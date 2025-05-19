import { OrderDetail } from '../types/order';

export const getOrderDetail = async (orderId: string): Promise<OrderDetail> => {
  // TODO: Replace with actual API call
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order detail');
  }
  return response.json();
};

export const cancelOrder = async (orderId: string): Promise<void> => {
  const response = await fetch(`/api/orders/${orderId}/cancel`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to cancel order');
  }
};

export const confirmShipment = async (orderId: string, shippingInfo: {
  company: string;
  trackingNumber: string;
}): Promise<void> => {
  const response = await fetch(`/api/orders/${orderId}/ship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(shippingInfo)
  });
  if (!response.ok) {
    throw new Error('Failed to confirm shipment');
  }
}; 