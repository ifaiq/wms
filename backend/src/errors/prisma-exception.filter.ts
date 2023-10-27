import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Response } from 'express';
import {
  ApiException,
  PrismaErrors,
  UniqueConstraintFailedException,
  NotFoundException,
  DatabaseError
} from './exceptions';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  async catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    let error: ApiException = new DatabaseError();
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();

    if (exception.code === PrismaErrors.UniqueConstraintFailed) {
      if (exception.meta !== undefined) {
        const meta: any = exception.meta;
        if (typeof meta.target === 'string') {
          const tokens = meta.target.split('_');
          if (tokens.length >= 2) {
            error = new UniqueConstraintFailedException(tokens[1], tokens[0]);
          } else {
            error = new UniqueConstraintFailedException();
          }
        }
      }
    } else if (
      exception.code === PrismaErrors.NotFound ||
      exception.code === PrismaErrors.RelatedRecordNotFound ||
      exception.code === PrismaErrors.ConnectedRecordsNotFound
    ) {
      error = new NotFoundException();
    }
    response.status(error.getStatus()).send(error.getResponse());
  }
}
