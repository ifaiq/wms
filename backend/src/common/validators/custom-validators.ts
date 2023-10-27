//Helper class that implements logic for Custom Validator

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator
} from 'class-validator';

@ValidatorConstraint({ async: true })
class IsDateOrNullConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (value instanceof Date || value === null) {
      return true;
    }
    return false;
  }
}

//Custom decorator to validate date or null value
const IsDateOrNull = (validationOptions?: ValidationOptions) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDateOrNullConstraint
    });
  };
};

@ValidatorConstraint({ async: true })
class IsNumberOrNullConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value === 'number' || value === null) {
      return true;
    }
    return false;
  }
}

//Custom decorator to validate number or null value
const IsNumberOrNull = (validationOptions?: ValidationOptions) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNumberOrNullConstraint
    });
  };
};

const isValidDate = (date: string) => {
  const parts = date.split('-');
  if (parts.length != 3) return false;
  else {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return false;
    }
    if (day < 1 || year < 1 || month > 12 || month < 1) return false;
    if (
      (month == 1 ||
        month == 3 ||
        month == 5 ||
        month == 7 ||
        month == 8 ||
        month == 10 ||
        month == 12) &&
      day > 31
    )
      return false;
    if ((month == 4 || month == 6 || month == 9 || month == 11) && day > 30)
      return false;
    if (month == 2) {
      if (
        (year % 4 == 0 && year % 100 != 0) ||
        (year % 400 == 0 && year % 100 == 0)
      ) {
        if (day > 29) return false;
      } else {
        if (day > 28) return false;
      }
    }
    return true;
  }
};

export { IsDateOrNull, IsNumberOrNull, isValidDate };
