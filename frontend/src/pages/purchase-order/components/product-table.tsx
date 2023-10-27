import { RemoveCircleOutlineOutlined } from '@mui/icons-material';
import { Button } from 'antd';
import debounce from 'lodash.debounce';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  EditableTable,
  InfoList,
  NumberInput,
  SearchSelect
} from 'src/components';
import { INITAIL_PAGINATION_DATA } from 'src/constants/common';
import {
  NEW_PO_PRODUCT_ROW,
  PO_TABLE_KEYS,
  READ_ONLY_STATES,
  TEST_ID_KEY_PO
} from 'src/constants/purchase-order';
import { useGetProductsForPO } from 'src/hooks';
import {
  getIsLocationSelected,
  getPOFilteredProducts,
  getProducts,
  getProductsLength,
  getProductTableInfoDataSourcePO
} from 'src/store/selectors/features/purchase-order';
import { updateProducts } from 'src/store/slices/entities/product';
import {
  setPOEditFlag,
  setRFQEditFlag,
  updatePOData
} from 'src/store/slices/features/purchase-order';
import { getPOProductCols, getReadOnlyPOProductCols } from '../columns';
import { handleProductCalculations } from '../helper';
import { PurchOrderFileUpload } from './product-upload';

const { SKU, QTY, PRC, MRP } = PO_TABLE_KEYS;

export const PurchOrderProductTable: React.FC<IProductTable> = ({
  locationId,
  disabled = false,
  poStatus,
  isLoading
}) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('po');

  const productData: any = useSelector(getProducts);
  const isLocationSelected = useSelector(getIsLocationSelected);
  const productsLength = useSelector(getProductsLength);
  const filteredProducts = useSelector(getPOFilteredProducts);
  const infoDataSource = useSelector(getProductTableInfoDataSourcePO);

  const [locationState, setLocationState] = useState<TNumberOrString>();

  const [productSKUorName, setProductSKUorName] = useState({
    sku: '',
    name: 'm'
  });

  const {
    isSuccess,
    isLoading: productsLoading,
    data: productPayload
  } = useGetProductsForPO({
    name: productSKUorName.name,
    sku: productSKUorName.sku,
    currentPage: INITAIL_PAGINATION_DATA.page || 1,
    pageSize: INITAIL_PAGINATION_DATA.take,
    locationId
  });

  useEffect(() => {
    if (isSuccess) dispatch(updateProducts(productPayload));
  }, [productPayload, isSuccess]);

  const updateProductDataInReducer = (updatedProducts: TArrayOfObjects) => {
    dispatch(updatePOData({ key: 'products', value: updatedProducts }));
    dispatch(
      READ_ONLY_STATES.includes(poStatus!)
        ? setPOEditFlag(true)
        : setRFQEditFlag(true)
    );
  };

  const handleAddRow = () => {
    const newData: IPOProducts = {
      ...NEW_PO_PRODUCT_ROW,
      key: productsLength + 1
    };

    updateProductDataInReducer([...productData, newData]);
  };

  useEffect(() => {
    if (!locationId) return;

    if (locationId && !locationState) {
      setLocationState(locationId);
      return;
    }

    if (locationState !== locationId) {
      updateProductDataInReducer([]);
      setLocationState(locationId);
    }
  }, [locationId]);

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
    const products = productPayload?.data;

    const index = products?.findIndex(
      (product: TObject) => value === product[dataIndex]
    );

    const item = products[index];

    newData[tableIndex] = NEW_PO_PRODUCT_ROW;

    const newObject = {
      ...newData[tableIndex],
      ...item
    };

    newData.splice(tableIndex, 1, newObject);

    updateProductDataInReducer([...newData]);
  };

  const handleFormInputChange = (
    index: number,
    key: string,
    value: TNumberOrString
  ) => {
    const products = [...productData];
    const updatedProduct = handleProductCalculations(products[index]);
    products.splice(index, 1, { ...updatedProduct, [key]: value });
    updateProductDataInReducer([...products]);
  };

  const handleProductNameSearch = (query: string) =>
    setProductSKUorName({ sku: '', name: query });

  const handleSKUNumberSearch = (query: string) =>
    setProductSKUorName({ name: '', sku: query });

  const debouncedProductName = debounce(handleProductNameSearch, 250);
  const debouncedSKUNumber = debounce(handleSKUNumberSearch, 250);

  const dropDownColumns: ITableColumn[] = [
    {
      title: `${t('po.skuCode')}`,
      dataIndex: SKU.CODE,
      key: SKU.CODE,
      width: '18%',
      fixed: 'left',
      render: (_, __, index) => (
        <SearchSelect
          dataTestID={`${TEST_ID_KEY_PO}ProductSKu`}
          data={filteredProducts as Array<TObject>}
          dataIndex={SKU.CODE}
          onChange={(value: any) =>
            handleDropDownChange(value, SKU.CODE, index as number)
          }
          handleSearch={debouncedSKUNumber}
          value={productData[index!]}
          disabled={isLocationSelected}
          loading={productsLoading}
        />
      )
    },
    {
      title: `${t('po.skuName')}`,
      dataIndex: SKU.NAME,
      key: SKU.NAME,
      width: '25%',
      render: (_, __, index) => (
        <SearchSelect
          dataTestID={`${TEST_ID_KEY_PO}ProductName`}
          data={filteredProducts as Array<TObject>}
          dataIndex={SKU.NAME}
          onChange={(value: any) =>
            handleDropDownChange(value, SKU.NAME, index as number)
          }
          handleSearch={debouncedProductName}
          value={productData[index!]}
          disabled={isLocationSelected}
          loading={productsLoading}
        />
      )
    },
    {
      title: `${t('po.qtyPerUnit')}`,
      dataIndex: QTY,
      key: QTY,
      width: '8%',
      render: (_, __, index) => (
        <NumberInput
          dataTestID={`${TEST_ID_KEY_PO}ProductQuantity`}
          value={productData[index!]?.quantity}
          precision={0}
          disabled={isLocationSelected}
          onChange={(value: string) =>
            handleFormInputChange(+index!, QTY, parseInt(value) || 0)
          }
        />
      )
    },
    {
      title: `${t('po.pricePerUnit')}`,
      dataIndex: PRC,
      key: PRC,
      width: '8%',
      render: (_, __, index) => (
        <NumberInput
          dataTestID={`${TEST_ID_KEY_PO}ProductPrice`}
          value={productData[index!]?.price}
          precision={4}
          disabled={isLocationSelected}
          onChange={(value: TNumberOrString) =>
            handleFormInputChange(+index!, PRC, Number(value).toFixed(4))
          }
        />
      )
    },
    {
      title: 'MRP',
      dataIndex: MRP,
      key: MRP,
      width: '8%',
      render: (_, __, index) => (
        <NumberInput
          dataTestID={`${TEST_ID_KEY_PO}ProductMRP`}
          value={productData[index!]?.mrp}
          precision={4}
          disabled={isLocationSelected}
          onChange={(value: TNumberOrString) =>
            handleFormInputChange(+index!, MRP, Number(value).toFixed(4))
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
            <Button
              data-test-id={`${TEST_ID_KEY_PO}ProductRemoveRowButton`}
              type="text"
              icon={<RemoveCircleOutlineOutlined />}
              onClick={() => handleDelete(record.key)}
            />
          </div>
        ) : null,
      editable: false,
      width: '3%',
      fixed: 'right'
    }
  ];

  const columns = getPOProductCols(t);

  const POProductColumns = READ_ONLY_STATES.includes(poStatus!, 1)
    ? getReadOnlyPOProductCols(t)
    : [...dropDownColumns, ...columns, ...action];

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-10">
        <span className="text-2xl font-bold">{t('po.addSKUs')}</span>
        {READ_ONLY_STATES.includes(poStatus!, 1) ? null : (
          <PurchOrderFileUpload />
        )}
      </div>
      <div>
        <EditableTable
          dataTestID={`${TEST_ID_KEY_PO}ProductTable`}
          dataSource={productData}
          disabled={disabled || isLocationSelected}
          tableColumns={POProductColumns}
          handleAddRow={handleAddRow}
          showAddRowButton={!READ_ONLY_STATES.includes(poStatus!, 1)}
          loading={isLoading}
          showInfoWindow={true}
          infoWindow={<InfoList data={infoDataSource} />}
        />
      </div>
    </div>
  );
};
