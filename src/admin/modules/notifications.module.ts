import { Module } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { Transport, ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'parking_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [NotificationService],
})
export class NotificationModule {}
