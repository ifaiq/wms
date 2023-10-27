import { generateFormattedId } from 'src/utils/format-ids';

test('It should formate id', () => {
  expect(generateFormattedId(1)).toBe('00001');
  expect(generateFormattedId(2)).not.toBe('2');
  expect(generateFormattedId(1, 7, '*')).toBe('******1');
  expect(generateFormattedId(1, 5, '*')).not.toBe('00001');
});
