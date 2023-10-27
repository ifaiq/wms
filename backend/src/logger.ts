import { LoggerService } from '@nestjs/common';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule
} from 'nest-winston';
import * as winston from 'winston';

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:MM:SS' }),
  winston.format.prettyPrint(),
  winston.format.cli(),
  nestWinstonModuleUtilities.format.nestLike()
);

const setupLogger = (): LoggerService => {
  return WinstonModule.createLogger({
    format: customFormat,
    transports: [new winston.transports.Console()],
    level: 'info'
  });
};

export { setupLogger };
