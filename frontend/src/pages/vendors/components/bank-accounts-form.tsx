import {
  AddCircleOutlined,
  RemoveCircleOutlineOutlined
} from '@mui/icons-material';
import { Form } from 'antd';
import { SelectItem, InputItem, FormItem } from 'src/components';
import { COUNTRY_CODES } from 'src/constants/common';
import { getIBAN } from 'src/constants/iban';
import banks from './banks.json';

/* bank accounts */
type IBankAccountFormType = {
  t: any;
  country: COUNTRY_CODES;
  bankAccountHandler: (
    value: string,
    name: string,
    index: number,
    add: boolean
  ) => void;
  disabled?: boolean;
  bankAccounts: TArrayOfObjects;
};

export const bankAccountsForm = ({
  t,
  country,
  disabled,
  bankAccounts,
  bankAccountHandler
}: IBankAccountFormType) => {
  return (
    <>
      <div
        className={`border-2 ${
          disabled ? 'border-[#bdbdbd]' : 'border-blue-blue1'
        } border-dotted rounded-lg  mb-4 px-4 py-2 max-h-[400px] overflow-auto`}
      >
        <Form.List name="bankAccounts">
          {(fields, { add, remove }) => {
            const bankList = banks?.[country]?.list?.map((bank: TObject) => ({
              id: bank.bank,
              name: bank.bank
            }));

            return (
              <>
                {/* Adding 1 item in form list intially */}
                {fields.length <= 0 ? add() : null}
                {/* Mapping on form items fields*/}
                {fields.map(({ key, name }) => (
                  <div key={key}>
                    <FormItem
                      name={[name, 'bank']}
                      label={t('vendor.addBankAccount')}
                    >
                      <SelectItem
                        dataTestID={`bankAccount-${name}`}
                        disabled={disabled}
                        placeholder={t('vendor.bankPlaceholder')}
                        onChange={(e: string) =>
                          bankAccountHandler('bank', e, key, true)
                        }
                        options={bankList}
                      />
                    </FormItem>
                    {bankAccounts[name]?.bank && (
                      <FormItem
                        name={[name, 'accountNumber']}
                        label={t('vendor.IBAN')}
                        tooltip={
                          getIBAN(country)?.sample
                            ? `Must Match IBAN format ${
                                getIBAN(country)?.sample
                              }`
                            : 'Please Select Country'
                        }
                        rules={[
                          {
                            pattern: `${getIBAN(country)?.format}`,
                            message: 'Invalid IBAN'
                          }
                        ]}
                      >
                        <InputItem
                          dataTestID={`IBAN-${name}`}
                          disabled={disabled}
                          placeholder={t('vendor.ibanPlaceholder')}
                          maxLength={getIBAN(country)?.sample.length}
                        />
                      </FormItem>
                    )}

                    {/* Display remove button for more than 1 elements */}
                    {!disabled && fields.length > 1 && (
                      <div className="flex flex-row justify-end items-center">
                        <div
                          className="flex flex-row  cursor-pointer"
                          data-test-id={'removeBankAccount'}
                          onClick={() => {
                            remove(name);
                            bankAccountHandler('', '', name, false);
                          }}
                        >
                          <RemoveCircleOutlineOutlined className="text-blue-blue2" />
                          <div className="ml-2 text-blue-blue2">
                            {t('vendor.remove')}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Display seprator border for 1 or more elements*/}
                    {key >= 0 && (
                      <div className="border-t-2 border-gray-grey13 my-4 border-dotted"></div>
                    )}
                  </div>
                ))}
                {/* Display add more button*/}
                {!disabled && bankAccounts[fields.length - 1]?.bank && (
                  <div className="flex flex-row justify-end items-center">
                    <div
                      className="flex flex-row cursor-pointer"
                      data-test-id={'addBankAccount'}
                      onClick={() => add()}
                    >
                      <AddCircleOutlined className="text-blue-blue2" />
                      <div className="ml-2 text-blue-blue2">
                        {t('vendor.addAccount')}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          }}
        </Form.List>
      </div>
    </>
  );
};
