import React from 'react';
import { Statuses } from 'src/components';
import {
  AlarmOnOutlined,
  HighlightOffOutlined,
  CheckCircleOutlineOutlined
} from '@mui/icons-material';
import { GRNStatus } from 'src/constants/grn';

const statuses: IStatuses[] = [
  {
    status: GRNStatus.READY,
    title: GRNStatus.READY,
    icon: <AlarmOnOutlined />
  },
  {
    status: GRNStatus.DONE,
    title: GRNStatus.DONE,
    icon: <CheckCircleOutlineOutlined />
  },
  {
    status: GRNStatus.CANCELLED,
    title: GRNStatus.CANCELLED,
    icon: <HighlightOffOutlined />
  }
];

export const GrnStatuses: React.FC<any> = ({ id }) => Statuses(statuses, id);
