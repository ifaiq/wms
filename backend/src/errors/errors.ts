// ErrorResponse is the type of custom error JSON that all our APIs will return
export interface ErrorResponse {
  // Internal error codes
  code: ErrorCodes;

  // HTTP status code
  status: number;

  // List of errors that occured
  errors?: Error;
}

// ErrorCodes document the possible internal error codes that our APIs can return
export enum ErrorCodes {
  // Ran into an unknown problem
  UNKNOWN,

  // A lookup for entity return a not found error
  NOT_FOUND,

  // Error in request structure or missing any required fields
  RequestValidationFailed,
  // A database unique constraint failed ie. row with same value of a column already exists

  UniqueConstraintFailed,

  // User is not allowed to perform this operation
  Unauthorized,

  // Bad request from client
  BAD_REQUEST,

  // Some upstream service failed
  UpstreamServiceFailed
}

export interface Error {
  reason: string | string[];
  context?: Record<string, any>;
}
