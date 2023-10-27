import { RemoveCircleOutlineOutlined } from '@mui/icons-material';
import debounce from 'lodash.debounce';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NumberInput } from 'src/components/input';
import { SearchSelect } from 'src/components/search';
import { EditableTable } from 'src/components/table';
import {
  INITIAL_PRODUCT_STATE,
  TEST_ID_KEY_ADJUST
} from 'src/constants/adjustment';
import { useGetProducts } from 'src/hooks';
import {
  getAdjustmentFilteredProducts,
  getAdjustmentId,
  getAdjustmentProducts,
  getAdjustProductsLength,
  getAdjustWarehouseId,
  getisAdjustFinalised,
  getIsProductsEditAllowed,
  getIsReasonInitialCount
} from 'src/store/selectors/features/adjustment';
import { updateProducts } from 'src/store/slices/entities/product';
import {
  toggleIsEdit,
  updateAdjustmentData
} from 'src/store/slices/features/adjustment';
import {
  getAdjustmentProductCols,
  getReadOnlyAdjustProductCols
} from './columns';
import { AdjustFileUpload } from './file-upload';

const skuCode = 'sku';
const skuName = 'name';

export const AdjustmentProductTable: React.FC<IAdjustProductTable> = ({
  subLocationId,
  disabled = false
}) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('adjust');

  const adjustId = useSelector(getAdjustmentId);
  const warehouseId = useSelector(getAdjustWarehouseId);
  const productData: any = useSelector(getAdjustmentProducts);
  const productsLength = useSelector(getAdjustProductsLength);
  const isFinalState = useSelector(getisAdjustFinalised);
  const filteredProducts = useSelector(getAdjustmentFilteredProducts);
  const isInitialCount = useSelector(getIsReasonInitialCount);
  const isProductEditAllowed = useSelector(getIsProductsEditAllowed);

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
    subLocationId,
    isInitialCount
  });

  useEffect(() => {
    if (isSuccess) dispatch(updateProducts(productPayload));
  }, [productPayload, isSuccess]);

  const updateProductDataInReducer = (updatedProducts: TArrayOfObjects) => {
    dispatch(updateAdjustmentData({ key: 'products', value: updatedProducts }));
    dispatch(toggleIsEdit(true));
  };

  const handleAddRow = () => {
    const newData: IAdjustmentTable = {
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

  // If reason is changing from or to initial count reset the product table
  useEffect(() => {
    if (!adjustId) updateProductDataInReducer([INITIAL_PRODUCT_STATE]);
  }, [isInitialCount]);

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
    const products = productPayload.data;

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

  const handleDifferenceQuantity = (
    index: number,
    key: string,
    value: number
  ) => {
    const products = [...productData];

    const differenceQuantity = value - products[index].currentQuantity;
    products.splice(index, 1, {
      ...products[index],
      actualQuantity: value,
      [key]: differenceQuantity
    });
    updateProductDataInReducer([...products]);
  };

  const handleActualQuantity = (index: number, key: string, value: number) => {
    const products = [...productData];

    const actualQuantity = Math.round(products[index].currentQuantity) + value;
    products.splice(index, 1, {
      ...products[index],
      [key]: actualQuantity,
      differenceQuantity: value
    });
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
      title: `${t('adjust.skuCode')}`,
      dataIndex: skuCode,
      key: skuCode,
      width: '15%',
      fixed: 'left',
      render: (_, __, index) => (
        <SearchSelect
          data={filteredProducts as Array<TObject>}
          dataIndex={skuCode}
          onChange={(value: any) =>
            handleDropDownChange(value, skuCode, index as number)
          }
          handleSearch={debouncedSkuNumber}
          value={productData[index!]}
          disabled={!isProductEditAllowed}
          loading={isLoading}
        />
      )
    },
    {
      title: `${t('adjust.skuName')}`,
      dataIndex: skuName,
      key: skuName,
      width: '20%',
      render: (_, __, index) => (
        <SearchSelect
          data={filteredProducts as Array<TObject>}
          dataIndex={skuName}
          onChange={(value: any) =>
            handleDropDownChange(value, skuName, index as number)
          }
          handleSearch={debouncedProductName}
          value={productData[index!]}
          disabled={!isProductEditAllowed}
          loading={isLoading}
        />
      )
    }
  ];

  const editableColumns: ITableColumn[] = [
    {
      title: `${t('adjust.totalQty')}`,
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: '10%',
      render: (_, __, index) => {
        // Actual quantity is required for Initial Count
        if (isProductEditAllowed && !isInitialCount)
          return productData[index!]?.actualQuantity;

        return (
          <NumberInput
            dataTestID={`${TEST_ID_KEY_ADJUST}ProductActualQunatity`}
            value={productData[index!]?.actualQuantity}
            disabled={isProductEditAllowed && !isInitialCount}
            onChange={(value: string) =>
              handleDifferenceQuantity(
                +index!,
                'differenceQuantity',
                parseInt(value) || 0
              )
            }
          />
        );
      }
    },
    {
      title: `${t('adjust.quantityDiff')}`,
      dataIndex: 'differenceQuantity',
      key: 'differenceQuantity',
      width: '10%',
      render: (_, record, index) => {
        if (isProductEditAllowed && isInitialCount)
          return productData[index!]?.differenceQuantity;

        return (
          <NumberInput
            dataTestID={`${TEST_ID_KEY_ADJUST}ProductDifferenceQunatity`}
            value={productData[index!]?.differenceQuantity}
            disabled={isProductEditAllowed && isInitialCount}
            minValue={-record?.currentQuantity}
            onChange={(value: string) =>
              handleActualQuantity(
                +index!,
                'actualQuantity',
                parseInt(value) || 0
              )
            }
          />
        );
      }
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

  const columns = getAdjustmentProductCols(t);

  const adjustmentProductColumns = isFinalState
    ? getReadOnlyAdjustProductCols(t)
    : [...dropDownColumns, ...columns, ...editableColumns, ...action];

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-10">
        <span className="text-2xl font-bold">{t('adjust.addSKUs')}</span>
        {!isFinalState && <AdjustFileUpload />}
      </div>
      <div>
        <EditableTable
          dataSource={productData}
          disabled={disabled || !isProductEditAllowed}
          tableColumns={adjustmentProductColumns}
          handleAddRow={handleAddRow}
          showAddRowButton={!isFinalState}
          dataTestID={`${TEST_ID_KEY_ADJUST}ProductTable`}
        />
      </div>
    </div>
  );
};
