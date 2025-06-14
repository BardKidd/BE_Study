import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

// 用來捕捉所有錯誤，要限定處理某一錯誤可以使用 @Catch(HttpException)。
// implement: 保證某個 class 使用 interface 的語法。
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 將 host 轉換成 HTTP 的 context
    const ctx = host.switchToHttp();
    // 回應物件，可以呼叫 .status().json() 送出結果
    const response = ctx.getResponse<Response>();
    // 請求內容（URL、body、headers 等）
    const request = ctx.getRequest<Request>();

    // 判斷錯誤是不是 NestJS 內建的 HttpException
    // 不是的話一律回傳 500 error
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR; // <- 500

    // 這裡抓錯誤訊息。NestJS 的 HttpException 有 getResponse()
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // 包裝成自己要的格式
    response.status(status).json({
      status: false,
      error: {
        code: status,
        message,
        path: request.url,
      },
    });
  }
}
