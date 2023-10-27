import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash.debounce';
import { RemoveCircleOutlineOutlined } from '@mui/icons-material';
import { SearchSelect } from 'src/components/search';
import { EditableTable } from 'src/components/table';
import { TransferFileUpload } from './file-upload';
import {
  getTransferProductCols,
  getReadOnlyTransferProductCols
} from './columns';
import { useGetProducts } from 'src/hooks';
import {
  updateTransferData,
  toggleIsEdit
} from 'src/store/slices/features/transfer';
import { updateProducts } from 'src/store/slices/entities/product';
import {
  getTransferProducts,
  getTransferProductsLength,
  getIsSubLocationSelected,
  getisTransferFinalised,
  getTransferFilteredProducts,
  getTransferWareHouseId,
  getIsReasonInitialCount,
  getTransferId
} from 'src/store/selectors/features/transfer';
import {
  INITIAL_PRODUCT_STATE,
  TEST_ID_KEY_TRANSFER
} from 'src/constants/transfers';
import { getSearchedProducts } from 'src/store/selectors/entities/product';
import { NumberInput } from 'src/components/input';

const skuCode = 'sku';
const skuName = 'name';

export const TransferProductTable: React.FC<ITransferProductTable> = ({
  subLocationId,
  disabled = false
}) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('transfer');

  const productData: any = useSelector(getTransferProducts);
  const warehouseId = useSelector(getTransferWareHouseId);
  const isSubLocationSelected = useSelector(getIsSubLocationSelected);
  const productsLength = useSelector(getTransferProductsLength);
  const isFinalState = useSelector(getisTransferFinalised);
  const filteredProducts = useSelector(getTransferFilteredProducts);
  const productsData = useSelector(getSearchedProducts) as any[];
  const transferId = useSelector(getTransferId);
  const isInitialCount = useSelector(getIsReasonInitialCount);

  const [locationState, setLocationState] = useState<TNumberOrString>();

  const [productSKUorName, setProductSKUorName] = useState({
    sku: '',
    name: 'm'
  });

  const {
    isLoading,
    isSuccess,
    data: productPayload
  } = useGetProducts({
    name: productSKUorName.name,
    sku: productSKUorName.sku,
    currentPage: 1,
    pageSize: 10,
    locationId: warehouseId,
    subLocationId
  });

  useEffect(() => {
    if (isSuccess && productPayload?.data?.length) {
      dispatch(updateProducts(productPayload));
    }
  }, [productPayload, isSuccess]);

  const updateProductDataInReducer = (updatedProducts: TArrayOfObjects) => {
    dispatch(updateTransferData({ key: 'products', value: updatedProducts }));
    dispatch(toggleIsEdit(true));
  };

  useEffect(() => {
    if (!transferId) updateProductDataInReducer([INITIAL_PRODUCT_STATE]);
  }, [isInitialCount]);

  const handleAddRow = () => {
    const newData: ITransferTable = {
      ...INITIAL_PRODUCT_STATE,
      key: productsLength + 1
    };

    updateProductDataInReducer([...productData, newData]);
  };

  useEffect(() => {
    if (!subLocationId) return;

    if (subLocationId && !locationState) {
      setLocationState(subLocationId);
      return;
    }

    if (locationState !== subLocationId) {
      updateProductDataInReducer([]);
      setLocationState(subLocationId);
    }
  }, [subLocationId]);

  const handleDelete = (key: React.Key) => {
    const updatedProducts = productData.filter(
      (item: TObject) => item.key !== key
    );

    updateProductDataInReducer(updatedProducts);
  };

  const handleDropDownChange = (
    value: string,
    dataIndex: string,
    tableIndex: number
  ) => {
    const newData = [...productData];

    const products = productsData;

    const index = products?.findIndex(
      (product: TObject) => value === product[dataIndex]
    );

    const item = products[index];

    newData[tableIndex] = INITIAL_PRODUCT_STATE;

    const newObject = {
      ...newData[tableIndex],
      ...item
    };

    newData.splice(tableIndex, 1, newObject);

    updateProductDataInReducer([...newData]);
  };

  const handleInputChange = (index: number, key: string, value: number) => {
    const products = [...productData];

    products.splice(index, 1, { ...products[index], [key]: value });
    updateProductDataInReducer([...products]);
  };

  const handleSKUNumberSearch = (query: string) =>
    setProductSKUorName({ name: '', sku: query });

  const handleProductNameSearch = (query: string) =>
    setProductSKUorName({ sku: '', name: query });

  const debouncedSkuNumber = debounce(handleSKUNumberSearch, 250);
  const debouncedProductName = debounce(handleProductNameSearch, 250);

  const dropDownColumns: ITableColumn[] = [
    {
      title: `${t('transfer.skuCode')}`,
      dataIndex: skuCode,
      key: skuCode,
      width: '15%',
      fixed: 'left',
      render: (_, __, index) => (
        <SearchSelect
          dataTestID={`${TEST_ID_KEY_TRANSFER}ProductSku`}
          data={filteredProducts as Array<TObject>}
          dataIndex={skuCode}
          onChange={(value: any) =>
            handleDropDownChange(value, skuCode, index as number)
          }
          handleSearch={debouncedSkuNumber}
          value={productData[index!]}
          disabled={!isSubLocationSelected}
          loading={isLoading}
        />
      )
    },
    {
      title: `${t('transfer.skuName')}`,
      dataIndex: skuName,
      key: skuName,
      width: '20%',
      render: (_, __, index) => (
        <SearchSelect
          dataTestID={`${TEST_ID_KEY_TRANSFER}ProductName`}
          data={filteredProducts as Array<TObject>}
          dataIndex={skuName}
          onChange={(value: any) =>
            handleDropDownChange(value, skuName, index as number)
          }
          handleSearch={debouncedProductName}
          value={productData[index!]}
          disabled={!isSubLocationSelected}
          loading={isLoading}
        />
      )
    }
  ];

  const editableColumns: ITableColumn[] = [
    {
      title: `${t('transfer.transferStock')}`,
      dataIndex: 'transferQuantity',
      key: 'transferQuantity',
      width: '10%',
      render: (_, __, index) => (
        <NumberInput
          dataTestID={`${TEST_ID_KEY_TRANSFER}ProductActualQunatity`}
          size="middle"
          value={productData[index!]?.transferQuantity}
          disabled={!isSubLocationSelected}
          onChange={(value: string) =>
            handleInputChange(+index!, 'transferQuantity', parseInt(value) || 0)
          }
        />
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
            <RemoveCircleOutlineOutlined
              className="cursor-pointer"
              onClick={() => handleDelete(record.key)}
            />
          </div>
        ) : null,
      editable: false,
      width: '4%',
      fixed: 'right'
    }
  ];

  const columns = getTransferProductCols(t);

  const transferProductColumns = isFinalState
    ? getReadOnlyTransferProductCols(t)
    : [...dropDownColumns, ...columns, ...editableColumns, ...action];

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-10">
        <span className="text-2xl font-bold">{t('transfer.addSKUs')}</span>
        {!isFinalState && <TransferFileUpload />}
      </div>
      <div>
        <EditableTable
          dataSource={productData}
          disabled={disabled || !isSubLocationSelected}
          tableColumns={transferProductColumns}
          handleAddRow={handleAddRow}
          showAddRowButton={!isFinalState}
          dataTestID={`${TEST_ID_KEY_TRANSFER}ProductTable`}
        />
      </div>
    </div>
  );
};
