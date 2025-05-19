import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  NodeIndexOutlined
} from '@ant-design/icons';
import { useAuth, useWindowSize } from '../hooks';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { width } = useWindowSize();

  // 根据窗口大小自动折叠侧边栏
  useEffect(() => {
    if (width < 768) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [width]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname.split('/')[1];
    return path || 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'roles',
      icon: <TeamOutlined />,
      label: '角色管理',
    },
    {
      key: 'workflow',
      icon: <NodeIndexOutlined />,
      label: '工作流管理',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      key: 'low-code-config',
      label: '低代码配置',
      icon: <AppstoreOutlined />,
    },
  ];

  const userDropdownItems = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人资料',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
      }
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') {
        handleLogout();
      } else if (key === 'profile') {
        // 跳转到个人资料页面
        navigate('/profile');
      }
    }
  };

  const handleMenuClick = (key: string) => {
    navigate(`/${key}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="md"
        collapsedWidth={width < 576 ? 0 : 80}
      >
        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(String(key))}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ marginRight: 16, display: 'flex', alignItems: 'center' }}>
            {user && (
              <Dropdown menu={userDropdownItems} placement="bottomRight">
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                  <span style={{ marginRight: 8 }}>{user.username}</span>
                </div>
              </Dropdown>
            )}
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 