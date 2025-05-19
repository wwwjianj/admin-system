import React from 'react';
import { Card, Typography, Input, Select, Button, Switch, Radio, Checkbox, DatePicker, Form, Table, InputNumber, Slider, Rate, Upload, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ComponentInstance } from './types';
import AIChat from '../../components/AIChat';

const { Text } = Typography;
const { Option } = Select;

// 配置组件渲染函数
export const renderConfigComponent = (component: ComponentInstance) => {
  const { type, props } = component;

  switch (type) {
    case 'AIChat':
      return (
        <AIChat
          placeholder={props.placeholder}
          botName={props.botName}
          welcomeMessage={props.welcomeMessage}
          apiKey={props.apiKey}
          apiEndpoint={props.apiEndpoint}
          theme={props.theme}
          height={props.height}
          showAvatar={props.showAvatar}
          useDeepSeek={props.useDeepSeek}
          modelName={props.modelName}
          useDashScope={props.useDashScope}
          supportImage={props.supportImage}
        />
      );
    
    case 'Input':
      return (
        <Input
          placeholder={props.placeholder || '请输入'}
          allowClear={props.allowClear}
          disabled={props.disabled}
        />
      );
    
    case 'TextArea':
      return (
        <Input.TextArea
          placeholder={props.placeholder || '请输入'}
          allowClear={props.allowClear}
          disabled={props.disabled}
          rows={props.rows || 3}
        />
      );
    
    case 'InputNumber':
      return (
        <InputNumber
          placeholder={props.placeholder || '请输入数字'}
          disabled={props.disabled}
          min={props.min}
          max={props.max}
          style={{ width: '100%' }}
        />
      );
    
    case 'Select':
      return (
        <Select
          placeholder={props.placeholder || '请选择'}
          allowClear={props.allowClear}
          disabled={props.disabled}
          style={{ width: '100%' }}
        >
          {props.options?.map((option: any) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      );
    
    case 'Button':
      return (
        <Button
          type={props.type || 'default'}
          size={props.size || 'middle'}
          disabled={props.disabled}
        >
          {props.text || '按钮'}
        </Button>
      );
    
    case 'Switch':
      return (
        <Switch
          defaultChecked={props.defaultChecked}
          disabled={props.disabled}
          checkedChildren={props.checkedChildren}
          unCheckedChildren={props.unCheckedChildren}
        />
      );
    
    case 'Radio':
      return (
        <Radio.Group defaultValue={props.defaultValue} disabled={props.disabled}>
          {props.options?.map((option: any) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      );
    
    case 'Checkbox':
      return (
        <Checkbox.Group 
          defaultValue={props.defaultValue} 
          disabled={props.disabled}
          options={props.options}
        />
      );
    
    case 'DatePicker':
      return (
        <DatePicker
          placeholder={props.placeholder}
          allowClear={props.allowClear}
          disabled={props.disabled}
          style={{ width: '100%' }}
        />
      );
    
    case 'TimePicker':
      return (
        <DatePicker.TimePicker
          placeholder={props.placeholder}
          allowClear={props.allowClear}
          disabled={props.disabled}
          style={{ width: '100%' }}
        />
      );
    
    case 'RangePicker':
      return (
        <DatePicker.RangePicker
          placeholder={props.placeholder}
          allowClear={props.allowClear}
          disabled={props.disabled}
          style={{ width: '100%' }}
        />
      );
    
    case 'Slider':
      return (
        <Slider
          defaultValue={props.defaultValue || 30}
          disabled={props.disabled}
          min={props.min}
          max={props.max}
        />
      );
    
    case 'Rate':
      return (
        <Rate
          defaultValue={props.defaultValue || 3}
          disabled={props.disabled}
          count={props.count || 5}
        />
      );
    
    case 'Upload':
      return (
        <Upload disabled={props.disabled}>
          <Button icon={<UploadOutlined />}>
            {props.text || '点击上传'}
          </Button>
        </Upload>
      );
    
    case 'Card':
      return (
        <Card
          title={props.title || "卡片标题"}
          bordered={props.bordered !== false}
          size="small"
        >
          {props.content || "卡片内容"}
        </Card>
      );
    
    case 'Divider':
      return (
        <Divider
          orientation={props.orientation}
          dashed={props.dashed}
          plain={props.plain}
        >
          {props.text}
        </Divider>
      );
    
    case 'Form':
      return (
        <Form
          layout={props.layout}
          labelCol={{ span: props.labelCol?.span }}
          wrapperCol={{ span: props.wrapperCol?.span }}
        >
          <Form.Item label="示例字段" name="field1">
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: props.layout === 'horizontal' ? props.labelCol?.span : 0 }}>
            <Button type="primary">提交</Button>
          </Form.Item>
        </Form>
      );
    
    case 'Table':
      return (
        <Table
          columns={props.columns || [{
            title: '列1',
            dataIndex: 'col1',
            key: 'col1',
          }, {
            title: '列2',
            dataIndex: 'col2',
            key: 'col2',
          }]}
          dataSource={props.dataSource || [{
            key: '1',
            col1: '数据1',
            col2: '数据2',
          }]}
          pagination={props.pagination ? { pageSize: 5 } : false}
          bordered={props.bordered}
          size="small"
        />
      );
    
    default:
      return (
        <div style={{ padding: '8px', border: '1px dashed #ff4d4f', color: '#ff4d4f', borderRadius: '4px', textAlign: 'center' }}>
          <Text type="warning">未知组件类型: {type}</Text>
        </div>
      );
  }
}; 