import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../entities/log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async createLog(
    method: string,
    url: string,
    body: any,
    params: any,
    query: any,
  ): Promise<Log> {
    const log = this.logRepository.create({
      method,
      url,
      body,
      params,
      query,
    });

    return await this.logRepository.save(log);
  }
}
