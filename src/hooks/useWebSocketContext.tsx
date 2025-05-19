import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import useWebSocket, { UseWebSocketOptions, UseWebSocketReturn } from './useWebSocket';

interface WebSocketProviderProps {
  children: ReactNode;
  options: UseWebSocketOptions;
}

// 创建WebSocket上下文
const WebSocketContext = createContext<UseWebSocketReturn | null>(null);

/**
 * WebSocket Provider组件
 * 为整个应用提供WebSocket连接
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, options }) => {
  const ws = useWebSocket(options);
  
  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * useWebSocketContext Hook
 * 在组件中使用WebSocket上下文
 * 
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { 
 *     status, 
 *     sendMessage, 
 *     lastMessage,
 *     reconnect
 *   } = useWebSocketContext();
 * 
 *   useEffect(() => {
 *     if (lastMessage) {
 *       // 处理收到的消息
 *       console.log('收到消息:', lastMessage.data);
 *     }
 *   }, [lastMessage]);
 * 
 *   const handleSend = () => {
 *     sendMessage({ type: 'chat', content: 'Hello!' });
 *   };
 * 
 *   return (
 *     <div>
 *       <p>状态: {status}</p>
 *       <button onClick={handleSend}>发送消息</button>
 *       <button onClick={reconnect}>重新连接</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useWebSocketContext = (): UseWebSocketReturn => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext必须在WebSocketProvider内部使用');
  }
  return context;
};

// 以下为常用的WebSocket消息类型处理组件

interface MessageHandlerProps<T> {
  children: (data: T) => ReactNode;
  type: string;
}

/**
 * WebSocketMessageHandler组件
 * 用于处理特定类型的WebSocket消息
 * 
 * @example
 * ```tsx
 * <WebSocketMessageHandler<ChatMessage> type="chat">
 *   {(message) => (
 *     <div>
 *       <p>{message.sender}: {message.content}</p>
 *     </div>
 *   )}
 * </WebSocketMessageHandler>
 * ```
 */
export function WebSocketMessageHandler<T>({ children, type }: MessageHandlerProps<T>): React.ReactElement | null {
  const { lastMessage } = useWebSocketContext();
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (lastMessage) {
      try {
        const parsedData = JSON.parse(lastMessage.data);
        if (parsedData.type === type) {
          setData(parsedData.data);
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error);
      }
    }
  }, [lastMessage, type]);

  return data ? <React.Fragment>{children(data)}</React.Fragment> : null;
}

/**
 * WebSocketConnectionStatus组件
 * 用于显示WebSocket连接状态
 * 
 * @example
 * ```tsx
 * <WebSocketConnectionStatus>
 *   {(status) => (
 *     <div>
 *       连接状态: {status === 'OPEN' ? '已连接' : '未连接'}
 *     </div>
 *   )}
 * </WebSocketConnectionStatus>
 * ```
 */
export const WebSocketConnectionStatus: React.FC<{
  children: (status: string) => React.ReactNode;
}> = ({ children }) => {
  const { status } = useWebSocketContext();
  return <React.Fragment>{children(status)}</React.Fragment>;
};

export default useWebSocketContext; 