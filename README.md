# Admin System

A React-based admin system template.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## WebSocket Hooks

本项目提供了强大的 WebSocket 集成能力，有两种使用方式：

### 1. 直接使用 useWebSocket Hook

适合在单个组件中使用 WebSocket 连接。

```tsx
import { useWebSocket } from './hooks';

const MyComponent = () => {
  const {
    status,
    sendMessage,
    lastMessage,
    connect,
    disconnect,
    reconnect
  } = useWebSocket({
    url: 'wss://example.com/ws',
    onOpen: () => console.log('连接已建立'),
    onMessage: (event) => console.log('收到消息:', event.data),
    onClose: () => console.log('连接已关闭'),
    onError: () => console.log('连接错误')
  });

  // ...使用WebSocket状态和方法
};
```

### 2. 使用 WebSocket Context

适合在整个应用或大型组件树中共享同一个 WebSocket 连接。

```tsx
// 在应用根组件中
import { WebSocketProvider } from './hooks';

const App = () => {
  return (
    <WebSocketProvider
      options={{
        url: 'wss://example.com/ws',
        autoReconnect: true
      }}
    >
      <YourApp />
    </WebSocketProvider>
  );
};

// 在子组件中
import { useWebSocketContext } from './hooks';

const ChatRoom = () => {
  const { status, sendMessage, lastMessage } = useWebSocketContext();
  
  // ...使用WebSocket状态和方法
};
```

### 3. 使用消息处理组件

```tsx
import { WebSocketMessageHandler } from './hooks';

// 在组件中
<WebSocketMessageHandler<UserMessage> type="user_update">
  {(userData) => (
    <div>
      User {userData.name} updated their profile
    </div>
  )}
</WebSocketMessageHandler>
```

### 完整配置选项

```tsx
const ws = useWebSocket({
  // 必需配置
  url: 'wss://example.com/ws',
  
  // 可选配置
  protocols: ['protocol1', 'protocol2'],
  onOpen: (event) => {},
  onClose: (event) => {},
  onMessage: (event) => {},
  onError: (event) => {},
  reconnectAttempts: 5,       // 最大重连次数
  reconnectInterval: 3000,    // 重连间隔 (ms)
  reconnectOnClose: true,     // 连接关闭后是否自动重连
  autoReconnect: true,        // 是否启用自动重连
  autoConnect: true,          // 初始化时是否自动连接
  heartbeatInterval: 30000,   // 心跳间隔 (ms)
  heartbeatMessage: { type: 'ping' } // 心跳消息内容
});
```

## 示例组件

项目包含两个 WebSocket 示例组件:

1. `WebSocketDemo` - 展示基本的 useWebSocket Hook 使用方法
2. `WebSocketContextDemo` - 展示基于 Context API 的 WebSocket 共享连接使用方法
