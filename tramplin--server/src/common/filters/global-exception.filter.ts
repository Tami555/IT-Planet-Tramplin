import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import {Request, Response} from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Внутренняя ошибка сервера';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object' && res !== null) {
                const resObj = res as Record<string, any>;
                message = resObj.message ?? message;
                error = resObj.error ?? error;
            }
        } else if (exception instanceof Error) {
            this.logger.error(`Необработанное исключение: ${exception.message}`, exception.stack);
            // Скрываем детали от клиента в production
            if (process.env.NODE_ENV !== 'production') {
                message = exception.message;
            }
        }

        response.status(status).json({
            statusCode: status,
            message,
            error,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
