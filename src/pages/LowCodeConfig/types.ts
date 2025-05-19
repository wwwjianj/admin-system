import React from 'react';

export interface PropertyOption {
  label: string;
  value: string | number;
}

export interface PropertyDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'slider' | 'array' | 'function';
  options?: PropertyOption[];
  min?: number;
  max?: number;
}

export interface EventDefinition {
  name: string;
  label: string;
}

export interface ComponentDefinition {
  type: string;
  label: string;
  properties: PropertyDefinition[];
  events: EventDefinition[];
  render: (props: any) => React.ReactNode;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number | string;
  height: number;
}

export interface ComponentInstance {
  id: string;
  type: string;
  props: Record<string, any>;
  events?: Record<string, string>;
  position?: Position;
  size?: Size;
  _deleted?: boolean;
  _reordered?: boolean;
  _order?: number;
}

// 用于ConfigStage的属性
export interface ConfigStageProps {
  components: ComponentInstance[];
  selectedComponent: ComponentInstance | null;
  onSelectComponent: (component: ComponentInstance | null) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (type: string) => void;
}

// 用于ComponentCanvas的属性
export interface ComponentCanvasProps {
  components: ComponentInstance[];
  selectedComponent: ComponentInstance | null;
  onComponentSelect: (component: ComponentInstance | null) => void;
  onComponentUpdate: (component: ComponentInstance) => void;
}

// 用于ComponentRenderer的属性
export interface ComponentRendererProps {
  component: ComponentInstance;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (component: ComponentInstance) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface ConfigDefinition {
  id: string;
  name: string;
  components: ComponentInstance[];
  createdAt: string;
  updatedAt: string;
} 