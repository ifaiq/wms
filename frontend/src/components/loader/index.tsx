import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const Spinner = () => (
  <div className="flex items-center justify-center h-[100vh]">
    <Spin />
  </div>
);

export const Loader: React.FC<ILoader> = ({ className, loaderColor }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Spin
      indicator={
        <LoadingOutlined className={`text-[24px] ${loaderColor}`} spin />
      }
    />
  </div>
);

export const OverlayLoader: React.FC<ILoader> = ({ className }) => (
  <div
    className={`flex items-center fixed bg-[rgba(0,0,0,0.1)] 
  justify-center z-10 top-0 bottom-0 left-0 right-0 ${className} overflow-hidden`}
  >
    <Spin size="large" />
  </div>
);
