import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../../components/topbar';
import { BreadCrumbs } from 'src/components/breadcrumb';
import { useParams } from 'react-router-dom';
import { GrnProductsTable } from './components/grn-products-table';
import { ReturnInfo } from './components/return-info';
import { GrnStatuses } from './components/grn-statuses-steps';
import { ConfirmGrn } from './components/confirm-grn';
import { PrintGrn } from './components/print-grn';
import { CancelGrn } from './components/cancel-grn';
import { SaveGrn } from './components/save-grn';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCanReturnFlag,
  getGRNIsEdit,
  getGRNISReadyStatus,
  getGRNPoId,
  getGRNStatus,
  getIsCancelReturnAllowed,
  getIsConfirmReturnAllowed,
  getIsEditReturnAllowed,
  getIsGrnStatusCancelled,
  getReturnReqPayload
} from 'src/store/selectors/features/grn';
import {
  addGRNData,
  resetGRNData,
  updateGRNEditMode
} from 'src/store/slices/features/grn';
import { OverlayLoader } from 'src/components/loader';
import {
  useGetReturnGrnByReceiptId,
  useReturnGRN,
  useResetState
} from 'src/hooks';
import { getGrnorReturnFormate } from 'src/utils/grn-formate';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import { ReturnGrnReason } from './components/select-return-reason';
import { getGRNBreadCrumb } from 'src/constants/grn';
import { useForm } from 'react-hook-form';
import { ReturnGrn } from './components/return-grn';

export const Return: React.FC = () => {
  const [t] = useTranslation('grn');
  const dispatch = useDispatch();
  const { id } = useParams<RouteParams>();
  const isEditGRN: boolean = useSelector(getGRNIsEdit);
  const status = useSelector(getGRNStatus);
  const returnReqPayload: TObject = useSelector(getReturnReqPayload);
  const isGRNCancelled: boolean = useSelector(getIsGrnStatusCancelled);
  const isReadyStatus = useSelector(getGRNISReadyStatus);
  const poId = useSelector(getGRNPoId);
  const isCancelReturn = useSelector(getIsCancelReturnAllowed);
  const isEditReturn = useSelector(getIsEditReturnAllowed);
  const isConfirmReturn = useSelector(getIsConfirmReturnAllowed);
  const canReturn: boolean = useSelector(getCanReturnFlag);

  useResetState(resetGRNData);

  const { isLoading, data, refetch } = useGetReturnGrnByReceiptId(id);
  const { isSuccess, isError, error, mutateAsync: returnGRN } = useReturnGRN();

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
    returnGRN(returnReqPayload);
    enableGRNEditMode(false);
  };

  return (
    <>
      {isLoading && <OverlayLoader />}
      <TopBar title={`${t('grn.return')}`} search={false} />
      <div className="mx-14 flex justify-between">
        <BreadCrumbs routesArray={getGRNBreadCrumb(poId, id, 1)} />
        <GrnStatuses id={status} />
      </div>
      <div className="flex ml-14 mr-16 mt-6 pb-4 justify-between border-b-[1px] border-gray-grey12">
        <div>
          <h3 className="text-xl">{getGrnorReturnFormate(id, 1)}</h3>
          <h3 className="text-xl"></h3>
        </div>
        {!isGRNCancelled && (
          <div className="flex">
            <div className="mr-2">
              <PrintGrn text={`${t('grn.print')}`} id={id} isReturn={true} />
            </div>
            {isReadyStatus && (
              <div>
                <ConfirmGrn
                  id={id}
                  disabled={isEditGRN ? true : false}
                  refetch={refetch}
                  isReturn
                  text={`${t('grn.confirm')}`}
                />
              </div>
            )}
            {!isReadyStatus && isConfirmReturn && (
              <div>
                <ReturnGrn
                  id={id}
                  text={`${t('grn.return')}`}
                  refetch={() => null}
                  disabled={canReturn}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ReturnInfo props={{ control, errors, setValue }}>
        <ReturnGrnReason disabled={!isReadyStatus} />
      </ReturnInfo>

      <div className="mx-14 my-6">
        <h3 className="mb-4 text-xl items-center flex">
          {t('grn.verifySku')}
          <span className="text-lg">{t('grn.s')}</span>
        </h3>
        <GrnProductsTable
          status={status}
          allowEdit={isReadyStatus}
          returnGrnActive
        />
        {!isGRNCancelled && (
          <div className="flex justify-end">
            <div
              className={`flex ${
                isEditReturn && isCancelReturn
                  ? 'justify-between'
                  : 'justify-end'
              } my-4`}
            >
              {isCancelReturn && isReadyStatus && (
                <CancelGrn
                  text={`${t('grn.cancel')}`}
                  disabled={isGRNCancelled}
                  id={id}
                  isReturn
                  refetch={refetch}
                />
              )}
              {isEditReturn && (
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
