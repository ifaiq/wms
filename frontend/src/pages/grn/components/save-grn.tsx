import React from 'react';
import { ButtonPrimary } from 'src/components';
import { TEST_ID_KEY_GRN } from 'src/constants/grn';

export const SaveGrn: React.FC<IActionButton> = ({
  text,
  disabled,
  onClick
}) => (
  <div className="ml-2">
    <ButtonPrimary
      type="submit"
      disabled={disabled}
      size="large"
      onClick={onClick}
      text={`${text}`}
      dataTestID={`${TEST_ID_KEY_GRN}Update`}
    />
  </div>
);
