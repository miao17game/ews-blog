import { ExceptionFilter, Catch, ArgumentsHost, HttpException, ForbiddenException } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "@global/services/auth.service";
import { UserService } from "@global/services/user.service";

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  constructor(private readonly auth: AuthService, private readonly user: UserService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (this.auth.handleWhenUnauthentication) {
      this.auth.handleWhenUnauthentication(ctx);
      return;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: "403 Forbidden",
      infos: this.user.infos,
    });
  }
}
