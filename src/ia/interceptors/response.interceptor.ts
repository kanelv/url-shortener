import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        this.logger.debug(`intercept::data: ${JSON.stringify(data, null, 2)}`);

        // Set the cookie if accessToken is present in the response data
        if (data?.accessToken && data?.cookieOptions) {
          response.cookie('accessToken', data.accessToken, data.cookieOptions);
          delete data.accessToken; // Remove token from response body
          delete data.cookieOptions; // Remove cookieOptions from response body
        }

        const message = data?.message || 'Success';
        if (message) {
          delete data.message;
        }

        return {
          statusCode,
          message,
          data: data.data,
          timestamp: dayjs().toISOString()
        };
      })
    );
  }
}
