import { useMutation, useQuery } from 'react-query';
import { VendorService } from '../services';
import omit from 'lodash.omit';

const vendorService = new VendorService();

const useGetVendors = (params: TObject) =>
  useQuery(['vendors', params], () => vendorService.fetchVendors(params), {
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

const useGetVendorById = (id: string | number) =>
  useQuery(
    ['vendor', id],
    () => (!id || id === 'create' ? null : vendorService.fetchVendorById(id)),
    { retry: false, refetchOnWindowFocus: false }
  );

const useCreateVendors = () =>
  useMutation((data: IVendor) => vendorService.createVendor(data));

const useUpdateVendors = () =>
  useMutation((data: IVendor) => {
    const { id } = data;

    return vendorService.updateVendor(omit(data, 'id'), id);
  });

const useAttachVendorFile = () =>
  useMutation((data: TDocsOrMultimedia) => vendorService.uploadFile(data));

const useDetachVendorFile = () =>
  useMutation((data: TDocsOrMultimedia) => vendorService.removeFile(data));

const useFetchTaxGroups = () =>
  useQuery(['taxGroups'], () => vendorService.fetchTaxGroups(), {
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

const useCreateVendorTaxGroup = () =>
  useMutation((data: IVendorTaxGroup) =>
    vendorService.createVendorTaxGroup(data)
  );

const useFetchTaxGroupByVendorId = (id: number) =>
  useQuery(
    ['vendorTaxGroupById', id],
    () => (id ? vendorService.fetchTaxGroupByVendorId(id) : null),
    { retry: false, refetchOnWindowFocus: false }
  );

const useFetchTaxCodeByGroupId = (id: string) =>
  useQuery(
    ['vendorTaxCodeByGroupId', id],
    () => (id ? vendorService.fetchTaxCodeByGroupId(id) : null),
    { retry: false, refetchOnWindowFocus: false }
  );

const useChangeVendorStatus = () =>
  useMutation((params: IVendorStatus) =>
    vendorService.changeVendorStatus(params)
  );

export {
  useGetVendors,
  useGetVendorById,
  useCreateVendors,
  useUpdateVendors,
  useAttachVendorFile,
  useDetachVendorFile,
  useChangeVendorStatus,
  useFetchTaxGroups,
  useCreateVendorTaxGroup,
  useFetchTaxGroupByVendorId,
  useFetchTaxCodeByGroupId
};
