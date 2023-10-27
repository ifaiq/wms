import React, { useEffect, useState } from 'react';
import { FormItem } from 'src/components/form';
import { SelectItem } from 'src/components/select';
import { TableWrapper } from 'src/components/table';
import { useFetchTaxCodeByGroupId } from 'src/hooks/useVendor';

export const vendorTaxGroup: React.FC<IVendorTaxGroupType> = ({
  t,
  taxGroups,
  taxGroup,
  disabled
}) => {
  const [taxGroupId, setTaxGroupId] = useState('');
  const { data: taxCodesByGroupId } = useFetchTaxCodeByGroupId(taxGroupId);

  useEffect(() => {
    setTaxGroupId(taxGroup);
  }, [taxGroup]);

  const taxGroupHandler = (groupId: string) => {
    setTaxGroupId(groupId);
  };

  const columns = [
    {
      title: 'Tax Code',
      dataIndex: 'taxCode',
      key: 'taxCode'
    },
    {
      title: 'Tax Percentage (%)',
      dataIndex: 'activePercentage',
      key: 'activePercentage'
    }
  ];

  return (
    <>
      <div
        className={`border-2 ${
          disabled ? 'border-[#bdbdbd]' : 'border-blue-blue1'
        } border-dotted rounded-lg  mb-4 px-4 py-2 max-h-[400px] overflow-auto`}
      >
        <FormItem
          name={'taxGroup'}
          label={t('vendor.taxGroup')}
          rules={[{ required: true }]}
        >
          <SelectItem
            dataTestID="testTaxGroup"
            placeholder={t('vendor.taxGroupPlaceholder')}
            value={taxGroup}
            onChange={(e: string) => taxGroupHandler(e)}
            options={taxGroups}
          />
        </FormItem>
        {taxCodesByGroupId?.data?.taxCodes ? (
          <TableWrapper
            columns={columns}
            size="middle"
            dataSource={taxCodesByGroupId?.data?.taxCodes}
            pagination={false}
          />
        ) : (
          t('vendor.taxCodePlaceholderText')
        )}
      </div>
    </>
  );
};
