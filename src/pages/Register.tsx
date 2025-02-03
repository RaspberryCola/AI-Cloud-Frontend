import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register as registerApi } from '../services/api';
import { login as loginAction } from '../store/authSlice';

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterForm) => {
    try {
      const { confirmPassword, ...registerData } = values;
      const response = await registerApi(registerData);

      if (response.code === 201) {
        message.success(response.message);
        // 注册成功后自动登录
        // 这里可以根据实际需求决定是否自动登录，或者跳转到登录页面
        navigate('/login');
      } else {
        message.error(response.message || '注册失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败，请稍后重试！');
      if (error.response?.data?.field) {
        form.setFields([
          {
            name: error.response.data.field,
            errors: [error.response.data.message],
          },
        ]);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">注册账号</h1>
          <p className="text-gray-600">创建您的AI云盘账号</p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 3, message: '用户名至少3个字符！' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱！' },
              { type: 'email', message: '请输入有效的邮箱地址！' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号！' },
              { pattern: /^\+?[1-9]\d{1,14}$/, message: '请输入有效的手机号！' },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="手机号（格式：+8613355734398）"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码至少6个字符！' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致！'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              注册
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              已有账号？立即登录
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register; 