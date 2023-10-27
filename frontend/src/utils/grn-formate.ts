import { generateFormattedId } from './format-ids';

export const getGrnorReturnFormate = (
  id: string | number | undefined,
  receiptId: number | null
) => `${receiptId ? 'OUT' : 'IN'}/${generateFormattedId(id!)}`;
