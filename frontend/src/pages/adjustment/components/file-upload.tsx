import { FileUploadOutlined } from '@mui/icons-material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorModal } from 'src/components/modal';
import { UploadButton } from 'src/components/upload';
import { TEST_ID_KEY_ADJUST } from 'src/constants/adjustment';
import { FILE_TYPE } from 'src/constants/upload-component';
import { useBulkUploadAdjustProducts } from 'src/hooks';
import {
  getAdjustWarehouseId,
  getAdjustProductsLength,
  getAdjustReason,
  getIsProductsEditAllowed,
  getAdjustLocationId
} from 'src/store/selectors/features/adjustment';
import {
  toggleIsEdit,
  updateAdjustmentData
} from 'src/store/slices/features/adjustment';
import { getFormData } from 'src/utils/upload-helpers';
import { ErrorArrayHandler } from '../../../utils/error-handlers';

export const AdjustFileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation('adjust');

  const [errorList, setErrorList] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const warehouseId = useSelector(getAdjustWarehouseId);
  const subLocationId = useSelector(getAdjustLocationId);
  const isProductEditAllowed = useSelector(getIsProductsEditAllowed);
  const productsLength = useSelector(getAdjustProductsLength);
  const reason = useSelector(getAdjustReason);

  const { mutateAsync: uploadProductCSV } = useBulkUploadAdjustProducts();

  const updateProductDataInReducer = (updatedProducts: TArrayOfObjects) => {
    dispatch(updateAdjustmentData({ key: 'products', value: updatedProducts }));
    dispatch(toggleIsEdit(true));
  };

  const bulkUploadProducts = async (file: TDocsOrMultimedia) => {
    const data: IAdjustBulkUploadProducts = {
      name: 'adjust-form',
      file,
      warehouseId,
      subLocationId,
      reason
    };

    const formData = getFormData(data);

    try {
      const res = await uploadProductCSV(formData);

      updateProductDataInReducer(res?.data);
    } catch (error: TObject) {
      setErrorList(ErrorArrayHandler(error));
      setShowErrorModal(true);
      throw new Error(error?.message || error?.data?.reason);
    }
  };

  const handleRemove = () => updateProductDataInReducer([]);

  return (
    <>
      <UploadButton
        text={t('adjust.uploadCSVFile')}
        icon={<FileUploadOutlined />}
        allowedFileType={FILE_TYPE.CSV}
        handleUpload={bulkUploadProducts}
        disabled={!isProductEditAllowed}
        onRemove={handleRemove}
        className={'text-[#6ACC74]'}
        resetFileList={productsLength === 0}
        dataTestID={`${TEST_ID_KEY_ADJUST}UploadCSV`}
      />
      <ErrorModal
        title="Error(s) found while uploading adjustment CSV!"
        visible={showErrorModal}
        onConfirm={() => setShowErrorModal(false)}
        errorList={errorList}
      />
    </>
  );
};
