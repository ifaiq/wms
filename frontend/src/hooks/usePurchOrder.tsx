import { useMutation, useQuery } from 'react-query';
import { PurchOrderService, VendorService } from '../services';

const purchOrderService = new PurchOrderService();
const vendorService = new VendorService();

const useGetPOs = (params: Record<string, string | number | Array<string>>) =>
  useQuery(
    ['purchaseOrders', params],
    () => purchOrderService.fetchPOs(params),
    { retry: false, refetchOnWindowFocus: false, keepPreviousData: true }
  );

const useGetPOById = (id: string | number) =>
  useQuery(
    ['purchaseOrder', id],
    () => (!id ? null : purchOrderService.fetchPOById(id)),
    { retry: false, refetchOnWindowFocus: false }
  );

const useCreatePO = () =>
  useMutation((data: TObject) => purchOrderService.createPO(data));

const useUpdatePO = () =>
  useMutation((data: TObject) => purchOrderService.updatePO(data));

const useBulkUploadProducts = () =>
  useMutation((data: TDocsOrMultimedia) =>
    purchOrderService.bulkUploadProducts(data)
  );

const useBulkUploadPOs = () =>
  useMutation((data: TDocsOrMultimedia) =>
    purchOrderService.bulkUploadPurchaseOrders(data)
  );

const useAttachFile = () =>
  useMutation((data: TDocsOrMultimedia) => purchOrderService.attachFile(data));

const useDetachFile = () =>
  useMutation((data: TDocsOrMultimedia) => purchOrderService.detachFile(data));

const useGetBUsByCountry = (params: string) =>
  useQuery(
    ['countries', params],
    () =>
      params
        ? purchOrderService.fetchBusinessUnitsAgainstACountry(params)
        : false,
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false }
  );

const useGetWareHousesByBU = (params: number) =>
  useQuery(
    ['warehouses', params],
    () =>
      params
        ? purchOrderService.fetchLocationsAgainstABusinessUnit(params)
        : false,
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false }
  );

const useGetVendorsByCountry = (params: TObject) =>
  useQuery(
    ['po-vendor', params],
    () => (params.country ? vendorService.fetchVendors(params) : null),
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false }
  );

const useChangeStatus = () =>
  useMutation((data: TObject) => purchOrderService.changePOStatus(data));

const usePrintPO = () =>
  useMutation((id: string | number) => purchOrderService.printPO(id));

export {
  useGetPOs,
  useGetPOById,
  useCreatePO,
  useUpdatePO,
  useGetBUsByCountry,
  useGetWareHousesByBU,
  useBulkUploadProducts,
  useChangeStatus,
  useAttachFile,
  useDetachFile,
  usePrintPO,
  useGetVendorsByCountry,
  useBulkUploadPOs
};
