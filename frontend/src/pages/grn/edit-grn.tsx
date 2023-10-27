import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../../components/topbar';
import { BreadCrumbs } from 'src/components/breadcrumb';
import { useParams } from 'react-router-dom';
import { GrnProductsTable } from './components/grn-products-table';
import { GrnInfo } from './components/grn-info';
import { GrnStatuses } from './components/grn-statuses-steps';
import { ConfirmGrn } from './components/confirm-grn';
import { PrintGrn } from './components/print-grn';
import { CancelGrn } from './components/cancel-grn';
import { SaveGrn } from './components/save-grn';
import { ReturnGrn } from './components/return-grn';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllowCreateReturn,
  getGRNIsEdit,
  getGRNISReadyStatus,
  getGRNStatus,
  getIsGrnStatusCancelled,
  getSaveGRNReqPayload,
  getGRNPoId,
  getCanReturnFlag,
  getIsEditGrnAllowed,
  getIsCancelGrnAllowed,
  getIsConfirmGrnAllowed,
  getIsCreateReturnAllowed,
  getReturnInRefId,
  getLocationToId
} from 'src/store/selectors/features/grn';
import {
  addGRNData,
  resetGRNData,
  updateGRNEditMode
} from 'src/store/slices/features/grn';
import { OverlayLoader } from 'src/components/loader';
import { useGetGrnByReceiptId, useUpdateGRN, useResetState } from 'src/hooks';
import { getGrnorReturnFormate } from 'src/utils/grn-formate';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import { getGRNBreadCrumb } from 'src/constants/grn';
import { useForm } from 'react-hook-form';
import { ReturnGrnReason } from './components/select-return-reason';

export const EditGRN: React.FC = () => {
  const [t] = useTranslation('grn');
  const dispatch = useDispatch();
  const { id } = useParams<RouteParams>();
  const payloadToUpdateProducts: TObject = useSelector(getSaveGRNReqPayload);
  const isEditGRN: boolean = useSelector(getGRNIsEdit);
  const isAllowCreateReturn: boolean = useSelector(getAllowCreateReturn);
  const canReturn: boolean = useSelector(getCanReturnFlag);
  const status = useSelector(getGRNStatus);
  const isGRNCancelled: boolean = useSelector(getIsGrnStatusCancelled);
  const isReadyStatus = useSelector(getGRNISReadyStatus);
  const poId = useSelector(getGRNPoId);
  const isCancelGrn = useSelector(getIsCancelGrnAllowed);
  const isEditGrn = useSelector(getIsEditGrnAllowed);
  const isConfirmGrn = useSelector(getIsConfirmGrnAllowed);
  const isCreateReturn = useSelector(getIsCreateReturnAllowed);
  const returnInId = useSelector(getReturnInRefId);

  useResetState(resetGRNData);
  const { isLoading, data, refetch } = useGetGrnByReceiptId(id);
  const { isSuccess, isError, error, mutateAsync: updateGRN } = useUpdateGRN();
  const locationToId = useSelector(getLocationToId);

  const {
    control,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (data) {
      dispatch(addGRNData(data?.data));
    }
  }, [data?.data]);

  useEffect(() => {
    if (isError) {
      const errorData = error as Record<string, any>;
      showErrorMessage(errorData?.statusText);
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      showSuccessMessage();
    }
  }, [isSuccess]);

  const enableGRNEditMode = (mode: boolean) =>
    dispatch(updateGRNEditMode(mode));

  const saveGrn = () => {
    if (!locationToId) {
      showErrorMessage('Please select a location before saving Receipt');
      return;
    }

    payloadToUpdateProducts.id = id;
    updateGRN(payloadToUpdateProducts);
    enableGRNEditMode(false);
  };

  return (
    <>
      {isLoading && <OverlayLoader />}
      <TopBar
        title={returnInId ? t('grn.returnIn') : t('grn.title')}
        search={false}
      />
      <div className="mx-14 flex justify-between">
        <BreadCrumbs routesArray={getGRNBreadCrumb(poId, id, 0)} />
        <GrnStatuses id={status} />
      </div>
      <div className="flex ml-14 mr-16 mt-6 pb-4 justify-between border-b-[1px] border-gray-grey12">
        <h3 className="text-xl font-semibold">
          {getGrnorReturnFormate(id, 0)}
        </h3>
        {!isGRNCancelled && (
          <div className="flex">
            <div className="mr-2">
              <PrintGrn id={id} text={`${t('grn.print')}`} />
            </div>
            <div>
              {isAllowCreateReturn
                ? isCreateReturn && (
                    <ReturnGrn
                      id={id}
                      text={`${t('grn.return')}`}
                      refetch={() => null}
                      disabled={!canReturn}
                    />
                  )
                : isConfirmGrn && (
                    <ConfirmGrn
                      id={id}
                      isReturn={false}
                      disabled={isEditGRN}
                      refetch={refetch}
                      text={`${t('grn.confirm')}`}
                    />
                  )}
            </div>
          </div>
        )}
      </div>

      <GrnInfo props={{ control, errors, setValue }}>
        {returnInId && (
          <ReturnGrnReason disabled={isReadyStatus ? false : true} />
        )}
      </GrnInfo>

      <div className="mx-14 my-6">
        <h3 className="mb-4 text-xl font-semibold items-center flex">
          {t('grn.verifySku')}
          <span className="text-lg">{t('grn.s')}</span>
        </h3>
        <GrnProductsTable
          status={status}
          allowEdit={!isReadyStatus ? false : true}
          returnGrnActive={false}
        />
        {!isGRNCancelled && (
          <div className="flex justify-end">
            <div
              className={`flex ${
                isEditGrn && isCancelGrn ? 'justify-between' : 'justify-end'
              } my-4`}
            >
              {isCancelGrn && isReadyStatus && (
                <CancelGrn
                  text={`${t('grn.cancel')}`}
                  isReturn={false}
                  disabled={!isReadyStatus || isGRNCancelled ? true : false}
                  id={id}
                  refetch={refetch}
                />
              )}
              {isEditGrn && (
                <SaveGrn
                  text={`${t('grn.saveInfo')}`}
                  disabled={!isEditGRN}
                  onClick={saveGrn}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
