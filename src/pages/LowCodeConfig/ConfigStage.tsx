import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { ComponentInstance, ComponentDefinition } from './types';
import ComponentCanvas from './ComponentCanvas';

interface ConfigStageProps {
  components: ComponentInstance[];
  selectedComponent: ComponentInstance | null;
  onSelectComponent: (component: ComponentInstance | null) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (type: string) => void;
  onUpdateComponent: (component: ComponentInstance | any) => void;
}

const ConfigStage: React.FC<ConfigStageProps> = ({
  components,
  selectedComponent,
  onSelectComponent,
  onDeleteComponent,
  onAddComponent,
  onUpdateComponent,
}) => {
  // 处理组件更新
  const handleComponentUpdate = (component: ComponentInstance | any) => {
    console.log('组件更新: ', component);
    
    // 检查是否是特殊的重排序操作
    if (component._type === 'reorder' && component.components) {
      console.log('收到重排序操作，重新排序所有组件');
      
      try {
        // 直接使用传入的组件列表进行直接渲染更新（备用方案）
        const localUpdatedComponents = [...component.components];
        
        // 去除临时标记
        const cleanedComponents = localUpdatedComponents.map(comp => {
          const cleanComp = { ...comp };
          if (cleanComp._order !== undefined) delete cleanComp._order;
          if (cleanComp._reordered !== undefined) delete cleanComp._reordered;
          return cleanComp;
        });
        
        // 调用父组件的更新函数更新所有组件
        if (onUpdateComponent) {
          // 告诉父组件这是一次批量组件更新
          const reorderOperation = {
            type: 'batch_update',
            components: cleanedComponents
          };
          onUpdateComponent(reorderOperation as any);
        }
      } catch (err) {
        console.error('本地重排序失败:', err);
      }
      return;
    }
    
    // 检查是否是删除操作
    if (component._deleted) {
      console.log('删除组件:', component.id);
      onDeleteComponent(component.id);
      return;
    }
    
    // 检查是否是重排序操作 (兼容旧的单个组件重排序方式)
    if (component._reordered) {
      console.log('重排序组件:', component.id, '新顺序:', component._order);
      // 由于所有重排序的组件都会逐个更新，只需要将它们传递给外部处理函数
      // 外部组件应当负责根据_order属性正确排序
      
      // 创建一个干净的组件副本，去除临时标记
      const cleanComponent = { ...component };
      // 清除临时标记，避免影响保存
      delete cleanComponent._reordered;
      
      // 保留_order属性，用于外部排序
      if (onUpdateComponent) {
        onUpdateComponent(cleanComponent);
      }
      return;
    }
    
    // 如果组件已存在则更新，否则添加
    const exists = components.some(c => c.id === component.id);
    if (exists) {
      // 直接调用外部提供的更新组件函数
      if (onUpdateComponent) {
        onUpdateComponent(component);
        // 选择更新后的组件
        onSelectComponent(component);
      } else {
        // 兼容旧的更新方式
        const updatedComponents = components.map(c => 
          c.id === component.id ? component : c
        );
        console.log('更新后的组件列表:', updatedComponents);
      }
    } else {
      // 添加新组件到列表末尾
      console.log('添加新组件:', component.type);
      onAddComponent(component.type);
      // 选中新组件
      setTimeout(() => {
        const newComponent = components[components.length - 1];
        if (newComponent) {
          onSelectComponent(newComponent);
        }
      }, 0);
    }
  };

  // 组件可删除键盘事件
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedComponent) {
        // 当按下Delete键且有选中组件时删除组件
        onDeleteComponent(selectedComponent.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedComponent, onDeleteComponent]);

  return (
    <Layout.Content style={{ padding: 0, height: '100%' }}>
      <ComponentCanvas
        components={components}
        selectedComponent={selectedComponent}
        onComponentSelect={onSelectComponent}
        onComponentUpdate={handleComponentUpdate}
      />
    </Layout.Content>
  );
};

export default ConfigStage; 