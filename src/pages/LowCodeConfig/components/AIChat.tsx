import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Avatar, Spin, Card, List, Typography, Divider, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { mockAIChatRequest, sendAIChatRequest } from '../../../services/aiService';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

export interface AIChatProps {
  placeholder?: string;
  botName?: string;
  welcomeMessage?: string;
  apiKey?: string;
  apiEndpoint?: string;
  theme?: 'light' | 'dark' | 'blue';
  height?: number;
  showAvatar?: boolean;
  onSend?: (message: string) => void;
  onReceive?: (message: string) => void;
}

interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const AIChat: React.FC<AIChatProps> = ({
  placeholder = '请输入您的问题...',
  botName = 'AI助手',
  welcomeMessage = '您好！我是AI助手，有什么可以帮您的吗？',
  apiKey,
  apiEndpoint = 'https://api.example.com/chat',
  theme = 'light',
  height = 400,
  showAvatar = true,
  onSend,
  onReceive,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化欢迎消息
  useEffect(() => {
    if (welcomeMessage && messages.length === 0) {
      setMessages([
        {
          content: welcomeMessage,
          sender: 'bot',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [welcomeMessage]);

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      content: input,
      sender: 'user' as const,
      timestamp: Date.now(),
    };

    // 调用发送事件回调
    onSend?.(input);

    // 添加用户消息到聊天
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // 收集历史消息用于上下文
    const history = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));

    try {
      // 使用真实API或模拟API
      let response;
      
      if (apiKey && apiEndpoint && apiEndpoint !== 'https://api.example.com/chat') {
        // 使用真实API
        const result = await sendAIChatRequest(apiEndpoint, {
          message: input,
          apiKey,
          history
        });
        response = result.text;
      } else {
        // 使用模拟API
        const result = await mockAIChatRequest(input);
        response = result.text;
      }

      // 添加AI回复到聊天
      const botMessage = {
        content: response,
        sender: 'bot' as const,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // 调用接收事件回调
      onReceive?.(response);
    } catch (error) {
      console.error('AI请求失败:', error);
      message.error('与AI服务通信失败，请检查网络或API配置');
      
      // 添加错误消息
      setMessages((prev) => [
        ...prev,
        {
          content: '抱歉，我遇到了一些问题，无法回答您的问题。',
          sender: 'bot',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 根据主题获取样式
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          backgroundColor: '#1f1f1f',
          textColor: '#ffffff',
          userBubbleColor: '#177ddc',
          botBubbleColor: '#141414',
        };
      case 'blue':
        return {
          backgroundColor: '#f0f5ff',
          textColor: '#000000',
          userBubbleColor: '#1890ff',
          botBubbleColor: '#e6f7ff',
        };
      case 'light':
      default:
        return {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          userBubbleColor: '#1890ff',
          botBubbleColor: '#f0f0f0',
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <Card
      style={{
        height: height || 400,
        display: 'flex',
        flexDirection: 'column',
        background: themeStyles.backgroundColor,
        color: themeStyles.textColor,
      }}
      bodyStyle={{ 
        padding: '12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {showAvatar && <RobotOutlined style={{ marginRight: 8 }} />}
          {botName}
        </div>
      }
    >
      <div
        className="ai-chat-messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          marginBottom: '8px',
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={(message) => (
            <List.Item
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                padding: '4px 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  maxWidth: '80%',
                  alignItems: 'flex-start',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                }}
              >
                {showAvatar && (
                  <Avatar
                    icon={message.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{ 
                      backgroundColor: message.sender === 'user' ? '#1890ff' : '#52c41a',
                      margin: '0 8px'
                    }}
                  />
                )}
                <div
                  style={{
                    backgroundColor:
                      message.sender === 'user'
                        ? themeStyles.userBubbleColor
                        : themeStyles.botBubbleColor,
                    padding: '8px 12px',
                    borderRadius: '12px',
                    color: message.sender === 'user' ? '#fff' : themeStyles.textColor,
                    wordBreak: 'break-word',
                  }}
                >
                  <Paragraph style={{ margin: 0 }}>{message.content}</Paragraph>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'right' }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <div style={{ display: 'flex', marginTop: 'auto' }}>
        <TextArea
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1, marginRight: '8px' }}
        />
        <Button
          type="primary"
          onClick={handleSend}
          icon={loading ? <Spin size="small" /> : <SendOutlined />}
          disabled={loading || !input.trim()}
        />
      </div>
    </Card>
  );
};

export default AIChat; 