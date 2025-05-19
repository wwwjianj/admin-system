// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',      // 待支付
  PAID = 'paid',           // 已支付
  SHIPPED = 'shipped',     // 已发货
  DELIVERED = 'delivered', // 已送达
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled'  // 已取消
}

// 商品项类型
export interface OrderItem {
  image: string | undefined;
  id: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// 收货地址类型
export interface ShippingAddress {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  postalCode: string;
}

// 支付信息类型
export interface PaymentInfo {
  method: 'alipay' | 'wechat' | 'bank';
  amount: number;
  transactionId?: string;
  paidAt?: string;
}

// 物流信息类型
export interface ShippingInfo {
  company: string;
  trackingNumber: string;
  history: {
    time: string;
    status: string;
    location: string;
  }[];
}

// 订单详情类型
export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
  };
  paymentInfo: {
    method: string;
    transactionId: string;
    paidAt: string;
  };
  shippingInfo?: ShippingInfo;
} 