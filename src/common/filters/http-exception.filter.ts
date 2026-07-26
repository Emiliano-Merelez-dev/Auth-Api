import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // Al dejarlo vacío, atrapa absolutamente CUALQUIER error de la aplicación
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determinamos si es una excepción HTTP controlada por NestJS (ej: 400, 401, 404)
    // o si es un error desconocido de programación / base de datos (500)
    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extraemos el mensaje de error de forma segura
    let message = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      // NestJS a veces devuelve el mensaje como objeto (ej: class-validator devuelve arrays de errores)
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        errorDetails = (exceptionResponse as any).error || null;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Opcional pero recomendado: Loguear el error real en la consola del servidor para debugear
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('[Critical Error]', exception);
    }

    // Estructura JSON limpia, unificada y profesional para el cliente
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      ...(errorDetails && { error: errorDetails }),
    });
  }
}
