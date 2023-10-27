import React from 'react';
import { Steps } from 'antd';
import {
  ModeOutlined,
  VisibilityOutlined,
  AssignmentTurnedInOutlined,
  LockOutlined
} from '@mui/icons-material';

const { Step } = Steps;

const getIcon = (name: string) => {
  const icons: Record<string, ReactNode> = {
    ModeOutlined: <ModeOutlined />,
    VisibilityOutlined: <VisibilityOutlined />,
    AssignmentTurnedInOutlined: <AssignmentTurnedInOutlined />,
    LockOutlined: <LockOutlined />
  };

  return icons[name];
};

export const Stages: React.FC<IStages[]> = (stages) => (
  <Steps type="navigation" size="small" current={-1}>
    {stages.length > 0
      ? stages.map((stage) => (
          <Step
            key={stage.title}
            status={stage.status}
            title={stage.title.toUpperCase()}
            icon={getIcon(stage.icon)}
            className={'mx-[15px] px-[10px] text-blue-blue2'}
          />
        ))
      : null}
  </Steps>
);

export const Statuses: React.FC<IStatuses[]> = (
  stages,
  current,
  seprator = ' | '
) => (
  <div className="flex justify-between items-center">
    {stages.length > 0
      ? stages.map((stage, i) => {
          const activeStateColor =
            current === stage.status
              ? 'text-blue-blue3 font-semibold'
              : 'text-gray-grey13';

          return (
            <div className={'flex items-center'} key={stage.title}>
              <div className={'justify-end mx-4'}>
                <span className={`${activeStateColor} mx-1`}>{stage.icon}</span>
                <span className={`${activeStateColor} mx-1`}>
                  {stage.title}
                </span>
              </div>
              {stages.length - 1 !== i ? seprator : null}
            </div>
          );
        })
      : null}
  </div>
);
