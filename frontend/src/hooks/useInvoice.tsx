import omit from 'lodash.omit';
import { useMutation, useQuery } from 'react-query';
import { InvoiceService } from 'src/services';

const invoiceService = new InvoiceService();

const useGetDraftInvoices = (
  params: Record<string, string | number | Array<string>>
) =>
  useQuery(
    ['draftInvoice', params],
    () => invoiceService.fetchDraftInvoices(params),
    { retry: false, refetchOnWindowFocus: false, keepPreviousData: true }
  );

const useGetApprovedInvoices = (
  params: Record<string, string | number | Array<string>>
) =>
  useQuery(
    ['approvedInvoice', params],
    () => invoiceService.fetchApprovedInvoices(params),
    { retry: false, refetchOnWindowFocus: false, keepPreviousData: true }
  );

const useApproveInvoice = () =>
  useMutation((data: ICreateInvoiceDto) => invoiceService.createInvoice(data));

const useGetInvoicePreview = (body: any) =>
  useQuery(
    ['previewInvoice', body],
    () => invoiceService.fetchInvoicePreview(body),
    { retry: false, refetchOnWindowFocus: false, keepPreviousData: true }
  );

const useCreateDraftInvoice = () =>
  useMutation((data: IDraftInvoice) => invoiceService.createDraftInvoice(data));

const useUpdateDraftInvoice = () =>
  useMutation((data: IUpdateDraftInvoice) => {
    const { id } = data;
    return invoiceService.updateDraftInvoice(omit(data, 'id'), id);
  });

const useDeleteDraftInvoice = () =>
  useMutation((id: string) => invoiceService.deleteDraftInvoice(id));

export {
  useGetDraftInvoices,
  useCreateDraftInvoice,
  useUpdateDraftInvoice,
  useDeleteDraftInvoice,
  useGetInvoicePreview,
  useGetApprovedInvoices,
  useApproveInvoice
};
