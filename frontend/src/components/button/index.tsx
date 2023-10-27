import React from 'react';

const getWidthHeightClassNames = (size = 'medium') => {
  let widthHeightClassname;

  if (size === 'small') widthHeightClassname = 'w-32 h-12';
  if (size === 'medium') widthHeightClassname = 'w-40 h-12';
  if (size === 'large') widthHeightClassname = 'w-48 h-12';
  if (size === 'full') widthHeightClassname = 'w-[100%] h-12';
  if (size === 'auto') widthHeightClassname = 'w-auto px-6 h-11';

  return widthHeightClassname;
};

export const ButtonPrimary: React.FC<IActionButton> = ({
  dataCy,
  onClick,
  text,
  size = 'medium',
  minWidthClass = 'min-w-[100px]',
  disabled,
  style,
  dataTestID,
  isLoading = false
}) => (
  <button
    data-test-id={dataTestID}
    data-testid={dataCy}
    data-cy={dataCy}
    style={style}
    disabled={disabled || isLoading}
    className={`${disabled === true ? 'bg-gray-grey15' : 'bg-blue-blue2'} 
        font-semibold text-white rounded-lg text-sm	${minWidthClass} ${getWidthHeightClassNames(
      size
    )} mx-1`}
    onClick={onClick}
    onDoubleClick={() => null}
  >
    {text}
  </button>
);

export const IconButtonPrimary: React.FC<IActionButton> = ({
  dataCy,
  onClick,
  text,
  size = 'medium',
  minWidthClass = 'min-w-[150px]',
  disabled,
  style,
  icon,
  dataTestID
}) => (
  <button
    data-test-id={dataTestID}
    data-cy={dataCy}
    disabled={disabled}
    className={`flex justify-center font-semibold items-center 
    ${
      disabled === true ? 'bg-gray-grey15' : 'bg-blue-blue2'
    } text-white rounded-lg text-sm	
            ${getWidthHeightClassNames(size)}  ${minWidthClass} mx-1`}
    onClick={onClick}
    style={style}
    onDoubleClick={() => null}
  >
    {icon && icon}
    {text}
  </button>
);

export const ButtonSecondary: React.FC<IActionButton> = ({
  dataCy,
  onClick,
  text,
  size = 'medium',
  style,
  dataTestID
}) => (
  <button
    data-test-id={dataTestID}
    data-cy={dataCy}
    className={`bg-blue-blue1 font-semibold text-white rounded-lg text-sm
    	min-w-[100px] ${getWidthHeightClassNames(size)}`}
    onClick={onClick}
    style={style}
    onDoubleClick={() => null}
  >
    {' '}
    {text}
  </button>
);

export const ButtonOutline: React.FC<IActionButton> = ({
  dataCy,
  onClick,
  text,
  type = 'button',
  size = 'medium',
  style,
  disabled,
  dataTestID
}) => (
  <button
    data-test-id={dataTestID}
    data-cy={dataCy}
    type={type}
    style={style}
    className={`bg-transparent font-semibold border-[1px] 
      ${disabled ? 'border-[#bdbdbd]' : 'border-blue-blue2'} text-blue-blue2 
      ${getWidthHeightClassNames(size)} min-w-[100px] rounded-lg text-sm`}
    onClick={onClick}
    disabled={disabled}
    onDoubleClick={() => null}
  >
    {' '}
    {text}
  </button>
);

export const ButtonClear: React.FC<IActionButton> = ({
  dataCy,
  onClick,
  text,
  size = 'medium',
  style,
  dataTestID
}) => (
  <button
    data-test-id={dataTestID}
    data-cy={dataCy}
    className={`bg-transparent font-semibold text-black rounded-lg text-sm min-w-[100px] 
    ${getWidthHeightClassNames(size)}`}
    onClick={onClick}
    style={style}
    onDoubleClick={() => null}
  >
    {' '}
    {text}
  </button>
);

export const ButtonLoading: React.FC<IActionButton> = ({
  text,
  size = 'medium',
  style,
  disabled,
  dataTestID
}) => (
  <button
    data-test-id={dataTestID}
    disabled={disabled}
    style={style}
    className={`bg-blue-blue2 font-semibold text-white rounded-lg min-w-[100px] text-sm	
    ${getWidthHeightClassNames(size)} h-12`}
    onDoubleClick={() => null}
  >
    {text}
  </button>
);

export const ButtonIcon: React.FC<IActionButton> = ({
  dataCy,
  onClick,
  text,
  size = 'medium',
  style,
  icon,
  dataTestID,
  className,
  type
}) => (
  <button
    data-test-id={dataTestID}
    data-cy={dataCy}
    style={style}
    className={`bg-transparent text-blue-blue2 rounded-lg text-sm mx-4 ${getWidthHeightClassNames(
      size
    )} h-12 ${className}`}
    onClick={onClick}
    type={type}
    onDoubleClick={() => null}
  >
    {icon}
    <span className="px-2 text-blue-blue2">{text}</span>
  </button>
);

export const ButtonIconOutlined: React.FC<IActionButtonOutlined> = ({
  dataCy,
  onClick,
  text,
  size = 'medium',
  style,
  icon,
  disabled,
  theme = 'border-blue-blue2 text-blue-blue2',
  dataTestID
}) => (
  <button
    data-test-id={dataTestID}
    data-cy={dataCy}
    className={`bg-transparent border-[1px] ${
      disabled ? 'border-[#bdbdbd] text-[#bdbdbd]' : theme
    }
    ${getWidthHeightClassNames(size)} rounded-lg text-sm	 h-12`}
    onClick={onClick}
    style={style}
    onDoubleClick={() => null}
  >
    {icon}
    {text}
  </button>
);
