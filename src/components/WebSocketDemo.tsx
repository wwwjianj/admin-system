import React, { useState, useEffect } from 'react';
import { Card, List, Input, Button, Space, Badge, Typography, Divider } from 'antd';
import { SendOutlined, ReloadOutlined, DisconnectOutlined, LinkOutlined } from '@ant-design/icons';
import { useWebSocket } from '../hooks';

const { Text } = Typography;

interface Message {
  content: string;
  timestamp: number;
  type: 'sent' | 'received';
}

/**
 * WebSocket演示组件
 * 用于展示WebSocket Hook的使用方法
 */
const WebSocketDemo: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [serverUrl, setServerUrl] = useState('wss://echo.websocket.org');
  
  // 使用WebSocket Hook
  const {
    status,
    sendMessage,
    lastMessage,
    readyState,
    connect,
    disconnect,
    reconnect
  } = useWebSocket({
    url: serverUrl,
    onOpen: () => {
      addMessage('系统消息: 连接已建立', 'received');
    },
    onClose: () => {
      addMessage('系统消息: 连接已关闭', 'received');
    },
    onError: () => {
      addMessage('系统消息: 连接错误', 'received');
    },
    autoReconnect: true,
    reconnectAttempts: 5,
    reconnectInterval: 3000
  });
  
  // 处理收到的消息
  useEffect(() => {
    if (lastMessage) {
      addMessage(`收到消息: ${lastMessage.data}`, 'received');
    }
  }, [lastMessage]);
  
  // 添加消息到列表
  const addMessage = (content: string, type: 'sent' | 'received') => {
    setMessages(prev => [...prev, {
      content,
      timestamp: Date.now(),
      type
    }]);
  };
  
  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    try {
      sendMessage(inputValue);
      addMessage(`发送消息: ${inputValue}`, 'sent');
      setInputValue('');
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };
  
  // 获取连接状态显示颜色
  const getStatusColor = () => {
    switch (status) {
      case 'OPEN':
        return 'success';
      case 'CONNECTING':
      case 'RECONNECTING':
        return 'processing';
      case 'CLOSING':
        return 'warning';
      case 'CLOSED':
      default:
        return 'error';
    }
  };
  
  return (
    <Card 
      title="WebSocket 消息演示" 
      extra={
        <Badge status={getStatusColor()} text={status} />
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Input 
            addonBefore="服务器URL" 
            value={serverUrl} 
            onChange={e => setServerUrl(e.target.value)} 
            style={{ width: 350 }}
          />
          <Button 
            type="primary" 
            icon={<LinkOutlined />} 
            onClick={connect}
            disabled={readyState === WebSocket.OPEN || readyState === WebSocket.CONNECTING}
          >
            连接
          </Button>
          <Button 
            danger 
            icon={<DisconnectOutlined />} 
            onClick={disconnect}
            disabled={readyState !== WebSocket.OPEN}
          >
            断开
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={reconnect}
            disabled={readyState === WebSocket.OPEN}
          >
            重连
          </Button>
        </Space>
        
        <Divider orientation="left">消息记录</Divider>
        
        <List
          bordered
          dataSource={messages}
          renderItem={message => (
            <List.Item style={{ textAlign: message.type === 'sent' ? 'right' : 'left' }}>
              <Text 
                style={{ 
                  backgroundColor: message.type === 'sent' ? '#e6f7ff' : '#f6ffed',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  display: 'inline-block'
                }}
              >
                {message.content}
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </div>
            </List.Item>
          )}
          style={{ 
            height: 300, 
            overflow: 'auto',
            marginBottom: 16
          }}
        />
        
        <Space.Compact style={{ width: '100%' }}>
          <Input 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onPressEnter={handleSend}
            placeholder="输入消息内容..."
            disabled={readyState !== WebSocket.OPEN}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSend}
            disabled={readyState !== WebSocket.OPEN}
          >
            发送
          </Button>
        </Space.Compact>
        
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            提示: 输入消息并点击"发送"按钮，服务器会将相同的消息发送回来。
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default WebSocketDemo; 