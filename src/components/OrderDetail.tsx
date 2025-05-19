import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Table, Tag, Space, Button, message, Timeline } from 'antd';
import { OrderStatus, OrderItem as BaseOrderItem } from '../types/order';
import { formatCurrency, formatDate } from '../utils/formatter';
import { getOrderDetail } from '../services/order';

// 扩展OrderItem类型，添加sku属性
interface OrderItem extends BaseOrderItem {
  sku?: string;
  name: string; // 用于替代productName
  image: string;
}

// 将接口重命名为OrderDetailType以避免与组件名冲突
interface OrderDetailType {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    postalCode: string;
  };
  paymentInfo: {
    method: string;
    amount: number;
    transactionId?: string;
    paidAt?: string;
  };
  shippingInfo?: {
    company: string;
    trackingNumber: string;
    status: string;
    estimatedDelivery?: string;
    history?: Array<{
      time: string;
      status: string;
      location: string;
    }>;
  };
  remark?: string;
  
  // 添加缺少的属性
  shippingFee: number;
  discount: number;
  finalAmount: number;
}

const OrderDetail: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetailType | null>(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const data = await getOrderDetail(orderId);
      
      // 解析地址字符串
      const addressParts = data.shippingAddress.address.split(' ').filter(Boolean);
      let province = '', city = '', district = '', detail = '';
      
      if (addressParts.length >= 1) province = addressParts[0];
      if (addressParts.length >= 2) city = addressParts[1];
      if (addressParts.length >= 3) district = addressParts[2];
      if (addressParts.length >= 4) detail = addressParts.slice(3).join(' ');
      
      // 计算金额
      const shippingFee = data.totalAmount * 0.05 || 0;
      const discount = data.totalAmount * 0.1 || 0;
      const finalAmount = data.totalAmount * 0.95 || 0;
      
      // 转换API返回的数据为组件需要的格式
      const transformedData: OrderDetailType = {
        ...data,
        // 将字符串状态转换为枚举类型
        status: data.status as unknown as OrderStatus,
        shippingFee,
        discount,
        finalAmount,
        // 处理收货地址结构不匹配问题
        shippingAddress: {
          name: data.shippingAddress.name,
          phone: data.shippingAddress.phone,
          province,
          city,
          district,
          detail,
          postalCode: '000000' // 默认值
        },
        // 处理支付信息结构不匹配问题
        paymentInfo: {
          method: data.paymentInfo.method,
          amount: finalAmount, // 使用计算好的最终金额
          transactionId: data.paymentInfo.transactionId,
          paidAt: data.paymentInfo.paidAt
        },
        // 处理物流信息结构不匹配问题
        shippingInfo: data.shippingInfo ? {
          company: data.shippingInfo.company,
          trackingNumber: data.shippingInfo.trackingNumber,
          status: data.shippingInfo.history && data.shippingInfo.history.length > 0 
            ? data.shippingInfo.history[0].status 
            : '待发货',
          estimatedDelivery: undefined,
          history: data.shippingInfo.history
        } : undefined,
        // 确保items包含需要的属性
        items: data.items.map(item => ({
          ...item,
          name: item.productName || '',
          image: item.image || ''
        })),
      };
      
      setOrder(transformedData);
    } catch (error) {
      message.error('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加取消订单的处理函数
  const handleCancelOrder = () => {
    console.log('取消订单');
    message.success('订单已取消');
    // 这里可以添加API调用
  };

  const getStatusTag = (status: OrderStatus) => {
    const statusMap = {
      [OrderStatus.PENDING]: { color: 'orange', text: '待支付' },
      [OrderStatus.PAID]: { color: 'blue', text: '已支付' },
      [OrderStatus.SHIPPED]: { color: 'purple', text: '已发货' },
      [OrderStatus.DELIVERED]: { color: 'green', text: '已送达' },
      [OrderStatus.COMPLETED]: { color: 'success', text: '已完成' },
      [OrderStatus.CANCELLED]: { color: 'error', text: '已取消' }
    };
    const { color, text } = statusMap[status];
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: '商品',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: OrderItem) => (
        <Space>
          <img src={record.image} alt={text} style={{ width: 50, height: 50, objectFit: 'cover' }} />
          <div>
            <div>{text}</div>
            {record.sku && <div style={{ color: '#999' }}>SKU: {record.sku}</div>}
          </div>
        </Space>
      )
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatCurrency(price)
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_: any, record: OrderItem) => formatCurrency(record.price * record.quantity)
    }
  ];

  const handleConfirmShipment = () => {
    console.log('确认发货');
    message.success('发货确认成功');
    // 这里可以添加API调用
  };

  if (!order) return null;

  return (
    <div className="order-detail">
      <Card title="订单信息" loading={loading}>
        <Descriptions bordered>
          <Descriptions.Item label="订单编号">{order.orderNumber}</Descriptions.Item>
          <Descriptions.Item label="订单状态">{getStatusTag(order.status)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{formatDate(order.createdAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="商品信息" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={order.items}
          rowKey="id"
          pagination={false}
        />
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <div>商品总额：{formatCurrency(order.totalAmount)}</div>
          <div>运费：{formatCurrency(order.shippingFee)}</div>
          <div>优惠：{formatCurrency(order.discount)}</div>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>
            实付金额：{formatCurrency(order.finalAmount)}
          </div>
        </div>
      </Card>

      <Card title="收货信息" style={{ marginTop: 16 }}>
        <Descriptions bordered>
          <Descriptions.Item label="收货人">{order.shippingAddress.name}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{order.shippingAddress.phone}</Descriptions.Item>
          <Descriptions.Item label="收货地址">
            {`${order.shippingAddress.province} ${order.shippingAddress.city} 
              ${order.shippingAddress.district} ${order.shippingAddress.detail}`}
          </Descriptions.Item>
          <Descriptions.Item label="邮编">{order.shippingAddress.postalCode}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="支付信息" style={{ marginTop: 16 }}>
        <Descriptions bordered>
          <Descriptions.Item label="支付方式">
            {order.paymentInfo.method === 'alipay' ? '支付宝' :
             order.paymentInfo.method === 'wechat' ? '微信支付' : '银行卡'}
          </Descriptions.Item>
          <Descriptions.Item label="支付金额">
            {formatCurrency(order.paymentInfo.amount)}
          </Descriptions.Item>
          {order.paymentInfo.transactionId && (
            <Descriptions.Item label="交易号">
              {order.paymentInfo.transactionId}
            </Descriptions.Item>
          )}
          {order.paymentInfo.paidAt && (
            <Descriptions.Item label="支付时间">
              {formatDate(order.paymentInfo.paidAt)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {order.shippingInfo && (
        <Card title="物流信息" style={{ marginTop: 16 }}>
          <Descriptions bordered>
            <Descriptions.Item label="物流公司">
              {order.shippingInfo.company}
            </Descriptions.Item>
            <Descriptions.Item label="运单号">
              {order.shippingInfo.trackingNumber}
            </Descriptions.Item>
            <Descriptions.Item label="物流状态">
              {order.shippingInfo.status}
            </Descriptions.Item>
            {order.shippingInfo.estimatedDelivery && (
              <Descriptions.Item label="预计送达">
                {formatDate(order.shippingInfo.estimatedDelivery)}
              </Descriptions.Item>
            )}
          </Descriptions>
          {order.shippingInfo.history && (
            <div style={{ marginTop: 16 }}>
              <h4>物流轨迹</h4>
              <Timeline>
                {order.shippingInfo.history.map((item, index) => (
                  <Timeline.Item key={index}>
                    <div>{formatDate(item.time)}</div>
                    <div>{item.status}</div>
                    <div>{item.location}</div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          )}
        </Card>
      )}

      {order.remark && (
        <Card title="备注信息" style={{ marginTop: 16 }}>
          {order.remark}
        </Card>
      )}

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Space>
          <Button onClick={() => window.print()}>打印订单</Button>
          {order.status === OrderStatus.PENDING && (
            <Button type="primary" danger onClick={() => handleCancelOrder()}>
              取消订单
            </Button>
          )}
          {order.status === OrderStatus.PAID && (
            <Button type="primary" onClick={() => handleConfirmShipment()}>
              确认发货
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default OrderDetail; 