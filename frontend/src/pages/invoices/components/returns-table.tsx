import { Edit, RemoveCircleOutlineOutlined } from '@mui/icons-material';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { EditableTable, InputItem, NumberInput } from 'src/components';
import {
  S_INV_KEYS,
  DN_RETURN_LINE_ITEM,
  TEST_ID_KEY_S_INVOICE
} from 'src/constants/invoice';
import { calculateTaxedAmount, getTotalWOTax } from '../helper';
import { getServiceInvoiceProducts } from 'src/store/selectors/features/service-invoice';
import {
  setIsInvoiceEdited,
  updateSOData
} from 'src/store/slices/features/service-invoice';
import { TaxCalculationModal } from './tax-calculation-modal';
import { getVendorCountry } from 'src/store/selectors/features/vendor';
import { getCurrency } from 'src/store/selectors/features/app';
import { Controller } from 'react-hook-form';

const {
  PRODUCTS,
  QTY,
  PRC_PER_UNIT,
  TOTAL_WO_TAX,
  TAX,
  TOTAL_W_TAX,
  MRP,
  SKU_NAME,
  SKU_CODE
} = S_INV_KEYS;

export const DebitNoteReturnsTable: React.FC<IFormProps> = ({ props }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('invoice');
  const productData: any = useSelector(getServiceInvoiceProducts);
  const [showTaxCalculator, setShowTaxCalculator] = useState(false);
  const [selectedLineItem, setSelectedLineItem] = useState(0);
  const country = useSelector(getVendorCountry) || {};
  const currency = getCurrency(country);
  const { control, setValue, errors } = props;

  const handleAddRow = () => {
    const newData = {
      ...DN_RETURN_LINE_ITEM,
      key: productData.length + 1
    };

    dispatch(updateSOData({ key: PRODUCTS, value: [...productData, newData] }));
  };

  /**
   * Add one row initially on page load
   */
  useEffect(() => {
    //product data not null
    if (productData) {
      if (productData.length === 0) handleAddRow();

      if (productData.length !== 0) {
        productData.forEach((lineItem: TObject, index: number) => {
          setValue(`qty${index}`, lineItem?.quantity || 0);
          setValue(`price${index}`, lineItem?.price || 0);
        });
      }
    }
  }, []);

  const handleDelete = (key: React.Key) => {
    const updatedProducts = productData.filter(
      (item: TObject) => item.key !== key
    );

    dispatch(updateSOData({ key: PRODUCTS, value: updatedProducts }));
    dispatch(setIsInvoiceEdited(true));
  };

  const handleTableInputChange = (
    index: number,
    key: string,
    value: TNumberOrString
  ) => {
    const updatedProducts = [...productData];
    updatedProducts[index][key] = value;
    dispatch(updateSOData({ key: PRODUCTS, value: updatedProducts }));
    dispatch(setIsInvoiceEdited(true));
  };

  const handleShowTaxCalculator = (index: any) => {
    setSelectedLineItem(index);
    setShowTaxCalculator(true);
  };

  const updateRowTotals = (rowIndex: number) => {
    const selectedRow = productData[rowIndex!];
    const newTotalWithoutTax = getTotalWOTax(selectedRow);
    const updatedProducts = JSON.parse(JSON.stringify(productData));
    updatedProducts[rowIndex!].subTotalWithoutTax = newTotalWithoutTax;

    // if tax is not already added, then grand total = totalWithoutTax
    if (!selectedRow.isTaxSelected) {
      updatedProducts[rowIndex!].grandTotalWithTax = newTotalWithoutTax;
    }
    // if tax is added, then get tax amount by accessing the 'tax' key in
    // the product row and performing some calculations. set grandTotalWithTax
    // as newTotalWithoutTax + the tax amount calculated
    else {
      const taxedAmount = calculateTaxedAmount(selectedRow);

      const newGrandTotalWithTax =
        Number(taxedAmount) + Number(newTotalWithoutTax);

      updatedProducts[rowIndex!].grandTotalWithTax = newGrandTotalWithTax;
    }

    dispatch(updateSOData({ key: PRODUCTS, value: updatedProducts }));
  };

  const renderTaxField = (
    _: any,
    __: any,
    index: TNumberOrString | undefined
  ) => {
    if (productData[index!].isTaxSelected) {
      return (
        <div className="justify-between">
          <span>{`${currency} ${calculateTaxedAmount(
            productData[index!]
          )}`}</span>
          <span
            className=" ml-2 p-2 cursor-pointer text-blue-blue2"
            onClick={() => handleShowTaxCalculator(index)}
          >
            <Edit />
          </span>
        </div>
      );
    } else {
      return (
        <span
          className=" p-3 text-blue-blue2 underline cursor-pointer"
          onClick={() => handleShowTaxCalculator(index)}
        >
          {t('invoice.addTax')}
        </span>
      );
    }
  };

  const serviceInvoiceColumns: ITableColumn[] = [
    {
      title: t('invoice.sNo'),
      dataIndex: 'sNO',
      key: 'sNO',
      render: (_, record: { key: React.Key }) => (
        <div className="flex justify-center">
          {Number(record.key) < 10
            ? `0${Number(record.key) + 1}`
            : Number(record.key) + 1}
        </div>
      ),
      editable: false,
      width: '3%',
      fixed: 'left'
    },
    {
      title: t('invoice.skuCode'),
      dataIndex: SKU_CODE,
      key: SKU_CODE,
      width: '14%',
      fixed: 'left',
      render: (_, __, index) => (
        <InputItem
          dataTestID={`${TEST_ID_KEY_S_INVOICE}skuCode`}
          size={'large'}
          placeholder={t('invoice.enterSKUCode')}
          value={productData[index!]?.skuCode}
          onChange={(e: any) =>
            handleTableInputChange(+index!, SKU_CODE, e.target.value || '')
          }
        />
      )
    },
    {
      title: t('invoice.skuName'),
      dataIndex: SKU_NAME,
      key: SKU_NAME,
      width: '18%',
      fixed: 'left',
      render: (_, __, index) => (
        <InputItem
          dataTestID={`${TEST_ID_KEY_S_INVOICE}skuName`}
          size={'large'}
          placeholder={t('invoice.enterSKUName')}
          value={productData[index!]?.skuName}
          onChange={(e: any) =>
            handleTableInputChange(+index!, SKU_NAME, e.target.value || '')
          }
        />
      )
    },
    {
      title: t('invoice.qtyReturned'),
      dataIndex: QTY,
      key: QTY,
      fixed: 'left',
      width: '10%',
      render: (_, __, index) => (
        <Controller
          control={control}
          rules={{
            validate: (value) => Number(value) > 0 || t('invoice.valueGTzero')
          }}
          name={`qty${index}`}
          render={({ field: { onChange } }) => (
            <>
              <NumberInput
                dataTestID={`${TEST_ID_KEY_S_INVOICE}ProductQunatity`}
                value={productData[index!]?.quantity}
                precision={2}
                onChange={(value: string) => {
                  handleTableInputChange(+index!, QTY, Number(value) || 0);
                  updateRowTotals(+index!);
                  onChange(value);
                }}
                size={'large'}
              />
              <span className={`absolute top-0 left-1 text-error`}>
                {errors[`qty${index}`]?.message}
              </span>
            </>
          )}
        />
      )
    },
    {
      title: `${t('invoice.pricePerUnit')}`,
      dataIndex: PRC_PER_UNIT,
      key: PRC_PER_UNIT,
      fixed: 'left',
      width: '10%',
      render: (_, __, index) => (
        <Controller
          control={control}
          rules={{
            validate: (value) => Number(value) > 0 || t('invoice.valueGTzero')
          }}
          name={`price${index}`}
          render={({ field: { onChange } }) => (
            <>
              <NumberInput
                dataTestID={`${TEST_ID_KEY_S_INVOICE}PricePerUnit`}
                value={productData[index!]?.price}
                precision={2}
                onChange={(value: string) => {
                  handleTableInputChange(
                    +index!,
                    PRC_PER_UNIT,
                    Number(value) || 0
                  );
                  updateRowTotals(+index!);
                  onChange(value);
                }}
                size={'large'}
              />
              <span className={`absolute top-0 left-1 text-error`}>
                {errors[`price${index}`]?.message}
              </span>
            </>
          )}
        />
      )
    },
    {
      title: `${t('invoice.mrp')}`,
      dataIndex: PRC_PER_UNIT,
      key: PRC_PER_UNIT,
      fixed: 'left',
      width: '8%',
      render: (_, __, index) => (
        <NumberInput
          dataTestID={`${TEST_ID_KEY_S_INVOICE}MRP`}
          value={productData[index!]?.mrp}
          precision={2}
          defaultValue={0.0}
          onChange={(value: string) => {
            handleTableInputChange(+index!, MRP, Number(value) || 0);
            updateRowTotals(+index!);
          }}
          size={'large'}
        />
      )
    },
    {
      title: `${t('invoice.subTotal')}`,
      dataIndex: TOTAL_WO_TAX,
      key: TOTAL_WO_TAX,
      fixed: 'left',
      width: '8%',
      render: (_, __, index) => (
        <div className="justify-center">
          {`${currency} ${parseFloat(productData[index!][TOTAL_WO_TAX]).toFixed(
            2
          )}`}
        </div>
      )
    },
    {
      title: `${t('invoice.vatOrTax')}`,
      dataIndex: TAX,
      key: TAX,
      width: '8%',
      fixed: 'left',
      render: renderTaxField
    },
    {
      title: `${t('invoice.grandTotal')}`,
      dataIndex: TOTAL_W_TAX,
      key: TOTAL_W_TAX,
      fixed: 'left',
      width: '8%',
      render: (_, __, index) => (
        <div className="justify-center">
          {`${currency} ${parseFloat(productData[index!][TOTAL_W_TAX]).toFixed(
            2
          )}`}
        </div>
      )
    }
  ];

  const action: ITableColumn[] = [
    {
      title: '',
      dataIndex: 'remove',
      key: 'remove',
      render: (_, record: { key: React.Key }) =>
        productData.length >= 1 ? (
          <div className="flex justify-center">
            <Button
              data-test-id={`${TEST_ID_KEY_S_INVOICE}ProductRemoveRowButton`}
              type="text"
              icon={<RemoveCircleOutlineOutlined />}
              onClick={() => handleDelete(record.key)}
            />
          </div>
        ) : null,
      editable: false,
      width: '3%',
      fixed: 'right'
    }
  ];

  const tableColumns = [...serviceInvoiceColumns, ...action];

  return (
    <div className="mt-10">
      {showTaxCalculator && (
        <TaxCalculationModal
          visible={showTaxCalculator}
          onConfirm={() => {
            null;
          }}
          onCancel={() => setShowTaxCalculator(false)}
          props={{
            index: selectedLineItem
          }}
        />
      )}
      <div>
        <EditableTable
          dataTestID={`${TEST_ID_KEY_S_INVOICE}ProductTable`}
          dataSource={productData}
          tableColumns={tableColumns}
          handleAddRow={handleAddRow}
          showAddRowButton={true}
        />
      </div>
    </div>
  );
};
