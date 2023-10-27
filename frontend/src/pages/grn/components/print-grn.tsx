import React from 'react';
import { usePrintGRN, usePrintReturnGRN } from 'src/hooks';
import { PrintOutlined } from '@mui/icons-material';

export const PrintGrn: React.FC<IActionButton> = ({
  dataCy,
  text,
  disabled,
  style,
  id,
  isReturn
}) => {
  const { mutateAsync: printGRNMutation } = usePrintGRN();
  const { mutateAsync: printReturnGRNMutation } = usePrintReturnGRN();

  const printGrn = () =>
    isReturn ? printReturnGRNMutation(id) : printGRNMutation(id);

  return (
    <button
      data-cy={dataCy}
      style={style}
      disabled={disabled}
      className={`flex font-semibold justify-center items-center bg-transparent text-green
       border-[1px] border-green rounded-lg text-sm	px-2
      min-w-[138px] auto h-11`}
      onClick={printGrn}
    >
      <PrintOutlined className="mr-2" />
      {text}
    </button>
  );
};
