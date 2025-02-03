import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../store/authSlice';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values: LoginForm) => {
    try {
      // 这里应该调用后端API进行登录验证
      // 模拟API调用
      const response = {
        user: {
          username: values.username,
          email: `${values.username}@example.com`,
        },
        token: 'mock-jwt-token',
      };

      dispatch(login(response));
      message.success('登录成功！');
      navigate('/cloud-drive');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码！');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">AI云盘系统</h1>
          <p className="text-gray-600">欢迎回来</p>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link to="/register" className="text-blue-600 hover:text-blue-700">
              还没有账号？立即注册
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 