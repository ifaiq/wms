import * as buttons from 'src/components/button';

test('should export input components', () => {
  expect(buttons.ButtonPrimary).toContainHTML;
  expect(buttons.IconButtonPrimary).toContainHTML;
  expect(buttons.ButtonSecondary).toContainHTML;
  expect(buttons.ButtonOutline).toContainHTML;
  expect(buttons.ButtonClear).toContainHTML;
  expect(buttons.ButtonLoading).toContainHTML;
  expect(buttons.ButtonIcon).toContainHTML;
});
