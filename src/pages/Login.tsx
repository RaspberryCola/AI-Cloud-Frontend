import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { login as loginAction } from '../store/authSlice';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: LoginForm) => {
    try {
      const response = await loginApi(values);
      
      if (response.code === 200) {
        // 保存token到localStorage
        localStorage.setItem('token', response.data.access_token);
        
        // 更新Redux状态
        dispatch(loginAction({
          user: {
            username: values.username,
            email: '', // 登录接口没有返回email，如果需要可以添加额外的用户信息接口获取
          },
          token: response.data.access_token,
        }));

        message.success(response.message);
        navigate('/cloud-drive');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请检查用户名和密码！');
      form.setFields([
        {
          name: 'password',
          errors: ['用户名或密码错误'],
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">小鱼快传2.0</h1>
          <p className="text-gray-600">欢迎回来</p>
        </div>
        
        <Form
          form={form}
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