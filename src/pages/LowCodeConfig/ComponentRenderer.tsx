import React, { useRef, useState, useEffect } from 'react';
import { Tooltip, Input, Button, InputNumber, Select, Switch, Radio, Checkbox, DatePicker, Slider, Rate } from 'antd';
import { UploadOutlined, MenuOutlined, DeleteOutlined } from '@ant-design/icons';
import { ComponentInstance } from './types';

interface ComponentRendererProps {
  component: ComponentInstance;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (component: ComponentInstance) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDragStart,
  onDragEnd,
}) => {
  const defaultSize = { width: "100%", height: 80 };
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 处理鼠标按下开始拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(); // 选中组件
  };

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    
    // 设置拖拽效果和状态
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    
    // 设置拖拽数据，用于识别被拖拽的组件
    try {
      // 三种不同的数据格式确保兼容性
      e.dataTransfer.setData('application/json', JSON.stringify({
        id: component.id,
        type: component.type,
        isReordering: true
      }));
      e.dataTransfer.setData('component-id', component.id);
      e.dataTransfer.setData('text/plain', component.id);
      
      console.log('开始拖拽组件:', component.id, component.type);
    } catch (err) {
      console.error('设置拖拽数据失败:', err);
    }
    
    // 调用父组件的拖拽开始事件
    if (onDragStart) {
      onDragStart();
    }

    // 使用自定义拖拽图像
    try {
      if (elementRef.current) {
        // 创建一个简化版的拖拽图像
        const dragImage = document.createElement('div');
        dragImage.style.width = '150px';
        dragImage.style.padding = '5px 10px';
        dragImage.style.background = '#fff';
        dragImage.style.border = '1px solid #1890ff';
        dragImage.style.borderRadius = '4px';
        dragImage.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        dragImage.style.opacity = '0.8';
        dragImage.innerText = component.type;
        
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 75, 20);
        
        // 使用后删除临时元素
        setTimeout(() => {
          document.body.removeChild(dragImage);
        }, 0);
      } else {
        // 回退到使用组件元素作为拖拽图像
        e.dataTransfer.setDragImage(elementRef.current || new Image(), 20, 20);
      }
    } catch (err) {
      console.warn('设置拖拽图像失败:', err);
      // 使用透明图像作为回退
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer.setDragImage(img, 0, 0);
    }
  };

  // 处理拖拽结束
  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    
    // 调用父组件的拖拽结束事件
    if (onDragEnd) {
      onDragEnd();
    }
  };

  // 根据组件类型渲染预览
  const renderComponentPreview = () => {
    const { type, props } = component;
    
    const previewProps = {
      style: { width: '100%' },
      disabled: true, // 防止交互，纯展示
    };

    switch (type) {
      case 'AIChat':
        return (
          <div style={{ 
            border: '1px solid #d9d9d9', 
            borderRadius: '2px', 
            padding: '8px', 
            textAlign: 'center',
            background: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60px'
          }}>
            <div>AI问答组件</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {props.botName || 'AI助手'}
            </div>
          </div>
        );
      
      case 'Input':
        return <Input placeholder="输入框" {...previewProps} />;
      
      case 'TextArea':
        return <Input.TextArea placeholder="文本域" rows={2} {...previewProps} />;
      
      case 'InputNumber':
        return <InputNumber placeholder="123" {...previewProps} />;
      
      case 'Select':
        return <Select placeholder="选择框" {...previewProps} />;
      
      case 'Button':
        return <Button {...previewProps}>按钮</Button>;
      
      case 'Switch':
        return <Switch {...previewProps} />;
      
      case 'Radio':
        return (
          <Radio.Group {...previewProps}>
            <Radio value={1}>选项1</Radio>
            <Radio value={2}>选项2</Radio>
          </Radio.Group>
        );
      
      case 'Checkbox':
        return (
          <Checkbox.Group {...previewProps}>
            <Checkbox value={1}>选项1</Checkbox>
            <Checkbox value={2}>选项2</Checkbox>
          </Checkbox.Group>
        );
      
      case 'DatePicker':
        return <DatePicker {...previewProps} />;
      
      case 'TimePicker':
        return <DatePicker.TimePicker {...previewProps} />;
      
      case 'RangePicker':
        return <DatePicker.RangePicker {...previewProps} />;
        
      case 'Slider':
        return <Slider {...previewProps} />;
      
      case 'Rate':
        return <Rate disabled defaultValue={3} />;
      
      case 'Upload':
        return <Button icon={<UploadOutlined />} {...previewProps}>上传</Button>;
      
      case 'Card':
        return <div style={{ border: '1px solid #d9d9d9', borderRadius: '2px', padding: '8px', textAlign: 'center' }}>卡片</div>;
        
      case 'Divider':
        return <div style={{ borderTop: '1px solid #d9d9d9', margin: '8px 0' }} />;
        
      case 'Table':
        return <div style={{ border: '1px solid #d9d9d9', borderRadius: '2px', padding: '8px', textAlign: 'center' }}>表格</div>;
        
      case 'Form':
        return <div style={{ border: '1px solid #d9d9d9', borderRadius: '2px', padding: '8px', textAlign: 'center' }}>表单</div>;
      
      default:
        return (
          <div style={{ 
            padding: '8px', 
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            fontSize: '14px',
            border: '1px dashed #ff4d4f',
            color: '#ff4d4f'
          }}>
            未知组件类型: {type}
          </div>
        );
    }
  };

  return (
    <div
      ref={elementRef}
      className="component-renderer"
      onMouseDown={handleMouseDown}
      style={{
        width: '100%',
        minHeight: `${component.size?.height || defaultSize.height}px`,
        border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
        backgroundColor: component.props.backgroundColor || '#fff',
        borderRadius: '4px',
        boxSizing: 'border-box',
        cursor: isDragging ? 'grabbing' : 'pointer',
        zIndex: isSelected ? 2 : 1,
        boxShadow: isSelected ? '0 0 8px rgba(24, 144, 255, 0.2)' : 'none',
        transition: isDragging ? 'none' : 'box-shadow 0.3s',
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        userSelect: 'none', // 防止拖拽时选择文本
        marginTop: component.props.marginTop ? `${component.props.marginTop}px` : '0',
        marginBottom: component.props.marginBottom ? `${component.props.marginBottom}px` : '0',
      }}
      data-component-id={component.id}
      data-component-type={component.type}
    >
      {/* 左侧拖动手柄 */}
      <div 
        className="drag-handle"
        style={{
          width: '30px',
          background: '#f5f5f5',
          borderRight: '1px solid #e8e8e8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 0',
          cursor: 'grab',
          position: 'relative',
        }}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 可拖拽指示 */}
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: '#1890ff', 
          display: isSelected ? 'block' : 'none',
          borderTopLeftRadius: '4px',
        }} />
        
        <MenuOutlined style={{ color: '#999' }} />
        
        {/* 删除按钮 */}
        <Tooltip title="删除组件">
          <DeleteOutlined
            style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}
            onClick={(e) => {
              e.stopPropagation();
              const updatedComponent = { ...component, _deleted: true };
              onUpdate(updatedComponent);
            }}
          />
        </Tooltip>
      </div>
      
      {/* 组件内容 */}
      <div 
        style={{ 
          flex: 1, 
          padding: '8px 12px',
          paddingLeft: component.props.paddingLeft ? `${component.props.paddingLeft}px` : '12px',
          paddingRight: component.props.paddingRight ? `${component.props.paddingRight}px` : '12px',
          display: 'flex',
          flexDirection: 'column',
          textAlign: component.props.textAlign || 'left',
        }}
      >
        <div 
          style={{ 
            marginBottom: '4px', 
            fontSize: '12px', 
            color: '#666',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{component.type}</span>
          {isSelected && (
            <Tooltip title="删除组件">
              <DeleteOutlined
                style={{ color: '#ff4d4f', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  // 从组件 ID 提取索引
                  const idParts = component.id.split('-');
                  const index = parseInt(idParts[idParts.length - 1], 10);
                  // 创建一个更新后的组件，标记为已删除
                  const updatedComponent = { ...component, _deleted: true };
                  onUpdate(updatedComponent);
                }}
              />
            </Tooltip>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {renderComponentPreview()}
        </div>
      </div>
    </div>
  );
};

export default ComponentRenderer; 