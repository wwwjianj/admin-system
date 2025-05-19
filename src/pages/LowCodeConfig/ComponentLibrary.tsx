import React from 'react';
import { Card, List } from 'antd';
import { ComponentDefinition } from './types';

interface ComponentLibraryProps {
  components: ComponentDefinition[];
  onDragStart: (component: ComponentDefinition) => void;
}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ components, onDragStart }) => {
  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    e.dataTransfer.setData('componentType', component.type);
    onDragStart(component);
  };

  return (
    <Card title="组件库" style={{ height: '100%' }}>
      <List
        dataSource={components}
        renderItem={(component) => (
          <List.Item
            draggable
            onDragStart={(e) => handleDragStart(e, component)}
            style={{ cursor: 'move', padding: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>{component.label}</span>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ComponentLibrary; 