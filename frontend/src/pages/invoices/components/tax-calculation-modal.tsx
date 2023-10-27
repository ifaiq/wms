import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  ButtonPrimary,
  CustomForm,
  FormItem,
  InputItem,
  NumberInput,
  SelectItem
} from 'src/components';
import {
  CloseOutlined,
  AddCircleOutlined,
  RemoveCircleOutlineOutlined
} from '@mui/icons-material';
import { Form } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  getLineItemTotals,
  getServiceInvoiceProducts
} from 'src/store/selectors/features/service-invoice';
import {
  setIsInvoiceEdited,
  updateSOData
} from 'src/store/slices/features/service-invoice';
import { CombinedState } from 'redux';
import { ReduxState } from 'src/store';
import { TAX_OPTIONS, TAX_RATES, TAX_TYPES } from 'src/constants/invoice';

export const TaxCalculationModal: React.FC<ITaxCalculator> = ({
  title = 'Tax Calculation',
  visible,
  onCancel,
  closable = false,
  destroyOnClose = true,
  closeModal,
  width = 590,
  showCancelButton = true,
  props
}) => {
  const [t] = useTranslation('invoice');
  const { index: selectedRow } = props;
  const [form] = Form.useForm();
  const taxTypes = TAX_OPTIONS;

  const { totalWithoutTax } = useSelector((state: CombinedState<ReduxState>) =>
    getLineItemTotals(state, selectedRow)
  );

  const [addInitialRow, setAddInitialRow] = useState(true);
  const [grandTotal, setGrandTotal] = useState(totalWithoutTax);
  const lineItems = useSelector(getServiceInvoiceProducts);
  const dispatch = useDispatch();

  const calculateAndsetGrandAmount = (value: string, index: number) => {
    const { taxes } = form.getFieldsValue();
    let sum: number = totalWithoutTax;

    taxes.forEach((tax: { taxType: any; taxAmount: number }, i: number) => {
      if (i === index) {
        sum = Number(sum) + Number(value);
      } else if (tax.taxAmount) {
        sum = Number(sum) + Number(tax.taxAmount);
      }
    });
    setGrandTotal(sum);
  };

  const handleAddRow = (fields: TObject[], add: TFunction) => {
    if (fields.length >= taxTypes.length) return;
    add();
  };

  const handleRowDelete = (rowNumber: number | string, remove: any) => {
    const { taxes } = form.getFieldsValue();
    let sum: number = totalWithoutTax;
    taxes.forEach((tax: { taxType: any; taxAmount: number }, i: number) => {
      if (rowNumber !== i) sum = Number(sum) + Number(tax.taxAmount);
    });
    setGrandTotal(sum);
    // setting the inital row add flag to flase so that
    // a row does not get added erroneously while deleting rows
    setAddInitialRow(false);
    remove(rowNumber);
  };

  const displayTaxRate = (taxType: any) => {
    if (taxType === TAX_TYPES.VAT) return TAX_RATES.VAT;
    else if (taxType === TAX_TYPES.SALES_TAX) return TAX_RATES.SALES_TAX;
    else if (taxType === TAX_TYPES.SERVICE_TAX) return TAX_RATES.SERVICE_TAX;
    else if (taxType === TAX_TYPES.ADVANCE_TAX) return TAX_RATES.ADVANCE_TAX;
  };

  const onFinish = async () => {
    const formValues = await form.validateFields();
    const updatedProducts = lineItems;

    //if taxes are added and are not empty
    if (formValues.taxes && formValues.taxes.length > 0) {
      // appending tax rates against each selected tax type
      // based on tax types selected
      formValues.taxes.forEach((taxRow: TObject) => {
        taxRow.taxRate = displayTaxRate(taxRow.taxType);
      });
      // updating relevant keys depending on the type of values selected
      updatedProducts[selectedRow].tax = formValues;
      updatedProducts[selectedRow].grandTotalWithTax = formValues.grandTotal;
      updatedProducts[selectedRow].isTaxSelected = true;
    } else {
      updatedProducts[selectedRow].tax = [];
      updatedProducts[selectedRow].grandTotalWithTax = formValues.grandTotal;
      updatedProducts[selectedRow].isTaxSelected = false;
    }

    dispatch(updateSOData({ key: 'products', value: [...updatedProducts] }));
    dispatch(setIsInvoiceEdited(true));
    setAddInitialRow(true);
    onCancel?.();
  };

  useEffect(() => {
    form.setFieldsValue({ grandTotal: grandTotal });
  }, [grandTotal, form]);

  useEffect(() => {
    const selectedProduct = lineItems[selectedRow];

    if (selectedProduct.isTaxSelected) {
      form.setFieldsValue(selectedProduct.tax);
      let sum: number = totalWithoutTax;
      selectedProduct.tax.taxes.forEach(
        (tax: { taxType: any; taxAmount: number }) => {
          sum = Number(sum) + Number(tax.taxAmount);
        }
      );
      setGrandTotal(sum);
    }
  }, []);

  return (
    <Modal
      title={''}
      visible={visible}
      onCancel={closeModal}
      centered
      closable={closable}
      destroyOnClose={destroyOnClose}
      footer={null}
      width={width}
    >
      <CustomForm form={form} onFinish={onFinish}>
        <div className="flex flex-col">
          <div className="flex justify-between w-full">
            <p
              className="text-[18px] font-semibold mb-6
                  "
            >
              {title ? title : ''}
            </p>
            <button onClick={onCancel}>
              <CloseOutlined />
            </button>
          </div>
          <FormItem
            name={'totalExclTax'}
            label={t('invoice.taxModalTotalWOTax')}
          >
            <div>
              <InputItem
                type={'number'}
                minValue={0}
                value={totalWithoutTax}
                placeholder={`${totalWithoutTax}`}
                dataTestID={`Invoice`}
                disabled={true}
              />
            </div>
          </FormItem>

          <Form.List name="taxes">
            {(fields, { add, remove }) => {
              return (
                <>
                  {/* Adding 1 item in form list initially */}
                  {fields.length <= 0 && addInitialRow ? add() : null}
                  {/* Mapping on form items fields*/}
                  {fields.map(({ key, name }) => (
                    <div className="flex w-full justify-between " key={key}>
                      <div className="w-6/12 mr-12">
                        <FormItem
                          name={[name, 'taxType']}
                          label={t('invoice.taxModalTaxType')}
                          rules={[
                            {
                              required: true,
                              message: t('invoice.taxModalSelectTaxType')
                            }
                          ]}
                        >
                          <SelectItem
                            dataTestID={`taxType-${name}`}
                            placeholder={'Tax Type'}
                            onChange={(e: any) => {
                              e;
                            }}
                            options={taxTypes}
                            disabled={false}
                          />
                        </FormItem>
                      </div>
                      <div className="w-5/12">
                        <FormItem
                          name={[name, 'taxAmount']}
                          label={t('invoice.taxModalTaxAmount')}
                          rules={[
                            {
                              required: true,
                              message: t('invoice.taxModalEnterTaxAmount')
                            }
                          ]}
                        >
                          <NumberInput
                            dataTestID={`taxAmount-${name}`}
                            precision={2}
                            type={'number'}
                            minValue={0}
                            onChange={(e: any) => {
                              calculateAndsetGrandAmount(e, name);
                            }}
                          />
                        </FormItem>
                      </div>
                      <div className="flex justify-center items-center ml-2">
                        <Button
                          data-test-id={`removeRowButton`}
                          type="text"
                          icon={<RemoveCircleOutlineOutlined />}
                          onClick={() => handleRowDelete(name, remove)}
                        />
                      </div>
                    </div>
                  ))}
                  {/* Display add more button*/}
                  {fields.length < taxTypes.length && (
                    <div className="flex flex-row justify-start items-center my-5">
                      <div
                        className="flex flex-row cursor-pointer"
                        data-test-id={'addAnotherTax'}
                        onClick={() => {
                          handleAddRow(fields, add);
                        }}
                      >
                        <AddCircleOutlined className="text-blue-blue2" />
                        <div className="ml-2 text-blue-blue2">
                          {t('invoice.taxModalAddTax')}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            }}
          </Form.List>
          <FormItem name={'grandTotal'} label={t('invoice.taxModalTotalWTax')}>
            <div>
              <InputItem
                dataTestID={`Invoice`}
                value={Number(grandTotal).toFixed(2)}
                placeholder={`${grandTotal}`}
                disabled={true}
                onChange={(e: TObject) => {
                  e;
                }}
              />
            </div>
          </FormItem>

          <div className="flex justify-center mt-6 w-full">
            {showCancelButton && (
              <div className="w-full">
                <ButtonPrimary
                  type="submit"
                  onClick={onFinish}
                  text={t('invoice.continue')}
                  size="full"
                  dataTestID={'submitForm'}
                />
              </div>
            )}
          </div>
        </div>
      </CustomForm>
    </Modal>
  );
};
