import React from 'react';
import { Statuses } from 'src/components';
import { CheckCircleOutlineOutlined } from '@mui/icons-material';
import { TRANSFER_STATUS } from 'src/constants/transfers';
import { AlarmOnOutlined, HighlightOffOutlined } from '@mui/icons-material';

interface IStaus {
  activeState: string;
}

const statuses: IStatuses[] = [
  {
    status: TRANSFER_STATUS.READY,
    title: TRANSFER_STATUS.READY,
    icon: <AlarmOnOutlined />
  },
  {
    status: TRANSFER_STATUS.DONE,
    title: TRANSFER_STATUS.DONE,
    icon: <CheckCircleOutlineOutlined />
  },
  {
    status: TRANSFER_STATUS.CANCELLED,
    title: TRANSFER_STATUS.CANCELLED,
    icon: <HighlightOffOutlined />
  }
];

export const TransferStatus: React.FC<IStaus> = ({ activeState }) =>
  Statuses(statuses, activeState);
