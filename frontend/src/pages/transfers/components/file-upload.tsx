import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { UploadButton } from 'src/components/upload';
import { FileUploadOutlined } from '@mui/icons-material';
import { FILE_TYPE } from 'src/constants/upload-component';
import { ErrorModal } from 'src/components/modal';
import { useBulkUploadTransferProducts } from 'src/hooks';
import {
  toggleIsEdit,
  updateTransferData
} from 'src/store/slices/features/transfer';
import {
  getTransferFromLocationId,
  getTransferProductsLength,
  getIsSubLocationSelected,
  getTransferWareHouseId
} from 'src/store/selectors/features/transfer';
import { ErrorArrayHandler, getFormData } from 'src/utils/upload-helpers';
import { TEST_ID_KEY_TRANSFER } from 'src/constants/transfers';

export const TransferFileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation('transfer');

  const [errorList, setErrorList] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const warehouseId = useSelector(getTransferWareHouseId);
  const locationId = useSelector(getTransferFromLocationId);
  const isSubLocationSelected = useSelector(getIsSubLocationSelected);
  const productsLength = useSelector(getTransferProductsLength);

  const uploadMutation = useBulkUploadTransferProducts();

  const updateProductDataInReducer = (updatedProducts: TArrayOfObjects) => {
    dispatch(updateTransferData({ key: 'products', value: updatedProducts }));
    dispatch(toggleIsEdit(true));
  };

  const bulkUploadProducts = async (file: TDocsOrMultimedia) => {
    const data: IBulkUploadProducts = {
      name: 'transfer-form',
      file,
      warehouseId,
      locationId
    };

    try {
      const formData = getFormData(data);

      const res = await uploadMutation.mutateAsync(formData);

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
        text={t('transfer.uploadCSVFile')}
        icon={<FileUploadOutlined />}
        allowedFileType={FILE_TYPE.CSV}
        handleUpload={bulkUploadProducts}
        disabled={!isSubLocationSelected}
        onRemove={handleRemove}
        className={'text-[#6ACC74]'}
        resetFileList={productsLength === 0}
        dataTestID={`${TEST_ID_KEY_TRANSFER}UploadCSV`}
      />
      <ErrorModal
        title="Error(s) found while uploading Transfer CSV!"
        visible={showErrorModal}
        onConfirm={toggleShowErrorModal}
        errorList={errorList}
      />
    </>
  );
};
