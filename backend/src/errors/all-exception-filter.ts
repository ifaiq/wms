import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch(HttpException)
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const _ctx = host.switchToHttp();
    const response = _ctx.getResponse();
    const status = exception?.getStatus();

    response.locals.stack = exception.stack;
    if (exception.response?.errors?.reason) {
      response.locals.exception = exception.response.errors.reason;
    }
    response.status(status).json({
      ...exception.response
    });
  }
}
