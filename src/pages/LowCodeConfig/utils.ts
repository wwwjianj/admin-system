import { ComponentInstance, ComponentDefinition } from './types';

export const executeScript = (code: string, context: any) => {
  try {
    // 创建事件处理上下文
    const eventContext = {
      ...context,
      api: {
        message: {
          success: (msg: string) => console.log('Success:', msg),
          error: (msg: string) => console.log('Error:', msg),
          warning: (msg: string) => console.log('Warning:', msg),
          info: (msg: string) => console.log('Info:', msg),
        },
        Modal: {
          info: (config: any) => console.log('Modal Info:', config),
          success: (config: any) => console.log('Modal Success:', config),
          error: (config: any) => console.log('Modal Error:', config),
          warning: (config: any) => console.log('Modal Warning:', config),
          confirm: (config: any) => console.log('Modal Confirm:', config),
        },
      },
    };

    // 执行事件处理函数
    const handler = new Function('event', 'component', 'api', code);
    return handler.call(eventContext, context.event, context.component, eventContext.api);
  } catch (error) {
    console.error('Error executing event handler:', error);
    return null;
  }
};

export const createComponentInstance = (
  type: string,
  components: ComponentDefinition[]
): ComponentInstance => {
  const componentDef = components.find(c => c.type === type);
  if (!componentDef) {
    throw new Error(`Component type ${type} not found`);
  }

  return {
    id: Date.now().toString(),
    type,
    props: {},
    events: {},
  };
};

export const updateComponentProperty = (
  components: ComponentInstance[],
  id: string,
  propName: string,
  value: any
): ComponentInstance[] => {
  return components.map(comp => {
    if (comp.id === id) {
      return {
        ...comp,
        props: {
          ...comp.props,
          [propName]: value,
        },
      };
    }
    return comp;
  });
};

export const updateComponentEvent = (
  components: ComponentInstance[],
  id: string,
  eventName: string,
  code: string
): ComponentInstance[] => {
  return components.map(comp => {
    if (comp.id === id) {
      return {
        ...comp,
        events: {
          ...comp.events,
          [eventName]: code,
        },
      };
    }
    return comp;
  });
}; 