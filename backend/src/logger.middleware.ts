import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getSanitizedRequestBody } from './common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP Logger');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, body } = request;

    response.on('finish', () => {
      const { statusCode } = response;
      const { stack, exception }: any = response.locals;

      let message = `Method: ${method.toUpperCase()} StatusCode: ${statusCode} URL: ${originalUrl}`;
      if (method !== 'GET')
        message = `${message} Body: ${JSON.stringify(
          getSanitizedRequestBody(body)
        )}`;
      if (exception) message = `${message}\nException: ${exception}`;
      if (stack) message = `${message}\nStack: ${stack}`;
      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
