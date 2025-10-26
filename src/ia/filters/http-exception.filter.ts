import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import dayjs from 'dayjs';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        error = res;
      } else if (typeof res === 'object') {
        const r = res as any;
        message = r.message || message;
        error = r.error || error;
      }
    }

    this.logger.error(`${request.method} ${request.url} - ${message}`);

    response.status(status).json({
      statusCode: status,
      message,
      error,
      data: null,
      timestamp: dayjs().toISOString()
    });
  }
}
