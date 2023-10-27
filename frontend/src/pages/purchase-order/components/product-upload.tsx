import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FileUploadOutlined } from '@mui/icons-material';
import { ErrorModal } from 'src/components/modal';
import { UploadButton } from 'src/components/upload';
import { READ_ONLY_STATES, TEST_ID_KEY_PO } from 'src/constants/purchase-order';
import { FILE_TYPE } from 'src/constants/upload-component';
import { useBulkUploadProducts } from 'src/hooks';
import {
  getIsLocationSelected,
  getPOLocationId,
  getPOStatus,
  getProductsLength
} from 'src/store/selectors/features/purchase-order';
import {
  setPOEditFlag,
  setRFQEditFlag,
  updatePOData
} from 'src/store/slices/features/purchase-order';
import { getFormData } from 'src/utils/upload-helpers';
import { ErrorArrayHandler } from '../../../utils/error-handlers';

export const PurchOrderFileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation('po');

  const [errorList, setErrorList] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const locationId = useSelector(getPOLocationId);
  const isLocationSelected = useSelector(getIsLocationSelected);
  const productsLength = useSelector(getProductsLength);
  const poStatus = useSelector(getPOStatus);

  const { mutateAsync: uploadProductCSV } = useBulkUploadProducts();

  const updateProductDataInReducer = (updatedProducts: TArrayOfObjects) => {
    dispatch(updatePOData({ key: 'products', value: updatedProducts }));
    dispatch(
      READ_ONLY_STATES.includes(poStatus)
        ? setPOEditFlag(true)
        : setRFQEditFlag(true)
    );
  };

  const bulkUploadProducts = async (file: TDocsOrMultimedia) => {
    const data: IBulkUploadProducts = {
      name: 'po-form',
      file,
      locationId
    };

    const formData = getFormData(data);

    try {
      const res = await uploadProductCSV(formData);

      updateProductDataInReducer(res?.data.validProducts);
    } catch (error: TObject) {
      setErrorList(ErrorArrayHandler(error));
      setShowErrorModal(true);
      throw new Error(
        error?.message || error?.data?.reason || error?.data?.message
      );
    }
  };

  const handleRemove = () => updateProductDataInReducer([]);

  const toggleShowErrorModal = () => setShowErrorModal(false);

  return (
    <>
      <UploadButton
        dataTestID={`${TEST_ID_KEY_PO}ProductUploadCsv`}
        text={t('po.uploadCSVFile')}
        icon={<FileUploadOutlined />}
        allowedFileType={FILE_TYPE.CSV}
        handleUpload={bulkUploadProducts}
        disabled={isLocationSelected}
        onRemove={handleRemove}
        className={'text-[#6ACC74]'}
        resetFileList={productsLength === 0}
      />
      <ErrorModal
        title="Error(s) found while uploading PurchaseOrder CSV!"
        visible={showErrorModal}
        onConfirm={toggleShowErrorModal}
        errorList={errorList}
      />
    </>
  );
};
