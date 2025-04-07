// 导入必要的React和第三方库
import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginAction } from '../store/authSlice';
import { userService } from '../services/userService';
import { LoginRequest } from '../types/user';

// 定义登录表单的数据结构
interface LoginForm {
  username: string;
  password: string;
}

// 登录组件
const Login: React.FC = () => {
  // 获取dispatch用于触发Redux actions
  const dispatch = useDispatch();
  // 获取导航函数用于路由跳转
  const navigate = useNavigate();
  // 创建表单实例
  const [form] = Form.useForm();

  // 表单提交处理函数
  const onFinish = async (values: LoginForm) => {
    try {
      // 构造登录请求参数
      const loginRequest: LoginRequest = {
        username: values.username,
        password: values.password
      }

      // 发送登录请求
      const response = await userService.login(loginRequest);

      if (response.code === 0) {
        // 更新Redux状态
        dispatch(loginAction({
          user: {
            username: values.username,
            email: '', // 登录接口没有返回email，如果需要可以添加额外的用户信息接口获取
          },
          token: response.data.access_token,
        }));

        // 显示成功消息并跳转
        message.success(response.message);
        navigate('/cloud-drive');
      } else {
        // 显示错误消息
        message.error(response.message || '登录失败');
      }
    } catch (error: any) {
      // 处理登录失败的情况
      message.error(error.response?.data?.message || '登录失败，请检查用户名和密码！');
      // 设置表单字段错误状态
      form.setFields([
        {
          name: 'password',
          errors: ['用户名或密码错误'],
        },
      ]);
    }
  };

  // 渲染登录表单
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96 shadow-lg">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">AI-Cloud</h1>
          <p className="text-gray-600">欢迎回来</p>
        </div>

        {/* 登录表单 */}
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          {/* 用户名输入框 */}
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

          {/* 密码输入框 */}
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

          {/* 登录按钮 */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>

          {/* 注册链接 */}
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
