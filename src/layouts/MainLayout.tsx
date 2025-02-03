import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CloudOutlined,
  BookOutlined,
  ReadOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const { Header, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleMenuClick = (key: string) => {
    if (key === 'logout') {
      dispatch(logout());
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  const menuItems = [
    {
      key: '/cloud-drive',
      icon: <CloudOutlined />,
      label: '云盘',
    },
    {
      key: '/knowledge-base',
      icon: <BookOutlined />,
      label: '知识库',
    },
    {
      key: '/ai-reader',
      icon: <ReadOutlined />,
      label: 'AI阅读',
    },
    {
      key: 'user',
      icon: <UserOutlined />,
      label: '个人中心',
      children: [
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: '退出登录',
        },
      ],
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="px-0 bg-white">
        <div className="flex items-center justify-between px-6">
          <div className="text-xl font-bold">AI云盘系统</div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
            className="flex-1 justify-end border-0"
          />
        </div>
      </Header>
      <Content className="p-6">
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MainLayout; 