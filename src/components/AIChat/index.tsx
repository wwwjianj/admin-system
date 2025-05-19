import React, { useState, useRef, useEffect, use } from 'react';
import { Input, Button, Avatar, Spin, Card, List, Typography, Divider, message as messageAntd, Tag, Upload, Modal } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, PictureOutlined, UploadOutlined, CopyOutlined } from '@ant-design/icons';
import { mockAIChatRequest, sendAIChatRequest } from '../../services/aiService';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { Markdown as ReactMarkdown } from '@ant-design/pro-editor';
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
  modelName?: string;
  useDeepSeek?: boolean;
  useDashScope?: boolean;
  supportImage?: boolean;
  renderMarkdown?: boolean;
}

interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
  imageUrl?: string;
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
  modelName = 'qwen-max',
  useDeepSeek = false,
  useDashScope = false,
  supportImage = false,
  renderMarkdown = true,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch('http://localhost:3001/getMessages').then(res =>{
      console.log(res);
      res.json().then(data => {
        console.log(data);
        setMessages(data.messages);
      });
    } );
  }, []);
  useEffect(() => {
    if(message.length === 0){
      return;
    }
    const newMessage = {
      content: message,
      sender: 'bot',
      timestamp: Date.now(),
    } as Message;
    setMessages(prev =>{
      // 判断是否需要新增一个消息 如果最后一个消息是用户消息，则新增一个机器人消息，如果是机器人消息 则替换最后一个消息为新消息，接口如果返回新的消息，则替换最后一个消息为新消息
      if (prev[prev.length - 1]?.sender === 'user') {
        const newMessages = [...prev, newMessage]; 
        return newMessages; 
      }
      if (prev[prev.length - 1]?.sender === 'bot') { 
        const newMessages = [...prev.slice(0, -1), newMessage]; 
        newMessages[newMessages.length - 1] = newMessage;
        return newMessages;
      }
      return prev;
     
    });
  }, [message]);


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

  // 图片预览相关函数
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleCancel = () => setPreviewOpen(false);

  const handleUploadChange: UploadProps['onChange'] = ({ fileList }) => {
    // 限制只能上传1张图片
    const newFileList = fileList.slice(-1);
    setImageList(newFileList);
  };

  // 将File对象转为base64
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getImageUrl = async (): Promise<string | undefined> => {
    if (imageList.length === 0) return undefined;
    
    const file = imageList[0];
    if (file.url) return file.url;
    if (file.originFileObj) {
      return await getBase64(file.originFileObj);
    }
    return undefined;
  };

  const handleSend = async () => {
    if (!input.trim() && imageList.length === 0) return;

    // 获取图片URL（如果有）
    const imageUrl = await getImageUrl();
    
    const userMessage = {
      content: input || '请分析这张图片',
      sender: 'user' as const,
      timestamp: Date.now(),
      imageUrl,
    };

    // 调用发送事件回调
    onSend?.(input);
    fetch('http://localhost:3001/addMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  // 添加这行指定内容类型
      },
      body: JSON.stringify(userMessage),
    }).then(res => res.json()).then(data => {
      console.log(data);
    });

    // 添加用户消息到聊天
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setImageList([]);
    setLoading(true);

    // 收集历史消息用于上下文（只包含文本内容）
    const history = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));

    try {
      // 使用真实API或模拟API
      let response;
      
      if (apiKey) {
        // 确定使用哪个API端点
        let endpoint = apiEndpoint;
        if (useDeepSeek) endpoint = 'deepseek';
        if (useDashScope) endpoint = 'dashscope';
        
        // 使用真实API
         await sendAIChatRequest(endpoint, {
          message: input || '请分析这张图片',
          apiKey,
          history,
          modelName: useDeepSeek ? modelName : useDashScope ? modelName : undefined,
          imageUrl,
         
        }, 
        // 调用接收事件回调
        (message: string) => {
          setMessage(prev => prev + message);
          
        }, 
        //调用完成事件回调
        (message: string) => {
          
          setLoading(false);
          const userMessage = {
            content: message,
            sender: 'bot' as const,
            timestamp: Date.now(),
          };
          fetch('http://localhost:3001/addmessage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'  // 添加这行指定内容类型
            },
            body: JSON.stringify(userMessage),
          }).then(res => res.json()).then(data => {
            console.log(data);
          });
          setMessage('');
        });
      } else {
        // 使用模拟API
        const result = await mockAIChatRequest(input || '请分析这张图片');
        response = result.text;
      }

      // 添加AI回复到聊天
      const botMessage = {
        content: response,
        sender: 'bot' as const,
        timestamp: Date.now(),
      };
      
      // setMessages((prev) => [...prev, botMessage]);
      
      
    } catch (error) {
      console.error('AI请求失败:', error);
      
      // 添加错误消息
      setMessages((prev) => [
        ...prev,
        {
          content: '抱歉，我遇到了一些问题，无法回答您的问题。请检查API密钥是否正确设置。',
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

  // 渲染消息内容
  const renderMessageContent = (content: string, sender: 'user' | 'bot') => {
    // 复制代码到剪贴板
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(
        () => {
          messageAntd.success('代码已复制到剪贴板');
        },
        () => {
          messageAntd.error('复制失败，请手动复制');
        }
      );
    };

    // 仅对机器人回复使用Markdown渲染
    if (sender === 'bot' && renderMarkdown) {
      return (
        <ReactMarkdown
          // rehypePlugins={[rehypeRaw]}
         
        >
          {content}
        </ReactMarkdown>
      );
    }
    
    // 用户消息或非Markdown模式使用普通文本
    return <Paragraph style={{ margin: 0 }}>{content}</Paragraph>;
  };

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {showAvatar && <RobotOutlined style={{ marginRight: 8 }} />}
            {botName}
          </div>
          <div>
            {useDashScope && (
              <Tag color="orange" style={{ marginLeft: 8 }}>
                百炼: {modelName}
              </Tag>
            )}
            {useDeepSeek && (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                DeepSeek: {modelName}
              </Tag>
            )}
            {supportImage && (
              <Tag color="green" style={{ marginLeft: 8 }}>
                多模态
              </Tag>
            )}
          </div>
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
                  {message.imageUrl && (
                    <div style={{ marginBottom: '8px' }}>
                      <img 
                        src={message.imageUrl} 
                        alt="用户上传图片" 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                        onClick={() => {
                          setPreviewImage(message.imageUrl!);
                          setPreviewOpen(true);
                          setPreviewTitle('图片预览');
                        }}
                      />
                    </div>
                  )}
                  {renderMessageContent(message.content, message.sender)}
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

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
        {supportImage && imageList.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <List
              grid={{ gutter: 8, column: 1 }}
              dataSource={imageList}
              renderItem={(file) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {file.name}
                      </span>
                      <div>
                        <Button 
                          type="text" 
                          icon={<PictureOutlined />} 
                          size="small" 
                          onClick={() => handlePreview(file)}
                        />
                        <Button 
                          type="text" 
                          danger 
                          size="small" 
                          onClick={() => setImageList([])}
                        >
                          移除
                        </Button>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}

        <div style={{ display: 'flex' }}>
          <TextArea
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1, marginRight: '8px' }}
          />
          
          {supportImage && (
            <Upload
              action={'http://localhost:3001/upload'}
              fileList={imageList}
              onChange={handleUploadChange}
              onPreview={handlePreview}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  messageAntd.error('只能上传图片文件!');
                }
                return isImage || Upload.LIST_IGNORE;
              }}
              maxCount={1}
              showUploadList={false}
            >
              <Button 
                icon={<UploadOutlined />} 
                style={{ marginRight: '8px' }}
                disabled={loading || imageList.length >= 1}
              />
            </Upload>
          )}
          
          <Button
            type="primary"
            onClick={handleSend}
            icon={loading ? <Spin size="small" /> : <SendOutlined />}
            disabled={loading || (!input.trim() && imageList.length === 0)}
          />
        </div>
      </div>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Card>
  );
};

export default AIChat; 