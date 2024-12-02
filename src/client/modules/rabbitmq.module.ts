import { Module } from '@nestjs/common';
import { RabbitmqService } from '../services/rabbitmq.service';

@Module({
  providers: [RabbitmqService],
  exports: [RabbitmqService], // Export it if other modules need it
})
export class RabbitmqModule {}
