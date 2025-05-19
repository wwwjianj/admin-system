import React from 'react';
import { Input, Select, Button, Switch, Radio, Checkbox, DatePicker, Form, Table, Card, Empty, Typography, InputNumber, Slider, Rate, Upload, Divider } from 'antd';
import { ComponentInstance } from './types';
import { UploadOutlined } from '@ant-design/icons';
import AIChat from '../../components/AIChat';

const { Title, Text } = Typography;
const { Option } = Select;
const { Group: RadioGroup } = Radio;
const { Group: CheckboxGroup } = Checkbox;

interface PreviewPanelProps {
  components: ComponentInstance[];
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ components }) => {
  if (components.length === 0) {
    return (
      <div className="preview-empty" style={{ padding: 32, textAlign: 'center' }}>
        <Empty description="暂无组件，请添加组件后查看预览" />
      </div>
    );
  }

  // 渲染组件
  const renderComponent = (component: ComponentInstance) => {
    const { type, props, id } = component;

    // 通用样式属性
    const commonStyle = {
      marginTop: props.marginTop ? `${props.marginTop}px` : '0',
      marginBottom: props.marginBottom ? `${props.marginBottom}px` : '16px',
      paddingLeft: props.paddingLeft ? `${props.paddingLeft}px` : '0',
      paddingRight: props.paddingRight ? `${props.paddingRight}px` : '0',
      textAlign: props.textAlign || 'left',
      backgroundColor: props.backgroundColor || 'transparent',
    };

    switch (type) {
      case 'AIChat':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>AI问答</Text>
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
          </div>
        );
      
      case 'Input':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>输入框</Text>
            <Input
              placeholder={props.placeholder}
              allowClear={props.allowClear}
              disabled={props.disabled}
              style={{ width: '100%' }}
            />
          </div>
        );
      
      case 'TextArea':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>文本域</Text>
            <Input.TextArea
              placeholder={props.placeholder}
              allowClear={props.allowClear}
              disabled={props.disabled}
              rows={props.rows || 3}
            />
          </div>
        );

      case 'InputNumber':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>数字输入框</Text>
            <InputNumber
              style={{ width: '100%' }}
              min={props.min}
              max={props.max}
              disabled={props.disabled}
            />
          </div>
        );
      
      case 'Select':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>下拉选择</Text>
            <Select
              style={{ width: '100%' }}
              placeholder={props.placeholder}
              allowClear={props.allowClear}
              disabled={props.disabled}
            >
              {props.options?.map((option: any) => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </div>
        );
      
      case 'Button':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>按钮</Text>
            <Button
              type={props.type}
              size={props.size}
              disabled={props.disabled}
            >
              {props.text || '按钮'}
            </Button>
          </div>
        );
      
      case 'Switch':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>开关</Text>
            <Switch
              defaultChecked={props.defaultChecked}
              disabled={props.disabled}
              checkedChildren={props.checkedChildren}
              unCheckedChildren={props.unCheckedChildren}
            />
          </div>
        );
      
      case 'Radio':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>单选框组</Text>
            <RadioGroup 
              defaultValue={props.defaultValue} 
              disabled={props.disabled}
            >
              {props.options?.map((option: any) => (
                <Radio key={option.value} value={option.value}>{option.label}</Radio>
              ))}
            </RadioGroup>
          </div>
        );
      
      case 'Checkbox':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>复选框组</Text>
            <CheckboxGroup 
              defaultValue={props.defaultValue} 
              disabled={props.disabled}
              options={props.options}
            />
          </div>
        );
      
      case 'DatePicker':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>日期选择</Text>
            <DatePicker
              style={{ width: '100%' }}
              placeholder={props.placeholder}
              allowClear={props.allowClear}
              disabled={props.disabled}
            />
          </div>
        );
        
      case 'TimePicker':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>时间选择</Text>
            <DatePicker.TimePicker
              style={{ width: '100%' }}
              placeholder={props.placeholder}
              allowClear={props.allowClear}
              disabled={props.disabled}
            />
          </div>
        );
        
      case 'RangePicker':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>日期范围</Text>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              placeholder={props.placeholder}
              allowClear={props.allowClear}
              disabled={props.disabled}
            />
          </div>
        );
      
      case 'Slider':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>滑动输入条</Text>
            <Slider 
              defaultValue={props.defaultValue || 30} 
              disabled={props.disabled}
              min={props.min}
              max={props.max}
            />
          </div>
        );
        
      case 'Rate':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>评分</Text>
            <Rate 
              defaultValue={props.defaultValue || 3} 
              disabled={props.disabled}
              count={props.count || 5}
            />
          </div>
        );
        
      case 'Upload':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>上传</Text>
            <Upload disabled={props.disabled}>
              <Button icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
          </div>
        );
        
      case 'Card':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>卡片</Text>
            <Card title={props.title || "卡片标题"} bordered={props.bordered !== false}>
              {props.content || "卡片内容"}
            </Card>
          </div>
        );
        
      case 'Divider':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>分割线</Text>
            <Divider orientation={props.orientation} dashed={props.dashed}>
              {props.text}
            </Divider>
          </div>
        );
      
      case 'Form':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>表单</Text>
            <Card bordered>
              <Form
                layout={props.layout}
                labelCol={{ span: props.labelCol?.span }}
                wrapperCol={{ span: props.wrapperCol?.span }}
              >
                <Form.Item label="示例字段1" name="field1">
                  <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="示例字段2" name="field2">
                  <Select placeholder="请选择">
                    <Option value="1">选项1</Option>
                    <Option value="2">选项2</Option>
                  </Select>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: props.layout === 'horizontal' ? props.labelCol?.span : 0 }}>
                  <Button type="primary">提交</Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        );
      
      case 'Table':
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="secondary" style={{ marginBottom: 4, display: 'block' }}>表格</Text>
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
          </div>
        );
      
      default:
        return (
          <div key={id} className="preview-component" style={commonStyle}>
            <Text type="warning">未知组件类型: {type}</Text>
            <div style={{ 
              padding: '8px', 
              border: '1px dashed #ff4d4f',
              borderRadius: '4px',
              color: '#ff4d4f',
              textAlign: 'center'
            }}>
              该组件类型"{type}"暂不支持预览
            </div>
          </div>
        );
    }
  };

  return (
    <div className="preview-container" style={{ padding: 24 }}>
      <Card title="预览效果" style={{ marginBottom: 16 }}>
        <Text type="secondary">以下是当前配置的预览效果，实际效果可能会因为主题和样式设置而有所不同。</Text>
      </Card>
      
      <div className="preview-content" style={{ 
        padding: 16, 
        border: '1px dashed #ccc', 
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {components.map(component => renderComponent(component))}
      </div>
    </div>
  );
};

export default PreviewPanel; 