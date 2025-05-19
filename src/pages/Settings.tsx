import React from 'react';
import { Tabs, Form, Input, Button, Switch, Select, Radio, Upload, message, Card } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const Settings: React.FC = () => {
  const [systemForm] = Form.useForm();
  const [securityForm] = Form.useForm();

  const handleSystemSave = (values: any) => {
    console.log('系统设置保存:', values);
    message.success('系统设置保存成功');
  };

  const handleSecuritySave = (values: any) => {
    console.log('安全设置保存:', values);
    message.success('安全设置保存成功');
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '基本设置',
      children: (
        <Card>
          <Form
            form={systemForm}
            layout="vertical"
            onFinish={handleSystemSave}
            initialValues={{
              siteName: '企业后台管理系统',
              siteDescription: '一个简单高效的企业管理系统',
              recordNumber: 'ICP备123456号',
              theme: 'default',
              pageSize: 10,
              enableCache: true,
            }}
          >
            <Form.Item label="系统名称" name="siteName" rules={[{ required: true, message: '请输入系统名称' }]}>
              <Input placeholder="请输入系统名称" />
            </Form.Item>
            <Form.Item label="系统描述" name="siteDescription">
              <TextArea rows={4} placeholder="请输入系统描述" />
            </Form.Item>
            <Form.Item label="备案号" name="recordNumber">
              <Input placeholder="请输入备案号" />
            </Form.Item>
            <Form.Item label="系统Logo" name="logo">
              <Upload name="logo" action="/api/upload" listType="picture">
                <Button icon={<UploadOutlined />}>点击上传</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="系统主题" name="theme">
              <Radio.Group>
                <Radio value="default">默认主题</Radio>
                <Radio value="dark">暗色主题</Radio>
                <Radio value="light">亮色主题</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="分页大小" name="pageSize">
              <Select>
                <Option value={10}>10条/页</Option>
                <Option value={20}>20条/页</Option>
                <Option value={50}>50条/页</Option>
                <Option value={100}>100条/页</Option>
              </Select>
            </Form.Item>
            <Form.Item label="开启缓存" name="enableCache" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: '2',
      label: '安全设置',
      children: (
        <Card>
          <Form
            form={securityForm}
            layout="vertical"
            onFinish={handleSecuritySave}
            initialValues={{
              passwordExpireDays: 90,
              maxLoginAttempts: 5,
              lockTime: 30,
              enableTwoFactor: false,
              logKeepDays: 30,
            }}
          >
            <Form.Item label="密码过期时间(天)" name="passwordExpireDays" rules={[{ required: true }]}>
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item label="最大登录尝试次数" name="maxLoginAttempts" rules={[{ required: true }]}>
              <Input type="number" min={1} />
            </Form.Item>
            <Form.Item label="账户锁定时间(分钟)" name="lockTime" rules={[{ required: true }]}>
              <Input type="number" min={1} />
            </Form.Item>
            <Form.Item label="启用双因素认证" name="enableTwoFactor" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="日志保留时间(天)" name="logKeepDays" rules={[{ required: true }]}>
              <Input type="number" min={1} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default Settings; 