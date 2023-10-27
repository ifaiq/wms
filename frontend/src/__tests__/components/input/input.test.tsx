import React from 'react';
import { render } from '@testing-library/react';
import { InputItem } from 'src/components/input';

test('should render input item', () => {
  render(<InputItem />);
});

test('Input item should be disabled', () => {
  const { getByTestId } = render(
    <InputItem value={'1'} size="large" placeholder="Type" disabled />
  );

  expect(getByTestId('input-item')).toBeDisabled();
});

test('Input item should return expected props', () => {
  const { getByTestId } = render(
    <InputItem value={'1'} size="large" placeholder="Type" />
  );

  expect(getByTestId('input-item').getAttribute('placeholder')).toBe('Type');
  expect(getByTestId('input-item').getAttribute('value')).toBe('1');
  expect(getByTestId('input-item')).toHaveDisplayValue('1');
});
