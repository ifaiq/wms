import * as inputs from 'src/components/input';

test('should export input components', () => {
  expect(inputs.InputItem).toContainHTML;
  expect(inputs.InputSearch).toContainHTML;
  expect(inputs.MaskInput).toContainHTML;
  expect(inputs.TextArea).toContainHTML;
});
