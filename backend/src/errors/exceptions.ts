import { HttpStatus, HttpException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ErrorCodes, ErrorResponse } from './errors';

export class ApiException extends HttpException {
  errorResponse: ErrorResponse;

  constructor(httpStatus: number, errorResponse: ErrorResponse) {
    super(errorResponse, httpStatus);
    this.errorResponse = errorResponse;
  }
}

export class ForbiddenException extends ApiException {
  constructor() {
    const errorResponse: ErrorResponse = {
      code: ErrorCodes.Unauthorized,
      status: HttpStatus.FORBIDDEN,
      errors: {
        reason:
          'User does not have the required permissions to access this resource'
      }
    };
    super(errorResponse.status, errorResponse);
  }
}

// Raised when one of the fields fails a unique constraint
export class UniqueConstraintFailedException extends ApiException {
  constructor(column?: string, model?: string) {
    const errorResponse: ErrorResponse = {
      code: ErrorCodes.Unauthorized,
      status: HttpStatus.CONFLICT
    };
    if (column !== undefined && model !== undefined) {
      errorResponse.errors = {
        reason: `${model} with ${column} already exists`,
        context: { model, column }
      };
    }
    super(errorResponse.status, errorResponse);
  }
}

export class ValidationFailedException extends ApiException {
  constructor(errors: ValidationError[]) {
    const errorResponse: ErrorResponse = {
      code: ErrorCodes.RequestValidationFailed,
      status: HttpStatus.BAD_REQUEST,
      errors: {
        reason: 'Request validation failed',
        context: getErrorContext(errors)
      }
    };

    super(errorResponse.status, errorResponse);
  }
}

export class BadRequestException extends ApiException {
  constructor(reason: string) {
    const errorResponse: ErrorResponse = {
      code: ErrorCodes.BAD_REQUEST,
      status: HttpStatus.BAD_REQUEST,
      errors: { reason }
    };

    super(errorResponse.status, errorResponse);
  }
}

export class NotFoundException extends ApiException {
  constructor(entity?: string) {
    const errorResponse: ErrorResponse = {
      code: ErrorCodes.NOT_FOUND,
      status: HttpStatus.NOT_FOUND
    };
    if (entity !== undefined) {
      errorResponse.errors = {
        reason: `${entity} with given id not found`,
        context: { entity }
      };
    }
    super(errorResponse.status, errorResponse);
  }
}

export class DatabaseError extends ApiException {
  constructor() {
    const errorResponse: ErrorResponse = {
      code: ErrorCodes.UNKNOWN,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errors: { reason: 'Unknown database error' }
    };
    super(errorResponse.status, errorResponse);
  }
}

export class BadRequestExceptionBulkUpload extends ApiException {
  constructor(errors: string[]) {
    const errorResponse: ErrorResponse = {
      code: ErrorCodes.BAD_REQUEST,
      status: HttpStatus.BAD_REQUEST,
      errors: { reason: errors }
    };

    super(errorResponse.status, errorResponse);
  }
}

function getErrorContext(errors: ValidationError[]) {
  return errors.map((error) => ({
    field: error.property,
    reason: JSON.stringify(error)
  }));
}

export enum PrismaErrors {
  UniqueConstraintFailed = 'P2002',
  NotFound = 'P2025',
  ConnectedRecordsNotFound = 'P2018',
  RelatedRecordNotFound = 'P2015',
  NullConstraintViolation = 'P2011'
}
