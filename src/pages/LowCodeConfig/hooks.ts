import { useState, useEffect } from 'react';
import { ConfigDefinition, ComponentInstance, ComponentDefinition } from './types';
import { createComponentInstance, updateComponentProperty, updateComponentEvent } from './utils';

export const useConfig = () => {
  const [components, setComponents] = useState<ComponentInstance[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentInstance | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [designComponents, setDesignComponents] = useState<ComponentInstance[]>([]);

  useEffect(() => {
    if (selectedComponent) {
      const updatedSelectedComponent = components.find(c => c.id === selectedComponent.id);
      if (updatedSelectedComponent) {
        setSelectedComponent(updatedSelectedComponent);
      }
    }
  }, [components]);

  const addComponent = (
    type: string, 
    componentDefinitions: ComponentDefinition[],
    initialPosition?: { x: number, y: number }
  ) => {
    const newId = Date.now().toString();
    
    const componentDef = componentDefinitions.find(c => c.type === type);
    const defaultProps = componentDef?.properties.reduce((acc, prop) => {
      if (prop.name === 'children' && type === 'Button') {
        acc[prop.name] = '按钮';
      }
      return acc;
    }, {} as Record<string, any>) || {};
    
    const newComponent: ComponentInstance = {
      id: newId,
      type,
      size: { width: "100%", height: type === 'TextArea' ? 100 : 80 },
      props: defaultProps,
    };
    
    setComponents(prev => [...prev, newComponent]);
    
    setSelectedComponent(newComponent);
  };

  const updateProperty = (id: string, propName: string, value: any) => {
    console.log(`更新组件属性: ID=${id}, 属性=${propName}, 值=`, value);
    
    setComponents(prevComponents => 
      prevComponents.map(component => {
        if (component.id === id) {
          let updatedComponent;
          
          if (propName === 'size') {
            updatedComponent = {
              ...component,
              [propName]: value
            };
          } else {
            updatedComponent = {
              ...component,
              props: {
                ...component.props,
                [propName]: value
              }
            };
          }
          
          if (selectedComponent?.id === id) {
            setSelectedComponent(updatedComponent);
          }
          
          return updatedComponent;
        }
        return component;
      })
    );
  };

  // 更新组件（用于完整更新，包括拖放排序）
  const updateComponent = (component: ComponentInstance) => {
    setComponents(prevComponents => {
      // 检查组件是否已存在
      const index = prevComponents.findIndex(c => c.id === component.id);
      
      // 如果不存在则添加，存在则更新
      if (index === -1) {
        return [...prevComponents, component];
      } else {
        return prevComponents.map(c => c.id === component.id ? component : c);
      }
    });
  };
  
  // 重新排序组件（处理拖拽排序）
  const reorderComponents = (newComponents: ComponentInstance[]) => {
    setComponents(newComponents);
  };

  const updateEvent = (id: string, eventName: string, code: string) => {
    setComponents(prevComponents => 
      prevComponents.map(component => {
        if (component.id === id) {
          const updatedComponent = {
            ...component,
            events: {
              ...component.events,
              [eventName]: code
            }
          };
          
          if (selectedComponent?.id === id) {
            setSelectedComponent(updatedComponent);
          }
          
          return updatedComponent;
        }
        return component;
      })
    );
  };

  const deleteComponent = (id: string) => {
    setComponents(prevComponents => prevComponents.filter(component => component.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  };

  const togglePreview = () => {
    if (isPreview) {
      setComponents(designComponents);
    } else {
      setDesignComponents([...components]);
    }
    setIsPreview(!isPreview);
  };

  return {
    components,
    selectedComponent,
    isPreview,
    addComponent,
    updateProperty,
    updateEvent,
    deleteComponent,
    setSelectedComponent,
    togglePreview,
    setComponents,
    updateComponent,
    reorderComponents
  };
};

export const useConfigStorage = () => {
  const [configs, setConfigs] = useState<{name: string, components: ComponentInstance[]}[]>([]);
  const [currentConfig, setCurrentConfig] = useState<{name: string, components: ComponentInstance[]} | null>(null);

  const saveConfig = (name: string, components: ComponentInstance[]) => {
    const configIndex = configs.findIndex(config => config.name === name);
    let updatedConfigs;
    
    if (configIndex !== -1) {
      updatedConfigs = [...configs];
      updatedConfigs[configIndex] = { name, components };
    } else {
      updatedConfigs = [...configs, { name, components }];
    }
    
    setConfigs(updatedConfigs);
    setCurrentConfig({ name, components });
  };

  const loadConfig = (name: string) => {
    const config = configs.find(config => config.name === name);
    if (config) {
      setCurrentConfig(config);
      return config.components;
    }
    return [];
  };

  const deleteConfig = (name: string) => {
    const updatedConfigs = configs.filter(config => config.name !== name);
    setConfigs(updatedConfigs);
    if (currentConfig?.name === name) {
      setCurrentConfig(null);
    }
  };

  return {
    configs,
    currentConfig,
    saveConfig,
    loadConfig,
    deleteConfig,
  };
}; 