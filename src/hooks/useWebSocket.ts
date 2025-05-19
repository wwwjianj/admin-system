import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'RECONNECTING';

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface UseWebSocketOptions {
  url: string;
  protocols?: string | string[];
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  reconnectOnClose?: boolean;
  autoReconnect?: boolean;
  autoConnect?: boolean;
  heartbeatInterval?: number;
  heartbeatMessage?: string | object;
}

export interface UseWebSocketReturn {
  status: WebSocketStatus;
  sendMessage: (data: string | object) => void;
  sendJsonMessage: (data: object) => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  lastMessage: WebSocketEventMap['message'] | null;
  readyState: number;
  webSocket: WebSocket | null;
}

/**
 * WebSocket Hook for React
 * 
 * @param options WebSocket配置选项
 * @returns WebSocket状态和方法
 * 
 * @example
 * ```tsx
 * const {
 *   status,
 *   sendMessage,
 *   sendJsonMessage,
 *   connect,
 *   disconnect,
 *   lastMessage
 * } = useWebSocket({
 *   url: 'wss://echo.websocket.org',
 *   onOpen: (event) => console.log('连接已建立'),
 *   onMessage: (event) => console.log('收到消息:', event.data),
 *   onClose: (event) => console.log('连接已关闭'),
 *   onError: (event) => console.error('连接错误:', event),
 *   autoReconnect: true,
 *   reconnectAttempts: 5,
 *   reconnectInterval: 3000
 * });
 * ```
 */
const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const {
    url,
    protocols,
    onOpen,
    onClose,
    onMessage,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    reconnectOnClose = true,
    autoReconnect = true,
    autoConnect = true,
    heartbeatInterval = 30000,
    heartbeatMessage = { type: 'ping' }
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>('CLOSED');
  const [lastMessage, setLastMessage] = useState<WebSocketEventMap['message'] | null>(null);
  
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef<number>(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  
  // 清理定时器
  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  // 创建WebSocket连接
  const connect = useCallback(() => {
    if (webSocketRef.current && (webSocketRef.current.readyState === WebSocket.OPEN || webSocketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // 清理之前的连接和计时器
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
    clearTimers();
    
    setStatus('CONNECTING');
    try {
      webSocketRef.current = new WebSocket(url, protocols);
      
      webSocketRef.current.onopen = (event) => {
        setStatus('OPEN');
        reconnectCountRef.current = 0;
        
        // 启动心跳检测
        if (heartbeatInterval > 0) {
          heartbeatTimerRef.current = window.setInterval(() => {
            if (webSocketRef.current?.readyState === WebSocket.OPEN) {
              if (typeof heartbeatMessage === 'string') {
                webSocketRef.current.send(heartbeatMessage);
              } else {
                webSocketRef.current.send(JSON.stringify(heartbeatMessage));
              }
            }
          }, heartbeatInterval);
        }
        
        onOpen?.(event);
      };
      
      webSocketRef.current.onmessage = (event) => {
        setLastMessage(event);
        onMessage?.(event);
      };
      
      webSocketRef.current.onclose = (event) => {
        setStatus('CLOSED');
        clearTimers();
        
        if (autoReconnect && reconnectOnClose && reconnectCountRef.current < reconnectAttempts) {
          reconnect();
        }
        
        onClose?.(event);
      };
      
      webSocketRef.current.onerror = (event) => {
        onError?.(event);
        
        // WebSocket API不会在onerror后自动关闭连接，所以我们自己关闭
        if (webSocketRef.current) {
          webSocketRef.current.close();
        }
      };
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      setStatus('CLOSED');
      
      if (autoReconnect && reconnectCountRef.current < reconnectAttempts) {
        reconnect();
      }
    }
  }, [url, protocols, onOpen, onMessage, onClose, onError, autoReconnect, reconnectAttempts, heartbeatInterval, heartbeatMessage, reconnectOnClose, clearTimers]);
  
  // 断开连接
  const disconnect = useCallback(() => {
    if (!webSocketRef.current) {
      return;
    }
    
    setStatus('CLOSING');
    clearTimers();
    
    try {
      webSocketRef.current.close();
    } catch (error) {
      console.error('WebSocket关闭失败:', error);
    }
  }, [clearTimers]);
  
  // 重新连接
  const reconnect = useCallback(() => {
    reconnectCountRef.current += 1;
    setStatus('RECONNECTING');
    
    reconnectTimerRef.current = window.setTimeout(() => {
      connect();
    }, reconnectInterval);
  }, [connect, reconnectInterval]);
  
  // 发送普通消息
  const sendMessage = useCallback((data: string | object) => {
    if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket未连接，无法发送消息');
      return;
    }
    
    try {
      if (typeof data === 'string') {
        webSocketRef.current.send(data);
      } else {
        webSocketRef.current.send(JSON.stringify(data));
      }
    } catch (error) {
      console.error('WebSocket发送消息失败:', error);
    }
  }, []);
  
  // 发送JSON消息
  const sendJsonMessage = useCallback((data: object) => {
    sendMessage(JSON.stringify(data));
  }, [sendMessage]);
  
  // 初始连接
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [url, protocols, autoConnect, connect, disconnect]);
  
  return {
    status,
    sendMessage,
    sendJsonMessage,
    connect,
    disconnect,
    reconnect,
    lastMessage,
    readyState: webSocketRef.current?.readyState ?? WebSocket.CLOSED,
    webSocket: webSocketRef.current
  };
};

export default useWebSocket; 