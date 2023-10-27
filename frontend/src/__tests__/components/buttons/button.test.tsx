import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ButtonPrimary } from 'src/components/button';

test('Button should be called ', () => {
  const handleClick = jest.fn();

  const { getByTestId } = render(
    <ButtonPrimary
      text="click me"
      onClick={handleClick}
      dataCy="primary-button"
    />
  );

  fireEvent.click(screen.getByText(/click me/i));
  expect(handleClick).toHaveBeenCalledTimes(1);
  expect(getByTestId('primary-button')).toHaveClass('bg-blue-blue2');
  expect(getByTestId('primary-button')).not.toHaveClass('bg-gray-grey15');
});

test('Button should have return expected values,disabled classess ', () => {
  const { getByTestId } = render(
    <ButtonPrimary text="click me" dataCy="primary-button" disabled />
  );

  expect(getByTestId('primary-button')).toBeDisabled();
  expect(getByTestId('primary-button')).toHaveClass('bg-gray-grey15');
  expect(getByTestId('primary-button')).not.toHaveClass('bg-blue-blue2');
});
