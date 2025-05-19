import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Layout, Button, message, Input, Select, Switch, Radio, Checkbox, DatePicker, Form, Table, Divider, Card as AntCard, Upload, InputNumber, TimePicker, Slider, Rate } from 'antd';
import {
  EyeOutlined,
  SaveOutlined,
  ImportOutlined,
  ExportOutlined,
  FileAddOutlined,
  UploadOutlined,
} from '@ant-design/icons';

import ComponentPanel from './ComponentPanel';
import ConfigStage from './ConfigStage';
import PropertyPanel from './PropertyPanel';
import PreviewPanel from './PreviewPanel';
import { useConfig, useConfigStorage } from './hooks';
import { ComponentDefinition, ComponentInstance } from './types';
import './styles.css';
import AIChat from '../../components/AIChat';

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 组件定义
const componentDefinitions: ComponentDefinition[] = [
      {
        type: 'AIChat',
        label: 'AI问答',
        properties: [
          { name: 'placeholder', label: '输入框占位符', type: 'string' },
          { name: 'botName', label: 'AI名称', type: 'string' },
          { name: 'welcomeMessage', label: '欢迎语', type: 'string' },
          { name: 'apiKey', label: 'API密钥', type: 'string' },
          { name: 'apiEndpoint', label: 'API地址', type: 'string' },
          { name: 'useDeepSeek', label: '使用DeepSeek', type: 'boolean' },
          { name: 'useDashScope', label: '使用阿里云百炼', type: 'boolean' },
          { name: 'supportImage', label: '支持图片上传', type: 'boolean' },
          { name: 'modelName', label: '模型名称', type: 'select', options: [
            { label: 'deepseek-chat', value: 'deepseek-chat' },
            { label: 'deepseek-coder', value: 'deepseek-coder' },
            { label: 'deepseek-chat-v2', value: 'deepseek-chat-v2' },
            { label: 'qwen-max', value: 'qwen-max' },
            { label: 'qwen-plus', value: 'qwen-plus' },
            { label: 'qwen-turbo', value: 'qwen-turbo' },
            { label: 'qwen-vl-max', value: 'qwen-vl-max' },
            { label: 'qwen-vl-plus', value: 'qwen-vl-plus' },
          ]},
          { name: 'theme', label: '主题', type: 'select', options: [
            { label: '浅色', value: 'light' },
            { label: '深色', value: 'dark' },
            { label: '蓝色', value: 'blue' },
          ]},
          { name: 'height', label: '高度', type: 'number' },
          { name: 'showAvatar', label: '显示头像', type: 'boolean' },
        ],
        events: [
          { name: 'onSend', label: '发送消息事件' },
          { name: 'onReceive', label: '接收回复事件' },
        ],
        render: (props) => <AIChat {...props} />
      },
      {
        type: 'Input',
    label: '输入框',
        properties: [
      { name: 'placeholder', label: '占位符', type: 'string' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'allowClear', label: '是否可清除', type: 'boolean' },
      { name: 'maxLength', label: '最大长度', type: 'number' },
      { name: 'size', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ]},
      { name: 'addonBefore', label: '前置标签', type: 'string' },
      { name: 'addonAfter', label: '后置标签', type: 'string' },
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
      { name: 'onPressEnter', label: '按下回车事件' },
      { name: 'onFocus', label: '获得焦点事件' },
      { name: 'onBlur', label: '失去焦点事件' },
    ],
    render: (props) => <Input {...props} />
  },
  {
    type: 'TextArea',
    label: '文本域',
    properties: [
      { name: 'placeholder', label: '占位符', type: 'string' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'allowClear', label: '是否可清除', type: 'boolean' },
      { name: 'maxLength', label: '最大长度', type: 'number' },
      { name: 'rows', label: '行数', type: 'number' },
      { name: 'showCount', label: '显示字数', type: 'boolean' },
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
      { name: 'onPressEnter', label: '按下回车事件' },
      { name: 'onFocus', label: '获得焦点事件' },
      { name: 'onBlur', label: '失去焦点事件' },
    ],
    render: (props) => <Input.TextArea {...props} />
  },
  {
    type: 'InputNumber',
    label: '数字输入框',
        properties: [
      { name: 'min', label: '最小值', type: 'number' },
      { name: 'max', label: '最大值', type: 'number' },
      { name: 'step', label: '步长', type: 'number' },
      { name: 'precision', label: '精度', type: 'number' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'size', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ]},
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
    ],
    render: (props) => <InputNumber {...props} />
  },
  {
    type: 'Select',
    label: '下拉选择框',
    properties: [
      { name: 'placeholder', label: '占位符', type: 'string' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'allowClear', label: '是否可清除', type: 'boolean' },
      { name: 'mode', label: '模式', type: 'select', options: [
        { label: '默认', value: 'default' },
        { label: '多选', value: 'multiple' },
        { label: '标签', value: 'tags' },
      ]},
      { name: 'size', label: '尺寸', type: 'select', options: [
              { label: '大', value: 'large' },
              { label: '中', value: 'middle' },
              { label: '小', value: 'small' },
      ]},
      { name: 'options', label: '选项', type: 'array' },
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
      { name: 'onFocus', label: '获得焦点事件' },
      { name: 'onBlur', label: '失去焦点事件' },
    ],
    render: (props) => (
      <Select {...props}>
        {props.options?.map((option: any) => (
          <Option key={option.value} value={option.value}>{option.label}</Option>
        ))}
      </Select>
    )
  },
  {
    type: 'Button',
    label: '按钮',
    properties: [
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '默认', value: 'default' },
        { label: '主要', value: 'primary' },
        { label: '虚线', value: 'dashed' },
        { label: '文本', value: 'text' },
        { label: '链接', value: 'link' },
      ]},
      { name: 'size', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ]},
      { name: 'danger', label: '危险按钮', type: 'boolean' },
      { name: 'ghost', label: '幽灵属性', type: 'boolean' },
      { name: 'shape', label: '形状', type: 'select', options: [
              { label: '默认', value: 'default' },
              { label: '圆形', value: 'circle' },
              { label: '圆角', value: 'round' },
      ]},
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'block', label: '块级元素', type: 'boolean' },
      { name: 'children', label: '文本', type: 'string' },
    ],
    events: [
      { name: 'onClick', label: '点击事件' },
    ],
    render: (props) => <Button {...props}>{props.children}</Button>
      },
      {
        type: 'Switch',
    label: '开关',
        properties: [
      { name: 'checked', label: '是否选中', type: 'boolean' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'checkedChildren', label: '选中时内容', type: 'string' },
      { name: 'unCheckedChildren', label: '非选中时内容', type: 'string' },
      { name: 'size', label: '尺寸', type: 'select', options: [
              { label: '默认', value: 'default' },
              { label: '小', value: 'small' },
      ]},
            ],
    events: [
      { name: 'onChange', label: '值变化事件' },
        ],
    render: (props) => <Switch {...props} />
      },
      {
        type: 'Radio',
    label: '单选框',
    properties: [
      { name: 'options', label: '选项', type: 'array' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'optionType', label: '选项类型', type: 'select', options: [
        { label: '默认', value: 'default' },
        { label: '按钮', value: 'button' },
      ]},
      { name: 'buttonStyle', label: '按钮样式', type: 'select', options: [
        { label: '轮廓', value: 'outline' },
        { label: '实底', value: 'solid' },
      ]},
      { name: 'size', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ]},
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
    ],
    render: (props) => <Radio.Group {...props} />
      },
      {
        type: 'Checkbox',
    label: '复选框',
    properties: [
      { name: 'options', label: '选项', type: 'array' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
    ],
    render: (props) => <Checkbox.Group {...props} />
      },
      {
        type: 'DatePicker',
    label: '日期选择框',
    properties: [
      { name: 'placeholder', label: '占位符', type: 'string' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'allowClear', label: '是否可清除', type: 'boolean' },
      { name: 'size', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ]},
      { name: 'format', label: '日期格式', type: 'string' },
      { name: 'showTime', label: '显示时间', type: 'boolean' },
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
    ],
    render: (props) => <DatePicker {...props} />
  },
  {
    type: 'RangePicker',
    label: '日期范围选择框',
    properties: [
      { name: 'placeholder', label: '占位符', type: 'array' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'allowClear', label: '是否可清除', type: 'boolean' },
      { name: 'size', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ]},
      { name: 'format', label: '日期格式', type: 'string' },
      { name: 'showTime', label: '显示时间', type: 'boolean' },
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
    ],
    render: (props) => <RangePicker {...props} />
  },
  {
    type: 'TimePicker',
    label: '时间选择框',
    properties: [
      { name: 'placeholder', label: '占位符', type: 'string' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'allowClear', label: '是否可清除', type: 'boolean' },
      { name: 'size', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ]},
      { name: 'format', label: '时间格式', type: 'string' },
      { name: 'use12Hours', label: '使用12小时制', type: 'boolean' },
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
    ],
    render: (props) => <TimePicker {...props} />
  },
  {
    type: 'Slider',
    label: '滑动输入条',
    properties: [
      { name: 'min', label: '最小值', type: 'number' },
      { name: 'max', label: '最大值', type: 'number' },
      { name: 'step', label: '步长', type: 'number' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'range', label: '双滑块模式', type: 'boolean' },
      { name: 'vertical', label: '垂直方向', type: 'boolean' },
      { name: 'dots', label: '显示断点', type: 'boolean' },
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
      { name: 'onAfterChange', label: '结束时回调' },
    ],
    render: (props) => <Slider {...props} />
  },
  {
    type: 'Rate',
    label: '评分',
    properties: [
      { name: 'allowHalf', label: '半星', type: 'boolean' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'count', label: '总数', type: 'number' },
      { name: 'defaultValue', label: '默认值', type: 'number' },
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
    ],
    render: (props) => <Rate {...props} />
  },
  {
    type: 'Upload',
    label: '上传',
    properties: [
      { name: 'accept', label: '接受的文件类型', type: 'string' },
      { name: 'multiple', label: '多文件上传', type: 'boolean' },
      { name: 'disabled', label: '是否禁用', type: 'boolean' },
      { name: 'children', label: '按钮文本', type: 'string' },
    ],
    events: [
      { name: 'onChange', label: '值变化事件' },
    ],
    render: (props) => (
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>{props.children || '上传'}</Button>
      </Upload>
    )
  },
  {
    type: 'Card',
    label: '卡片',
    properties: [
      { name: 'title', label: '标题', type: 'string' },
      { name: 'bordered', label: '显示边框', type: 'boolean' },
      { name: 'size', label: '尺寸', type: 'select', options: [
        { label: '默认', value: 'default' },
        { label: '小', value: 'small' },
      ]},
      { name: 'hoverable', label: '鼠标悬浮升起', type: 'boolean' },
      { name: 'children', label: '内容', type: 'string' },
    ],
    events: [],
    render: (props) => <AntCard {...props}>{props.children}</AntCard>
  },
  {
    type: 'Divider',
    label: '分割线',
        properties: [
      { name: 'dashed', label: '虚线', type: 'boolean' },
      { name: 'orientation', label: '标题位置', type: 'select', options: [
        { label: '左', value: 'left' },
        { label: '中', value: 'center' },
        { label: '右', value: 'right' },
      ]},
      { name: 'plain', label: '普通样式', type: 'boolean' },
      { name: 'type', label: '方向', type: 'select', options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ]},
      { name: 'children', label: '内容', type: 'string' },
    ],
    events: [],
    render: (props) => <Divider {...props}>{props.children}</Divider>
      },
      {
        type: 'Form',
    label: '表单',
        properties: [
      { name: 'layout', label: '布局', type: 'select', options: [
              { label: '水平', value: 'horizontal' },
              { label: '垂直', value: 'vertical' },
              { label: '内联', value: 'inline' },
      ]},
      { name: 'size', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ]},
      { name: 'colon', label: '冒号', type: 'boolean' },
      { name: 'labelAlign', label: '标签对齐', type: 'select', options: [
        { label: '左', value: 'left' },
        { label: '右', value: 'right' },
      ]},
    ],
    events: [
      { name: 'onFinish', label: '提交事件' },
      { name: 'onReset', label: '重置事件' },
    ],
    render: (props) => <Form {...props} />
      },
      {
        type: 'Table',
    label: '表格',
    properties: [
      { name: 'columns', label: '列定义', type: 'array' },
      { name: 'dataSource', label: '数据源', type: 'array' },
      { name: 'bordered', label: '显示边框', type: 'boolean' },
      { name: 'size', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' },
      ]},
      { name: 'pagination', label: '分页', type: 'boolean' },
      { name: 'loading', label: '加载中', type: 'boolean' },
    ],
    events: [
      { name: 'onChange', label: '变化事件' },
    ],
    render: (props) => <Table {...props} />
  },
];

const LowCodeConfig: React.FC = () => {
  const {
    components,
    selectedComponent,
    isPreview,
    addComponent,
    updateProperty,
    updateEvent,
    deleteComponent,
    setSelectedComponent,
    togglePreview,
    setComponents
  } = useConfig();

  const {
    configs,
    currentConfig,
    saveConfig,
    loadConfig,
    deleteConfig,
  } = useConfigStorage();

  const handleSaveConfig = () => {
    if (!currentConfig) {
      message.error('请先创建或加载一个配置');
      return;
    }
    saveConfig(currentConfig.name, components);
    message.success('配置已保存');
  };

  const handleNewConfig = () => {
    const name = prompt('请输入配置名称');
    if (name) {
      saveConfig(name, []);
    }
  };

  const handleExportConfig = () => {
    if (!currentConfig) {
      message.error('请先创建或加载一个配置');
      return;
    }
    const blob = new Blob([JSON.stringify(currentConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConfig.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
          const config = JSON.parse(e.target?.result as string);
          saveConfig(config.name, config.components);
          message.success('配置已导入');
      } catch (error) {
          message.error('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            type="primary"
            icon={isPreview ? <EyeOutlined /> : <EyeOutlined />}
            onClick={togglePreview}
          >
            {isPreview ? '设计' : '预览'}
            </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveConfig}
          >
              保存
            </Button>
          <Button
            icon={<FileAddOutlined />}
            onClick={handleNewConfig}
          >
            新建
          </Button>
          <Button
            icon={<ImportOutlined />}
            onClick={() => document.getElementById('import-input')?.click()}
          >
              导入
            </Button>
          <input
            id="import-input"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportConfig}
          />
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportConfig}
          >
              导出
            </Button>
        </Header>
        <Layout>
          <Sider width={200} style={{ background: '#fff' }}>
              <ComponentPanel 
              components={componentDefinitions}
              onAddComponent={(type) => {
                // 简化添加组件逻辑，不再需要计算位置
                // 因为垂直布局会自动添加到底部
                addComponent(type, componentDefinitions);
              }}
              />
            </Sider>
          <Content style={{ padding: '16px' }}>
            {isPreview ? (
              <PreviewPanel components={components} />
            ) : (
              <ConfigStage 
                components={components}
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
                onDeleteComponent={deleteComponent}
                onAddComponent={(type) => addComponent(type, componentDefinitions)}
                onUpdateComponent={(component: any) => {
                  // 处理组件更新和重排序操作
                  if (component.type === 'batch_update' && Array.isArray(component.components)) {
                    // 批量更新（重排序）
                    console.log('执行组件批量更新（重排序）:', component.components.length);
                    setComponents([...component.components]);
                  } else {
                    // 常规组件更新
                    console.log('更新单个组件:', component.id);
                    
                    setComponents((prevComponents: ComponentInstance[]) => {
                      // 检查组件是否存在
                      const index = prevComponents.findIndex((c: ComponentInstance) => c.id === component.id);
                      
                      if (index === -1) {
                        return [...prevComponents, component];
                      } else {
                        return prevComponents.map((c: ComponentInstance) => 
                          c.id === component.id ? component : c
                        );
                      }
                    });
                  }
                }}
              />
            )}
          </Content>
          <Sider width={300} style={{ background: '#fff' }}>
              <PropertyPanel 
                component={selectedComponent} 
              componentDefinitions={componentDefinitions}
              onUpdateProperty={(id, propName, value) => updateProperty(id, propName, value)}
              onUpdateEvent={(id, eventName, code) => updateEvent(id, eventName, code)}
              />
            </Sider>
        </Layout>
      </Layout>
    </DndProvider>
  );
};

export default LowCodeConfig;
  