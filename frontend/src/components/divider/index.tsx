import React from 'react';
import { Divider } from 'antd';

export const DividerComponent: React.FC<IDivivder> = ({
  type = 'vertical',
  style = { borderColor: 'gray' },
  dashed = false
}) => {
  return <Divider type={type} style={{ ...style }} dashed={dashed} />;
};
