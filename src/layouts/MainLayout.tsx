import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CloudOutlined,
  BookOutlined,
  ReadOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
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

  const mainMenuItems = [
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
      key: '/agent',
      icon: <ReadOutlined />,
      label: 'Agent',
    },
    {
      key: '/model-service',
      icon: <AppstoreOutlined />,
      label: '模型服务',
    },
  ];

  const userMenuItems = [
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
        <div className="flex items-center justify-between px-6 w-full">
          {/* 左侧部分：Logo 和主菜单 */}
          <div className="flex items-center flex-1">
            <div className="text-xl font-bold mr-8 whitespace-nowrap flex-shrink-0">AI-Cloud</div>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={mainMenuItems}
              onClick={({ key }) => handleMenuClick(key)}
              className="border-0 flex-grow"
              style={{ overflow: 'visible', whiteSpace: 'nowrap', minWidth: 'auto' }}
            />
          </div>
          {/* 右侧部分：用户菜单 */}
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={userMenuItems}
            onClick={({ key }) => handleMenuClick(key)}
            className="border-0"
          />
        </div>
      </Header>
      <Content className="p-6 border-r border-gray-200 bg-gray-50">
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MainLayout;
