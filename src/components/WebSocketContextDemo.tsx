import React, { useState, useEffect } from 'react';
import { Card, List, Input, Button, Space, Tabs, Typography, Alert, Tag } from 'antd';
import { SendOutlined, UserOutlined, TeamOutlined, BellOutlined } from '@ant-design/icons';
import { 
  useWebSocketContext, 
  WebSocketProvider, 
  WebSocketConnectionStatus,
  WebSocketMessageHandler
} from '../hooks';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

// 消息类型定义
interface ChatMessage {
  sender: string;
  content: string;
  timestamp: number;
  room?: string;
}

interface NotificationMessage {
  title: string;
  content: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}

// 聊天室组件
const ChatRoom: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [username, setUsername] = useState('用户' + Math.floor(Math.random() * 1000));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { sendMessage, lastMessage, status } = useWebSocketContext();

  // 模拟初始消息
  useEffect(() => {
    setMessages([
      {
        sender: '系统',
        content: '欢迎来到聊天室！',
        timestamp: Date.now() - 60000
      },
      {
        sender: '张三',
        content: '大家好！',
        timestamp: Date.now() - 45000
      },
      {
        sender: '李四',
        content: '你好，张三！',
        timestamp: Date.now() - 30000
      }
    ]);
  }, []);

  // 处理消息
  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'chat') {
          addMessage(data.data);
        }
      } catch (error) {
        console.error('解析消息失败:', error);
      }
    }
  }, [lastMessage]);

  // 添加消息
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const message: ChatMessage = {
      sender: username,
      content: inputValue,
      timestamp: Date.now()
    };

    sendMessage({
      type: 'chat',
      data: message
    });

    // 由于使用的是echo服务器，手动添加消息到列表
    addMessage(message);
    setInputValue('');
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space>
        <Input
          addonBefore="用户名"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: 200 }}
        />
        <WebSocketConnectionStatus>
          {(status) => (
            <Tag color={status === 'OPEN' ? 'success' : 'error'}>
              {status === 'OPEN' ? '已连接' : '未连接'}
            </Tag>
          )}
        </WebSocketConnectionStatus>
      </Space>

      {/* 接收消息处理器组件 */}
      <WebSocketMessageHandler<ChatMessage> type="chat">
        {(data) => (
          <Alert 
            message={`收到新消息: ${data.sender} 说 "${data.content}"`} 
            type="info" 
            showIcon 
            banner 
            style={{ marginBottom: 16 }}
          />
        )}
      </WebSocketMessageHandler>

      <List
        bordered
        dataSource={messages}
        renderItem={message => (
          <List.Item>
            <List.Item.Meta
              avatar={<UserOutlined style={{ fontSize: 24, color: message.sender === username ? '#1890ff' : '#52c41a' }} />}
              title={
                <Space>
                  <Text strong>{message.sender}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Text>
                </Space>
              }
              description={message.content}
            />
          </List.Item>
        )}
        style={{ 
          height: 300, 
          overflow: 'auto' 
        }}
      />

      <Space.Compact style={{ width: '100%' }}>
        <Input 
          value={inputValue} 
          onChange={e => setInputValue(e.target.value)} 
          onPressEnter={handleSend}
          placeholder="输入消息内容..."
          disabled={status !== 'OPEN'}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSend}
          disabled={status !== 'OPEN'}
        >
          发送
        </Button>
      </Space.Compact>
    </Space>
  );
};

// 通知组件
const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const { lastMessage } = useWebSocketContext();

  // 模拟初始通知
  useEffect(() => {
    setNotifications([
      {
        title: '系统更新',
        content: '系统将于今晚22:00进行更新维护',
        type: 'info',
        timestamp: Date.now() - 3600000
      },
      {
        title: '新消息',
        content: '您有3条未读消息',
        type: 'success',
        timestamp: Date.now() - 1800000
      }
    ]);
  }, []);

  // 添加通知
  const addNotification = (notification: NotificationMessage) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // 处理通知（模拟）
  useEffect(() => {
    const timer = setInterval(() => {
      const types = ['success', 'info', 'warning', 'error'] as const;
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      addNotification({
        title: `自动通知 ${new Date().toLocaleTimeString()}`,
        content: `这是一条${randomType === 'success' ? '成功' : 
                     randomType === 'info' ? '信息' : 
                     randomType === 'warning' ? '警告' : '错误'}通知`,
        type: randomType,
        timestamp: Date.now()
      });
    }, 30000); // 每30秒模拟一条通知

    return () => clearInterval(timer);
  }, []);

  return (
    <List
      dataSource={notifications}
      renderItem={notification => (
        <List.Item>
          <Alert
            message={notification.title}
            description={
              <div>
                <p>{notification.content}</p>
                <Text type="secondary">
                  {new Date(notification.timestamp).toLocaleString()}
                </Text>
              </div>
            }
            type={notification.type}
            showIcon
            style={{ width: '100%' }}
          />
        </List.Item>
      )}
      style={{ 
        height: 400, 
        overflow: 'auto' 
      }}
    />
  );
};

// 主页组件
const WebSocketContextDemo: React.FC = () => {
  return (
    <WebSocketProvider
      options={{
        url: 'wss://echo.websocket.org',
        autoReconnect: true,
        reconnectAttempts: 5,
        reconnectInterval: 3000,
        heartbeatInterval: 30000
      }}
    >
      <Card title="WebSocket Context 演示">
        <Tabs defaultActiveKey="chat">
          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                聊天室
              </span>
            } 
            key="chat"
          >
            <ChatRoom />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <BellOutlined />
                通知
              </span>
            } 
            key="notifications"
          >
            <Notifications />
          </TabPane>
        </Tabs>
      </Card>
    </WebSocketProvider>
  );
};

export default WebSocketContextDemo; 