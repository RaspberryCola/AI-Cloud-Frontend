import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';
import classNames from 'classnames';

export interface ButtonProps extends AntButtonProps {
  noBorderOnActive?: boolean; // 是否在按下状态时取消边框
}

/**
 * 通用按钮组件，解决了按下状态时出现奇怪边框的问题
 */
const Button: React.FC<ButtonProps> = ({ 
  className, 
  noBorderOnActive = true, 
  children, 
  ...props 
}) => {
  const buttonClasses = classNames(
    className,
    {
      'focus:outline-none active:outline-none': noBorderOnActive
    }
  );

  return (
    <AntButton
      className={buttonClasses}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button; 