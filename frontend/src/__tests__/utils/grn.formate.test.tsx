import { getGrnorReturnFormate } from 'src/utils/grn-formate';

test('It should formate grn ids', () => {
  expect(getGrnorReturnFormate(1, 1)).toBe('OUT/00001');
  expect(getGrnorReturnFormate(2, 1)).not.toBe('OUT/00001');
  expect(getGrnorReturnFormate(1, 0)).toBe('IN/00001');
  expect(getGrnorReturnFormate(1, 0)).not.toBe('OUT/00001');
});
