import React, { useState } from 'react';
import { Card, Typography, Space, Input, Button, Form, Select, Switch, Divider, Tabs, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import AIChat from '../components/AIChat';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const AITest: React.FC = () => {
  const [deepSeekApiKey, setDeepSeekApiKey] = useState('');
  const [deepSeekModel, setDeepSeekModel] = useState('deepseek-chat');
  
  const [dashScopeApiKey, setDashScopeApiKey] = useState('sk-4275960083fc4b94885b8ce91514fbe5');
  const [dashScopeModel, setDashScopeModel] = useState('qwen-max');
  const [supportImage, setSupportImage] = useState(true);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Typography>
          <Title level={2}>AI聊天组件测试</Title>
          <Paragraph>
            这是一个测试页面，用于验证AI聊天组件是否正常工作。页面展示了不同AI模型的集成示例。
          </Paragraph>
        </Typography>
      </Card>
      
      <Tabs defaultActiveKey="dashscope" style={{ marginBottom: '24px' }}>
        <TabPane tab="阿里云百炼" key="dashscope">
          <Card title="阿里云百炼配置" style={{ marginBottom: '24px' }}>
            <Form layout="vertical">
              <Form.Item label="API密钥" required tooltip="请输入有效的阿里云百炼API密钥">
                <Input.Password 
                  placeholder="输入阿里云百炼API密钥" 
                  value={dashScopeApiKey} 
                  onChange={e => setDashScopeApiKey(e.target.value)}
                />
                <Text type="secondary">示例：sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</Text>
              </Form.Item>
              
              <Form.Item label="模型">
                <Select value={dashScopeModel} onChange={value => setDashScopeModel(value)}>
                  <Option value="qwen-max">qwen-max (通义千问大模型)</Option>
                  <Option value="qwen-plus">qwen-plus (通义千问中型)</Option>
                  <Option value="qwen-turbo">qwen-turbo (通义千问小型)</Option>
                  <Option value="qwen-vl-max">qwen-vl-max (通义千问多模态大模型)</Option>
                  <Option value="qwen-vl-plus">qwen-vl-plus (通义千问多模态中型)</Option>
                </Select>
              </Form.Item>

              <Form.Item label="支持图片上传">
                <Switch checked={supportImage} onChange={checked => setSupportImage(checked)} />
                <Text type="secondary" style={{ marginLeft: '8px' }}>
                  只有多模态模型(qwen-vl系列)支持图片分析
                </Text>
              </Form.Item>
            </Form>
          </Card>
          
          <Card title="阿里云百炼AI聊天" style={{ marginBottom: '24px' }}>
            <AIChat 
              botName="阿里云百炼助手" 
              welcomeMessage="您好！我是基于阿里云百炼的AI助手，有什么可以帮您的吗？"
              apiKey={dashScopeApiKey}
              useDashScope={true}
              modelName={dashScopeModel}
              theme="light"
              height={500}
              supportImage={supportImage && (dashScopeModel.includes('vl'))}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="DeepSeek" key="deepseek">
          <Card title="DeepSeek配置" style={{ marginBottom: '24px' }}>
            <Form layout="vertical">
              <Form.Item label="API密钥" required>
                <Input.Password 
                  placeholder="输入DeepSeek API密钥" 
                  value={deepSeekApiKey} 
                  onChange={e => setDeepSeekApiKey(e.target.value)}
                />
                <Text type="secondary">您需要有效的DeepSeek API密钥才能使用DeepSeek API</Text>
              </Form.Item>
              
              <Form.Item label="模型">
                <Select value={deepSeekModel} onChange={value => setDeepSeekModel(value)}>
                  <Option value="deepseek-chat">deepseek-chat</Option>
                  <Option value="deepseek-coder">deepseek-coder</Option>
                  <Option value="deepseek-chat-v2">deepseek-chat-v2</Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>
          
          <Card title="DeepSeek AI聊天" style={{ marginBottom: '24px' }}>
            <AIChat 
              botName="DeepSeek AI助手" 
              welcomeMessage="您好！我是基于DeepSeek的AI助手，有什么可以帮您的吗？"
              apiKey={deepSeekApiKey}
              useDeepSeek={true}
              modelName={deepSeekModel}
              theme="light"
              height={500}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="示例主题" key="themes">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="默认主题 (Light)">
              <AIChat 
                botName="默认AI助手" 
                welcomeMessage="您好！我是默认主题的AI助手，有什么可以帮您的吗？"
                height={400}
              />
            </Card>
            
            <Card title="暗色主题 (Dark)">
              <AIChat 
                botName="暗色AI助手" 
                welcomeMessage="您好！我是暗色主题的AI助手，有什么可以帮您的吗？"
                theme="dark"
                height={400}
              />
            </Card>
            
            <Card title="蓝色主题 (Blue)">
              <AIChat 
                botName="蓝色AI助手" 
                welcomeMessage="您好！我是蓝色主题的AI助手，有什么可以帮您的吗？"
                theme="blue"
                height={400}
              />
            </Card>
          </Space>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AITest; 