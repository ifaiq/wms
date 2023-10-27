import React from 'react';
import { useSelector } from 'react-redux';
import { DEBIT_NOTE_TYPES } from 'src/constants/common';
import { getInvoiceDNType } from 'src/store/selectors/features/service-invoice';
import { DebitNoteRebatesTable } from './rebates-table';
import { DebitNoteReturnsTable } from './returns-table';

export const DebitNoteTables: React.FC<IFormProps> = ({ props }) => {
  const debitNoteType = useSelector(getInvoiceDNType);
  const { control, setValue, errors } = props;

  const renderTable = () => {
    if (debitNoteType === DEBIT_NOTE_TYPES.REBATE) {
      return <DebitNoteRebatesTable props={{ control, setValue, errors }} />;
    }

    if (debitNoteType === DEBIT_NOTE_TYPES.RETURN) {
      return <DebitNoteReturnsTable props={{ control, setValue, errors }} />;
    }

    return <></>;
  };

  return <>{renderTable()}</>;
};
