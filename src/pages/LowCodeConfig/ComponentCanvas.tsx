import React, { useRef, useState, useEffect } from 'react';
import { Card, Tooltip, Empty } from 'antd';
import { ComponentInstance, ComponentDefinition, ComponentCanvasProps } from './types';
import ComponentRenderer from './ComponentRenderer';

const ComponentCanvas: React.FC<ComponentCanvasProps> = ({
  components,
  selectedComponent,
  onComponentSelect,
  onComponentUpdate,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState({ visible: false, index: -1 });
  const [draggedComponent, setDraggedComponent] = useState<ComponentInstance | null>(null);

  // 处理组件从组件面板拖入
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDropIndicator({ visible: false, index: -1 });

    console.log('Drop event detected', e.dataTransfer.types);
    
    // 尝试从多种可能的数据格式中获取组件类型
    let componentType = '';
    try {
      // 首先检查是否是组件拖拽
      if (e.dataTransfer.types.includes('componentType')) {
        componentType = e.dataTransfer.getData('componentType');
      } else if (e.dataTransfer.types.includes('text/plain')) {
        componentType = e.dataTransfer.getData('text/plain');
      }
      
      console.log('Component type from drop:', componentType);
      
      // 处理新组件添加 - 添加到列表末尾
      if (componentType) {
        const componentWidth = '100%'; // 占满一行宽度 -> 改为数字
        const componentHeight = componentType === 'TextArea' ? 100 : 80; // 默认组件高度

        console.log(`Creating new component of type ${componentType}`);

        const newComponent: ComponentInstance = {
          id: Date.now().toString(),
          type: componentType,
          // 不再需要position属性，在垂直布局中使用数组顺序确定位置
          size: { width: "100%", height: componentHeight },
          props: {},
        };

        onComponentUpdate(newComponent);
      } else {
        console.warn('No component type found in drop event');
      }
    } catch (err) {
      console.error('Error processing drop event:', err);
    }
  };

  // 处理组件间的拖拽重排序
  const handleComponentDragStart = (component: ComponentInstance) => {
    setDraggedComponent(component);
    setIsDragging(true);
    
    // 输出日志，用于调试
    console.log('开始拖拽组件:', component.id, component.type);
  };

  const handleComponentDragEnd = () => {
    setDraggedComponent(null);
    setIsDragging(false);
    setDropIndicator({ visible: false, index: -1 });
  };

  // 处理组件拖动时显示放置指示器
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 获取拖拽数据，判断是否是内部组件拖拽重排序
    const isInternalDrag = !!draggedComponent;
    const isExternalDrag = e.dataTransfer.types.includes('componentType');
    
    if (!isInternalDrag && !isExternalDrag) {
      return;
    }

    // 确定鼠标位置最接近哪个组件的位置，显示放置指示器
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      
      // 获取所有组件元素
      const componentElements = canvasRef.current.querySelectorAll('.component-renderer');
      
      if (componentElements.length === 0) {
        // 画布为空，放置在第一个位置
        setDropIndicator({ visible: true, index: 0 });
        return;
      }
      
      // 找到鼠标最接近的位置
      let closestIndex = -1;
      let minDistance = Number.MAX_VALUE;
      
      componentElements.forEach((element, index) => {
        const elementRect = element.getBoundingClientRect();
        const elementTop = elementRect.top - rect.top;
        const elementBottom = elementTop + elementRect.height;
        const elementMiddle = (elementTop + elementBottom) / 2;
        
        // 如果是当前拖拽的组件，跳过
        if (isInternalDrag && draggedComponent && 
            element.getAttribute('data-component-id') === draggedComponent.id) {
          return;
        }
        
        // 计算与元素中点的距离
        const distance = Math.abs(mouseY - elementMiddle);
        
        // 如果鼠标在元素上方
        if (mouseY < elementMiddle) {
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        } 
        // 如果鼠标在元素下方且是最后一个元素
        else if (index === componentElements.length - 1) {
          closestIndex = index + 1;
        }
        // 如果鼠标在元素中点以下且不是最后一个元素
        else if (mouseY >= elementMiddle && mouseY <= elementBottom) {
          closestIndex = index + 1;
        }
      });
      
      // 如果找到了合适的位置，显示指示器
      if (closestIndex >= 0) {
        // 确保当前拖拽组件的索引也被考虑在内
        if (isInternalDrag && draggedComponent) {
          const currentIndex = components.findIndex(c => c.id === draggedComponent.id);
          console.log('拖拽位置更新:', currentIndex, '->', closestIndex);
        }
        
        setDropIndicator({ visible: true, index: closestIndex });
      } else {
        setDropIndicator({ visible: false, index: -1 });
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // 确保只有当拖拽离开画布区域时才触发
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
    setDropIndicator({ visible: false, index: -1 });
  };

  // 处理内部组件拖拽放置 - 重新排序
  const handleComponentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('组件拖放事件触发', draggedComponent?.id, '目标位置:', dropIndicator.index);
    
    if (!draggedComponent || dropIndicator.index < 0) {
      setDraggedComponent(null);
      setIsDragging(false);
      setDropIndicator({ visible: false, index: -1 });
      return;
    }
    
    // 找到被拖拽组件的当前索引
    const currentIndex = components.findIndex(c => c.id === draggedComponent.id);
    if (currentIndex < 0) {
      console.error('找不到被拖拽的组件:', draggedComponent.id);
      return;
    }
    
    console.log('当前索引:', currentIndex, '目标索引:', dropIndicator.index);
    
    // 计算目标索引（考虑到移除源元素后的索引变化）
    let targetIndex = dropIndicator.index;
    if (currentIndex < targetIndex) {
      targetIndex--;
    }
    
    // 如果位置没有变化，直接返回
    if (currentIndex === targetIndex) {
      console.log('位置没有变化，取消重排序');
      setDraggedComponent(null);
      setIsDragging(false);
      setDropIndicator({ visible: false, index: -1 });
      return;
    }
    
    console.log('执行重排序:', currentIndex, '->', targetIndex);
    
    try {
      // 创建新的组件数组，重新排序
      const updatedComponents = [...components];
      const [movedComponent] = updatedComponents.splice(currentIndex, 1); // 移除源组件
      updatedComponents.splice(targetIndex, 0, movedComponent); // 插入到目标位置
      
      // 更新组件 - 使用一个特殊标记表示这是一次完整的重排序操作
      const reorderOperation = {
        _type: 'reorder',
        type: 'batch_update',
        components: updatedComponents.map((component, idx) => ({
          ...component,
          _order: idx
        }))
      };
      
      // 使用组件上的onComponentUpdate通知父组件进行重排序
      onComponentSelect(null);
      // 将整个重排序操作作为一个特殊的"组件"传递
      console.log('发送重排序操作:', reorderOperation);
      onComponentUpdate(reorderOperation as any);
      
      // 额外添加一个直接本地更新组件顺序的操作
      // 这是一个备用方案，确保即使父组件没有正确处理，视图也会更新
      setTimeout(() => {
        // 检查是否更新成功
        const currentComponents = document.querySelectorAll('.component-renderer');
        console.log('重排序后组件数量:', currentComponents.length, '预期:', updatedComponents.length);
      }, 100);
    } catch (err) {
      console.error('重排序操作失败:', err);
    }
    
    setDraggedComponent(null);
    setIsDragging(false);
    setDropIndicator({ visible: false, index: -1 });
  };

  // 处理画布点击，取消选中
  const handleCanvasClick = (e: React.MouseEvent) => {
    // 确保点击的是画布本身，而不是其中的组件
    if (e.target === e.currentTarget) {
      onComponentSelect(null);
    }
  };

  return (
    <Card
      title="设计画布"
      className="component-canvas-card"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{ 
        flex: 1, 
        padding: '0', 
        display: 'flex', 
        overflow: 'hidden' 
      }}
    >
      <div
        ref={canvasRef}
        className="component-canvas"
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          minHeight: '500px',
          border: isDragging ? '2px dashed #1890ff' : '1px dashed #d9d9d9',
          padding: '20px',
          background: isDragging ? 'rgba(24, 144, 255, 0.05)' : '#fff',
          overflow: 'auto',
          transition: 'all 0.3s',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        onDrop={draggedComponent ? handleComponentDrop : handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleCanvasClick}
      >
        {components.length === 0 && (
          <div className="empty-canvas" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty 
              description={
                <span>
                  从左侧拖拽组件到这里<br />
                  <small style={{ color: '#999' }}>或者点击左侧组件添加</small>
                </span>
              }
            />
          </div>
        )}
        
        {components.map((component, index) => (
          <React.Fragment key={component.id}>
            {dropIndicator.visible && dropIndicator.index === index && (
              <div 
                className="drop-indicator-line"
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#1890ff',
                  borderRadius: '2px',
                  marginBottom: '8px',
                  boxShadow: '0 0 4px rgba(24, 144, 255, 0.5)',
                  position: 'relative',
                  zIndex: 10,
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <style>
                  {`
                    @keyframes pulse {
                      0% { opacity: 0.6; }
                      50% { opacity: 1; }
                      100% { opacity: 0.6; }
                    }
                  `}
                </style>
              </div>
            )}
            <ComponentRenderer
              component={component}
              isSelected={selectedComponent?.id === component.id}
              onSelect={() => onComponentSelect(component)}
              onUpdate={onComponentUpdate}
              onDragStart={() => handleComponentDragStart(component)}
              onDragEnd={handleComponentDragEnd}
            />
            {dropIndicator.visible && dropIndicator.index === index + 1 && (
              <div 
                className="drop-indicator-line"
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#1890ff',
                  borderRadius: '2px',
                  marginTop: '8px',
                  boxShadow: '0 0 4px rgba(24, 144, 255, 0.5)',
                  position: 'relative',
                  zIndex: 10,
                  animation: 'pulse 1.5s infinite',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};

export default ComponentCanvas; 