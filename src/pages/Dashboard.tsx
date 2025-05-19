import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Typography, Statistic, Divider, List, Avatar, Tag } from 'antd';
import { 
  ArrowDownOutlined, 
  ArrowUpOutlined, 
  UserOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer 
} from 'recharts';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  // 模拟数据加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 卡片数据
  const cardData = [
    { 
      title: '总用户数', 
      value: 152645, 
      icon: <UserOutlined />, 
      color: '#1677ff',
      growth: 12.5,
      isPositive: true
    },
    { 
      title: '订单总数', 
      value: 85426, 
      icon: <ShoppingCartOutlined />, 
      color: '#52c41a',
      growth: 8.2,
      isPositive: true
    },
    { 
      title: '销售额', 
      value: 1245789, 
      prefix: '¥',
      icon: <DollarOutlined />, 
      color: '#faad14',
      growth: -3.1,
      isPositive: false
    },
    { 
      title: '访问量', 
      value: 365214, 
      icon: <EyeOutlined />, 
      color: '#eb2f96',
      growth: 15.8,
      isPositive: true
    },
  ];

  // 用户增长数据
  const userGrowthData = [
    { month: '1月', value: 4000 },
    { month: '2月', value: 5000 },
    { month: '3月', value: 4800 },
    { month: '4月', value: 6000 },
    { month: '5月', value: 7500 },
    { month: '6月', value: 8000 },
    { month: '7月', value: 9200 },
    { month: '8月', value: 8700 },
    { month: '9月', value: 10000 },
    { month: '10月', value: 11500 },
    { month: '11月', value: 12800 },
    { month: '12月', value: 15000 },
  ];

  // 订单分类数据
  const orderCategoryData = [
    { category: '电子产品', value: 35642 },
    { category: '家居用品', value: 25891 },
    { category: '服装鞋包', value: 18457 },
    { category: '食品饮料', value: 15234 },
    { category: '图书音像', value: 8754 },
  ];

  // 用户类型数据
  const userTypeData = [
    { type: '普通用户', value: 82546, percentage: 54 },
    { type: 'VIP用户', value: 45236, percentage: 29 },
    { type: '企业用户', value: 18754, percentage: 12 },
    { type: '其他', value: 6109, percentage: 5 },
  ];

  // 访问量数据
  const visitData = [
    { month: '1月', visits: 35000 },
    { month: '2月', visits: 42000 },
    { month: '3月', visits: 38000 },
    { month: '4月', visits: 45000 },
    { month: '5月', visits: 51000 },
    { month: '6月', visits: 49000 },
    { month: '7月', visits: 62000 },
    { month: '8月', visits: 59000 },
    { month: '9月', visits: 68000 },
    { month: '10月', visits: 72000 },
    { month: '11月', visits: 78000 },
    { month: '12月', visits: 85000 },
  ];

  // 最近活动数据
  const recentActivities = [
    { user: '张三', action: '更新了产品信息', time: '10分钟前', type: 'success' },
    { user: '李四', action: '发布了系统公告', time: '30分钟前', type: 'info' },
    { user: '王五', action: '处理了客户投诉', time: '1小时前', type: 'warning' },
    { user: '赵六', action: '删除了过期订单', time: '2小时前', type: 'error' },
    { user: '孙七', action: '添加了新用户', time: '3小时前', type: 'success' },
  ];

  // 系统公告数据
  const systemNotices = [
    { title: '系统升级通知', content: '系统将于本周六晚间进行例行维护升级', time: '2023-04-02' },
    { title: '新功能上线', content: '数据分析模块已更新，支持自定义报表生成', time: '2023-03-28' },
    { title: '安全更新提醒', content: '请所有用户及时修改密码，增强账户安全性', time: '2023-03-25' },
    { title: '假期值班安排', content: '清明节期间值班人员安排已发布，请相关人员查看', time: '2023-03-20' },
  ];

  // 饼图自定义颜色
  const COLORS = ['#1677ff', '#52c41a', '#faad14', '#eb2f96'];

  return (
    <div className="dashboard-container" style={{ padding: '24px' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* 顶部统计卡片 */}
          <Row gutter={[16, 16]}>
            {cardData.map((card, index) => (
              <Col xs={24} sm={12} md={12} lg={6} key={index}>
                <Card bordered={false} bodyStyle={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <Text type="secondary">{card.title}</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Statistic 
                          value={card.value}
                          prefix={card.prefix} 
                          valueStyle={{ color: card.color, fontSize: '24px', fontWeight: 'bold' }}
                        />
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <Text>
                          环比
                          {card.isPositive ? (
                            <span style={{ color: '#52c41a' }}>
                              <ArrowUpOutlined /> {card.growth}%
                            </span>
                          ) : (
                            <span style={{ color: '#f5222d' }}>
                              <ArrowDownOutlined /> {Math.abs(card.growth)}%
                            </span>
                          )}
                        </Text>
                      </div>
                    </div>
                    <div style={{ 
                      background: `${card.color}20`, 
                      borderRadius: '50%', 
                      width: '60px', 
                      height: '60px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '28px',
                      color: card.color
                    }}>
                      {card.icon}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* 中部图表区域 */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            {/* 用户增长趋势折线图 */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Card 
                title="用户增长趋势" 
                bordered={false}
                bodyStyle={{ height: '360px', padding: '24px 0' }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={userGrowthData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="用户数" 
                      stroke="#1677ff" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* 订单分类统计柱状图 */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Card 
                title="订单分类统计" 
                bordered={false}
                bodyStyle={{ height: '360px', padding: '24px 0' }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={orderCategoryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="订单数" fill="#52c41a" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* 用户类型分布饼图 */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Card 
                title="用户类型分布" 
                bordered={false}
                bodyStyle={{ height: '360px', padding: '24px 0' }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      labelLine={true}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="type"
                      label={({ type, percentage }: { type: string, percentage: number }) => `${type}: ${percentage}%`}
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} 人`, '用户数']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* 月访问量面积图 */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <Card 
                title="月访问量趋势" 
                bordered={false}
                bodyStyle={{ height: '360px', padding: '24px 0' }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={visitData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="visits" 
                      name="访问量" 
                      stroke="#eb2f96" 
                      fill="#eb2f9620" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* 底部区域 */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            {/* 最近活动 */}
            <Col xs={24} md={12}>
              <Card title="最近活动" bordered={false}>
                <List
                  itemLayout="horizontal"
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={item.user}
                        description={
                          <>
                            <span>{item.action}</span>
                            <Tag 
                              color={
                                item.type === 'success' ? 'success' : 
                                item.type === 'info' ? 'processing' :
                                item.type === 'warning' ? 'warning' : 'error'
                              } 
                              style={{ marginLeft: '8px' }}
                            >
                              {item.time}
                            </Tag>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* 系统公告 */}
            <Col xs={24} md={12}>
              <Card title="系统公告" bordered={false}>
                <List
                  itemLayout="vertical"
                  dataSource={systemNotices}
                  renderItem={(item) => (
                    <List.Item
                      extra={<Tag>{item.time}</Tag>}
                    >
                      <List.Item.Meta
                        title={<Text strong>{item.title}</Text>}
                        description={item.content}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard; 