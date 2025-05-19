import React, { useRef, useEffect, useState } from 'react';
import { List, Card, Typography, Tabs, Input, Empty, Collapse, Tooltip, Tag, Space } from 'antd';
import { ComponentDefinition } from './types';
import { 
  SearchOutlined, 
  FormOutlined, 
  AppstoreOutlined, 
  FieldBinaryOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface ComponentPanelProps {
  components: ComponentDefinition[];
  onAddComponent: (componentType: string) => void;
}

// 组件分类
const componentCategories = {
  input: ['Input', 'TextArea', 'InputNumber'],
  select: ['Select', 'Checkbox', 'Radio', 'Switch'],
  date: ['DatePicker', 'TimePicker', 'RangePicker'],
  display: ['Button', 'Card', 'Divider', 'Table'],
  advanced: ['Upload', 'Slider', 'Rate'],
  form: ['Form'],
};

// 组件图标映射
const componentIcons: Record<string, React.ReactNode> = {
  Input: <span className="component-icon">Aa</span>,
  TextArea: <span className="component-icon">Ab</span>,
  InputNumber: <span className="component-icon">123</span>,
  Select: <span className="component-icon">▼</span>,
  Radio: <span className="component-icon">○</span>,
  Checkbox: <span className="component-icon">☑</span>,
  Switch: <span className="component-icon">⊙</span>,
  DatePicker: <span className="component-icon">📅</span>,
  TimePicker: <span className="component-icon">⏱</span>,
  RangePicker: <span className="component-icon">↔️</span>,
  Button: <span className="component-icon">🔘</span>,
  Card: <span className="component-icon">🃏</span>,
  Divider: <span className="component-icon">—</span>,
  Table: <span className="component-icon">🗓️</span>,
  Upload: <span className="component-icon">📤</span>,
  Slider: <span className="component-icon">◎</span>,
  Rate: <span className="component-icon">★</span>,
  Form: <span className="component-icon">📋</span>,
};

// 可拖拽组件项
const DraggableComponent: React.FC<{
  component: ComponentDefinition;
  onAddComponent: (componentType: string) => void;
}> = ({ component, onAddComponent }) => {
  const [isDragging, setIsDragging] = useState(false);

  // 处理拖拽开始，设置数据
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    
    // 清除之前可能存在的数据
    e.dataTransfer.clearData();
    
    // 设置组件类型数据 - 使用多种格式确保兼容性
    try {
      // 先设置componentType，这是我们自定义的数据类型
      e.dataTransfer.setData('componentType', component.type);
      // 再设置text/plain格式，作为备用
      e.dataTransfer.setData('text/plain', component.type);
      
      // 设置拖拽效果
      e.dataTransfer.effectAllowed = 'copy';
      
      // 设置拖拽状态
      setIsDragging(true);
      
      console.log('Drag started with component type:', component.type);
    } catch (err) {
      console.error('Error setting drag data:', err);
    }
  };

  // 确保拖拽结束时的处理
  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    console.log('Drag ended for component type:', component.type);
  };

  return (
    <Tooltip title={`拖拽或点击添加${component.label}`} placement="right">
      <div
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          marginBottom: 8,
        }}
        onClick={() => onAddComponent(component.type)}
      >
        <Card
          size="small"
          hoverable
          style={{ 
            borderRadius: '4px',
            transition: 'all 0.3s',
          }}
          bodyStyle={{
            padding: '8px 12px',
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <Space>
              <div 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '14px',
                  color: '#666',
                  marginRight: '8px'
                }}
              >
                {componentIcons[component.type] || component.type.charAt(0)}
              </div>
              <Text strong>{component.label}</Text>
            </Space>
            <Tag 
              color="blue" 
              style={{ 
                fontSize: '10px', 
                lineHeight: '16px', 
                height: '18px', 
                marginRight: 0,
                opacity: 0.8
              }}
            >
              {component.type}
            </Tag>
          </div>
        </Card>
      </div>
    </Tooltip>
  );
};

// 分类标题映射
const categoryTitles: Record<string, { title: string, icon: React.ReactNode }> = {
  input: { title: '文本输入', icon: <FormOutlined /> },
  select: { title: '选择控件', icon: <FieldBinaryOutlined /> },
  date: { title: '日期时间', icon: <FieldBinaryOutlined /> },
  display: { title: '展示控件', icon: <AppstoreOutlined /> },
  advanced: { title: '高级控件', icon: <AppstoreOutlined /> },
  form: { title: '容器控件', icon: <DatabaseOutlined /> },
};

const ComponentPanel: React.FC<ComponentPanelProps> = ({
  components,
  onAddComponent,
}) => {
  const [searchText, setSearchText] = useState('');
  const [activeKey, setActiveKey] = useState<string[]>(['input', 'select', 'date', 'display', 'advanced', 'form']);
  
  // 过滤组件
  const filteredComponents = searchText
    ? components.filter(comp => 
        comp.label.toLowerCase().includes(searchText.toLowerCase()) ||
        comp.type.toLowerCase().includes(searchText.toLowerCase())
      )
    : components;

  // 按分类获取组件
  const getComponentsByCategory = (category: string) => {
    return filteredComponents.filter(comp => 
      (componentCategories as any)[category]?.includes(comp.type)
    );
  };

  return (
    <div className="component-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Card 
        title={<div style={{ fontWeight: 'bold' }}>组件库</div>}
        bordered={false}
        className="component-panel-card"
        bodyStyle={{ padding: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}
        style={{ height: '100%' }}
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索组件"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: '12px' }}
          allowClear
        />
        
        <div className="component-list-container" style={{ flex: 1, overflow: 'auto' }}>
          {searchText ? (
            filteredComponents.length > 0 ? (
              <List
                dataSource={filteredComponents}
                renderItem={(component) => (
                  <List.Item style={{ padding: '4px 0' }}>
                    <DraggableComponent
                      component={component}
                      onAddComponent={onAddComponent}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="未找到匹配组件" style={{ margin: '20px 0' }} />
            )
          ) : (
            <Collapse 
              defaultActiveKey={activeKey} 
              onChange={(keys) => setActiveKey(keys as string[])}
              ghost
              style={{ background: 'transparent' }}
              expandIconPosition="end"
            >
              <Panel 
                header={
                  <Space>
                    {categoryTitles.input.icon}
                    <span>{categoryTitles.input.title}</span>
                  </Space>
                } 
                key="input"
              >
                <List
                  dataSource={getComponentsByCategory('input')}
                  renderItem={(component) => (
                    <List.Item style={{ padding: '4px 0' }}>
                      <DraggableComponent
                        component={component}
                        onAddComponent={onAddComponent}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
              
              <Panel 
                header={
                  <Space>
                    {categoryTitles.select.icon}
                    <span>{categoryTitles.select.title}</span>
                  </Space>
                }
                key="select"
              >
                <List
                  dataSource={getComponentsByCategory('select')}
                  renderItem={(component) => (
                    <List.Item style={{ padding: '4px 0' }}>
                      <DraggableComponent
                        component={component}
                        onAddComponent={onAddComponent}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
              
              <Panel 
                header={
                  <Space>
                    {categoryTitles.date.icon}
                    <span>{categoryTitles.date.title}</span>
                  </Space>
                }
                key="date"
              >
                <List
                  dataSource={getComponentsByCategory('date')}
                  renderItem={(component) => (
                    <List.Item style={{ padding: '4px 0' }}>
                      <DraggableComponent
                        component={component}
                        onAddComponent={onAddComponent}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
              
              <Panel 
                header={
                  <Space>
                    {categoryTitles.display.icon}
                    <span>{categoryTitles.display.title}</span>
                  </Space>
                }
                key="display"
              >
                <List
                  dataSource={getComponentsByCategory('display')}
                  renderItem={(component) => (
                    <List.Item style={{ padding: '4px 0' }}>
                      <DraggableComponent
                        component={component}
                        onAddComponent={onAddComponent}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
              
              <Panel 
                header={
                  <Space>
                    {categoryTitles.advanced.icon}
                    <span>{categoryTitles.advanced.title}</span>
                  </Space>
                }
                key="advanced"
              >
                <List
                  dataSource={getComponentsByCategory('advanced')}
                  renderItem={(component) => (
                    <List.Item style={{ padding: '4px 0' }}>
                      <DraggableComponent
                        component={component}
                        onAddComponent={onAddComponent}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
              
              <Panel 
                header={
                  <Space>
                    {categoryTitles.form.icon}
                    <span>{categoryTitles.form.title}</span>
                  </Space>
                }
                key="form"
              >
                <List
                  dataSource={getComponentsByCategory('form')}
                  renderItem={(component) => (
                    <List.Item style={{ padding: '4px 0' }}>
                      <DraggableComponent
                        component={component}
                        onAddComponent={onAddComponent}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
            </Collapse>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ComponentPanel;