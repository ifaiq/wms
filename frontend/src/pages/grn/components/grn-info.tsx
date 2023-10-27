import moment from 'moment';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FormElement, SelectItem } from 'src/components';
import { DATE_FORMAT } from 'src/constants/date-format';
import { RECEIPT_DOCUMENT_TYPE, TEST_ID_KEY_GRN } from 'src/constants/grn';
import { useGetAllLocationsByType } from 'src/hooks';
import {
  getGrnBusinessUntiId,
  getGrnCountry,
  getGRNCreationDate,
  getGrnId,
  getGRNPoId,
  getGRNReceiptId,
  getGRNReceivedDate,
  getGRNVendorName,
  getGrnWarehouseId,
  getGRNWarehouseName,
  getIsGrnStatusCancelled,
  getLocationFromId,
  getLocationToId,
  getReturnInLocation,
  getReturnInRefId
} from 'src/store/selectors/features/grn';
import {
  updateGRNData,
  updateGRNEditMode
} from 'src/store/slices/features/grn';
import { prepareFilterRequestPayload } from 'src/utils/filterPayload';
import { generateFormattedId } from 'src/utils/format-ids';
import { getGrnorReturnFormate } from 'src/utils/grn-formate';
import { GrnAttachments } from './grn-attachments';

export const GrnInfo: React.FC<IFormProps> = ({ children, props }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('grn');

  const { control, errors } = props;

  const grnId = useSelector(getGrnId);
  const vendorName = useSelector(getGRNVendorName);
  const warehouseName = useSelector(getGRNWarehouseName);
  const createdAt = useSelector(getGRNCreationDate);
  const poId = useSelector(getGRNPoId);
  const receivedAT = useSelector(getGRNReceivedDate);
  const receiptId = useSelector(getGRNReceiptId);
  const isGRNCancelled = useSelector(getIsGrnStatusCancelled);
  const country = useSelector(getGrnCountry);
  const businessUnitId = useSelector(getGrnBusinessUntiId);
  const warehouseId = useSelector(getGrnWarehouseId);
  const locationToId = useSelector(getLocationToId);
  const locationFromId = useSelector(getLocationFromId);
  const returnInId = useSelector(getReturnInRefId);
  const returnInLocation = useSelector(getReturnInLocation);

  const requestPayload: TObject = prepareFilterRequestPayload({
    country,
    businessUnitId,
    warehouseId,
    excludeLocationId: returnInId && returnInLocation?.id,
    grnApplicable: receiptId ? false : true,
    returnApplicable: receiptId ? true : false
  });

  const { data: parentLocationsData } =
    useGetAllLocationsByType(requestPayload);

  const allParentLocations = parentLocationsData?.data?.map(
    (location: TObject) => ({ id: location?.id, name: location?.name })
  );

  const getFormatedDate = (date: Date) =>
    date ? moment(date).format(DATE_FORMAT.GRN_DISPLAY) : 'NA';

  const formHandler = (key: string, value: TNumberOrString) => {
    dispatch(updateGRNData({ key, value }));
    dispatch(updateGRNEditMode(true));
  };

  const renderItemDetail = (label: string, value: string) => (
    <div className="flex flex-col justify-start mt-6">
      <h3 className="text-md font-semibold">{label}</h3>
      <span className="mt-2 text-gray-grey2">{value ? value : '-'}</span>
    </div>
  );

  const getSourceDoc = () => {
    if (receiptId) return getGrnorReturnFormate(receiptId, 0);

    if (returnInId) return getGrnorReturnFormate(returnInId, returnInId);

    return `P${generateFormattedId(poId)}`;
  };

  const isDocumentGRN = !receiptId && !returnInId;
  const isDocumentReturnOrReturnIn = receiptId || returnInId;

  return (
    <div className="flex justify-between mx-14">
      {/* Col 1 */}
      <div className="flex flex-wrap w-[50%]">
        <div className="basis-[50%]">
          {renderItemDetail(t('grn.vendorName'), vendorName)}
          {renderItemDetail(t('grn.warehouseLocation'), warehouseName)}
          {renderItemDetail(t('grn.creationDate'), getFormatedDate(createdAt))}
          {isDocumentGRN && (
            <div className="mt-6 mr-6">
              <Controller
                control={control}
                name="locationId"
                render={({ field: { onChange } }) => (
                  <FormElement
                    label={t('grn.locationTo')}
                    errorMessage={errors?.locationId?.message}
                  >
                    <SelectItem
                      placeholder={t('grn.selectLocation')}
                      showSearch
                      value={locationToId}
                      onChange={(e: string) => {
                        formHandler('locationId', e);
                        onChange(e);
                      }}
                      options={allParentLocations}
                      disabled={receivedAT ? true : false}
                      dataTestID={`${TEST_ID_KEY_GRN}ToLocation`}
                    />
                  </FormElement>
                )}
              />
            </div>
          )}
        </div>
        <div className="basis-[50%]">
          {renderItemDetail(t('grn.poRef'), `P${generateFormattedId(poId)}`)}
          {renderItemDetail(t('grn.sourceDoc'), getSourceDoc())}
          {renderItemDetail(t('grn.receivedDate'), getFormatedDate(receivedAT))}
        </div>
      </div>
      <div className="flex w-[50%]">
        <div
          className={`${
            isDocumentReturnOrReturnIn ? 'basis-[50%]' : 'my-6 basis-3/4'
          }`}
        >
          {/* Grn Attachments should only visible in the case of GRN */}
          {isDocumentGRN && !isGRNCancelled && (
            <GrnAttachments
              receiptId={grnId}
              documentType={RECEIPT_DOCUMENT_TYPE.RECEIPT}
            />
          )}
          {/* Render this component only in the case of Return or Return In */}
          {isDocumentReturnOrReturnIn && (
            <>
              {renderItemDetail(
                t('grn.locationFrom'),
                returnInId ? returnInLocation?.name : locationFromId
              )}
              <div className="mt-6">
                <Controller
                  control={control}
                  name="locationId"
                  render={({ field: { onChange } }) => (
                    <FormElement
                      label={t('grn.locationTo')}
                      errorMessage={errors?.locationId?.message}
                    >
                      <SelectItem
                        placeholder={t('grn.selectLocation')}
                        showSearch
                        value={locationToId}
                        onChange={(e: string) => {
                          formHandler('locationId', e);
                          onChange(e);
                        }}
                        options={allParentLocations}
                        disabled={receivedAT ? true : false}
                      />
                    </FormElement>
                  )}
                />
              </div>
            </>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
