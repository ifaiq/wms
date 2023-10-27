import React from 'react';
import { Statuses } from 'src/components';
import { CheckCircleOutlineOutlined } from '@mui/icons-material';
import { ADJUSTMENT_STATUS } from 'src/constants/adjustment';
import { AlarmOnOutlined, HighlightOffOutlined } from '@mui/icons-material';

interface IStaus {
  activeState: string;
}

const statuses: IStatuses[] = [
  {
    status: ADJUSTMENT_STATUS.READY,
    title: ADJUSTMENT_STATUS.READY,
    icon: <AlarmOnOutlined />
  },
  {
    status: ADJUSTMENT_STATUS.DONE,
    title: ADJUSTMENT_STATUS.DONE,
    icon: <CheckCircleOutlineOutlined />
  },
  {
    status: ADJUSTMENT_STATUS.CANCELLED,
    title: ADJUSTMENT_STATUS.CANCELLED,
    icon: <HighlightOffOutlined />
  }
];

export const Status: React.FC<IStaus> = ({ activeState }) =>
  Statuses(statuses, activeState);
