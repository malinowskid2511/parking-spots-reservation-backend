import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogService } from '../services/log.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logService: LogService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { method, originalUrl, body, params, query } = req;

    await this.logService.createLog(method, originalUrl, body, params, query);

    next();
  }
}
