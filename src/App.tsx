import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import './App.css';
import LowCodeConfig from './pages/LowCodeConfig';
import AITest from './pages/AITest';

// 懒加载页面组件
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Roles = lazy(() => import('./pages/Roles'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Workflow = lazy(() => import('./pages/Workflow'));

// 加载中组件
const LoadingComponent = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Suspense fallback={LoadingComponent}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="roles" element={<Roles />} />
              <Route path="settings" element={<Settings />} />
              <Route path="low-code-config" element={<LowCodeConfig />} />
              <Route path="ai-test" element={<AITest />} />
              <Route path="workflow" element={<Workflow />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ConfigProvider>
  );
}

export default App; 