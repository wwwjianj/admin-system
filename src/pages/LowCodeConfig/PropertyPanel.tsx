import React, { useState } from 'react';
import { Card, Typography, Form, Input, Select, Switch, Slider, ColorPicker, Tabs, Button, InputNumber, Divider, Collapse, Empty, Tooltip } from 'antd';
import { ComponentInstance, ComponentDefinition, PropertyDefinition } from './types';
import { 
  SettingOutlined, 
  CodeOutlined, 
  QuestionCircleOutlined, 
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  MinusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

export interface PropertyPanelProps {
  component: ComponentInstance | null;
  componentDefinitions: ComponentDefinition[];
  onUpdateProperty: (id: string, propName: string, value: any) => void;
  onUpdateEvent: (id: string, eventName: string, code: string) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  component,
  componentDefinitions,
  onUpdateProperty,
  onUpdateEvent,
}) => {
  const [activeTab, setActiveTab] = useState('properties');
  
  if (!component) {
    return (
      <div className="property-panel-empty" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Card 
          title="属性配置" 
          bordered={false} 
          style={{ height: '100%' }}
          bodyStyle={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}
        >
          <Empty 
            description="请选择一个组件进行配置" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </Card>
      </div>
    );
  }

  const componentDef = componentDefinitions.find(def => def.type === component.type);
  if (!componentDef) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        未找到组件定义
      </div>
    );
  }

  const renderPropertyInput = (prop: PropertyDefinition) => {
    const value = component.props[prop.name];
    
    switch (prop.type) {
      case 'string':
        return (
          <Input 
            value={value} 
            onChange={e => onUpdateProperty(component.id, prop.name, e.target.value)} 
            placeholder={`请输入${prop.label}`}
          />
        );
      case 'number':
        return (
          <InputNumber 
            style={{ width: '100%' }}
            value={value} 
            onChange={val => onUpdateProperty(component.id, prop.name, val)} 
            placeholder={`请输入${prop.label}`}
            min={prop.min}
            max={prop.max}
          />
        );
      case 'boolean':
        return (
          <Switch 
            checked={value} 
            onChange={checked => onUpdateProperty(component.id, prop.name, checked)} 
          />
        );
      case 'select':
        return (
          <Select
            value={value}
            onChange={val => onUpdateProperty(component.id, prop.name, val)}
            options={prop.options}
            style={{ width: '100%' }}
            placeholder={`请选择${prop.label}`}
          />
        );
      case 'color':
        return (
          <ColorPicker
            value={value}
            onChange={color => onUpdateProperty(component.id, prop.name, color.toHexString())}
            showText
          />
        );
      case 'slider':
        return (
          <Slider
            value={value}
            onChange={val => onUpdateProperty(component.id, prop.name, val)}
            min={prop.min}
            max={prop.max}
          />
        );
      case 'array':
        return (
          <Button onClick={() => {
            // 简单示例，实际应该打开一个数组编辑的模态框
            const newValue = JSON.stringify(value || []);
            const userInput = prompt('编辑数组 (JSON 格式)', newValue);
            if (userInput) {
              try {
                const parsed = JSON.parse(userInput);
                onUpdateProperty(component.id, prop.name, parsed);
              } catch (e) {
                alert('无效的 JSON 格式');
              }
            }
          }}>
            {value && Array.isArray(value) ? `编辑 (${value.length}项)` : '添加项'}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="property-panel" style={{ height: '100%' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>属性配置</span>
            <Text type="secondary" style={{ fontSize: '12px' }}>{component.type}</Text>
          </div>
        }
        bordered={false}
        style={{ height: '100%' }}
        bodyStyle={{ padding: '0', height: 'calc(100% - 46px)' }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarStyle={{ padding: '0 16px', marginBottom: 0 }}
          style={{ height: '100%' }}
        >
          <TabPane 
            tab={<span><SettingOutlined />属性</span>} 
            key="properties"
            style={{ height: 'calc(100% - 46px)', overflow: 'auto', padding: '16px' }}
          >
            <Form layout="vertical" style={{ height: '100%' }}>
              <Collapse 
                defaultActiveKey={['basic','style', 'content', 'behavior','display']} 
                bordered={false}
                style={{ background: 'transparent' }}
              >
                <Panel header="基础属性" key="basic">
                  {componentDef.properties
                    .filter(prop => !['width', 'height', 'left', 'top', 'color', 'fontSize', 'fontWeight', 'textAlign', 'lineHeight'].includes(prop.name))
                    .map(prop => (
                      <Form.Item 
                        key={prop.name} 
                        label={
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{prop.label}</span>
                            <Tooltip title={`属性名: ${prop.name}`}>
                              <QuestionCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                            </Tooltip>
                          </div>
                        }
                      >
                        {renderPropertyInput(prop)}
                      </Form.Item>
                    ))
                  }
                </Panel>
                
                <Panel header="样式设置" key="style">
                  <Form.Item label="宽度">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Select
                        style={{ width: '100px', marginRight: '8px' }}
                        value={typeof component.size?.width === 'string' && component.size.width.includes('%') ? 'percent' : 'pixel'}
                        onChange={(value) => {
                          const currentSize = component.size || { width: "100%", height: 80 };
                          if (value === 'percent') {
                            onUpdateProperty(component.id, 'size', { 
                              ...currentSize, 
                              width: "100%" 
                            });
                          } else {
                            onUpdateProperty(component.id, 'size', { 
                              ...currentSize, 
                              width: 200
                            });
                          }
                        }}
                      >
                        <Select.Option value="pixel">像素</Select.Option>
                        <Select.Option value="percent">百分比</Select.Option>
                      </Select>
                      
                      {typeof component.size?.width === 'string' && component.size.width.includes('%') ? (
                        <InputNumber
                          style={{ flex: 1 }}
                          value={parseInt(component.size.width)}
                          onChange={val => {
                            const currentSize = component.size || { width: "100%", height: 80 };
                            onUpdateProperty(component.id, 'size', { 
                              ...currentSize, 
                              width: `${val}%`
                            });
                          }}
                          min={0}
                          max={100}
                          addonAfter="%"
                        />
                      ) : (
                        <InputNumber
                          style={{ flex: 1 }}
                          value={typeof component.size?.width === 'number' ? component.size.width : 200}
                          onChange={val => {
                            const currentSize = component.size || { width: 200, height: 80 };
                            onUpdateProperty(component.id, 'size', { 
                              ...currentSize, 
                              width: typeof val === 'number' ? val : currentSize.width 
                            });
                          }}
                          min={0}
                          addonAfter="px"
                        />
                      )}
                    </div>
                  </Form.Item>
                  
                  <Form.Item label="高度">
                    <InputNumber
                      style={{ width: '100%' }}
                      value={component.size?.height}
                      onChange={val => {
                        // 确保获取到当前正确的尺寸信息
                        const currentSize = component.size || { width: "100%", height: 80 };
                        onUpdateProperty(component.id, 'size', { 
                          ...currentSize, 
                          height: typeof val === 'number' ? val : currentSize.height 
                        });
                      }}
                      min={20}
                      addonAfter="px"
                    />
                  </Form.Item>
                  
                  <Form.Item label="外边距">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <InputNumber
                        style={{ flex: 1 }}
                        placeholder="上"
                        value={component.props.marginTop}
                        onChange={val => onUpdateProperty(component.id, 'marginTop', val)}
                        min={0}
                        addonAfter="px"
                      />
                      <InputNumber
                        style={{ flex: 1 }}
                        placeholder="下"
                        value={component.props.marginBottom}
                        onChange={val => onUpdateProperty(component.id, 'marginBottom', val)}
                        min={0}
                        addonAfter="px"
                      />
                    </div>
                  </Form.Item>
                  
                  <Form.Item label="内边距">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <InputNumber
                        style={{ flex: 1 }}
                        placeholder="左"
                        value={component.props.paddingLeft}
                        onChange={val => onUpdateProperty(component.id, 'paddingLeft', val)}
                        min={0}
                        addonAfter="px"
                      />
                      <InputNumber
                        style={{ flex: 1 }}
                        placeholder="右"
                        value={component.props.paddingRight}
                        onChange={val => onUpdateProperty(component.id, 'paddingRight', val)}
                        min={0}
                        addonAfter="px"
                      />
                    </div>
                  </Form.Item>
                </Panel>
                
                <Panel header="显示设置" key="display">
                  <Form.Item label="对齐方式">
                    <Select
                      style={{ width: '100%' }}
                      value={component.props.textAlign || 'left'}
                      onChange={val => onUpdateProperty(component.id, 'textAlign', val)}
                    >
                      <Select.Option value="left">左对齐</Select.Option>
                      <Select.Option value="center">居中</Select.Option>
                      <Select.Option value="right">右对齐</Select.Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item label="背景颜色">
                    <ColorPicker
                      value={component.props.backgroundColor || '#ffffff'}
                      onChange={color => onUpdateProperty(component.id, 'backgroundColor', color.toHexString())}
                      showText
                    />
                  </Form.Item>
                </Panel>
              </Collapse>
            </Form>
          </TabPane>

          <TabPane 
            tab={<span><CodeOutlined />事件</span>} 
            key="events"
            style={{ height: 'calc(100% - 46px)', overflow: 'auto', padding: '0 16px 16px' }}
          >
            {componentDef.events && componentDef.events.length > 0 ? (
              <Form layout="vertical" style={{ height: '100%' }}>
                {componentDef.events.map(event => (
                  <Form.Item 
                    key={event.name} 
                    label={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{event.label}</span>
                        <Tooltip title="支持使用 event, component, api 对象">
                          <QuestionCircleOutlined style={{ color: '#999', fontSize: '12px' }} />
                        </Tooltip>
                      </div>
                    }
                  >
                    <Input.TextArea
                      value={component.events?.[event.name] || ''}
                      onChange={e => onUpdateEvent(component.id, event.name, e.target.value)}
                      placeholder={`// 例如: api.message.success("${event.label}被触发了");`}
                      rows={6}
                      style={{ fontFamily: 'monospace' }}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        可用变量: event, component, api
                      </Text>
                    </div>
                  </Form.Item>
                ))}
              </Form>
            ) : (
              <Empty 
                description="该组件没有可配置的事件" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                style={{ margin: '40px 0' }}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PropertyPanel; 