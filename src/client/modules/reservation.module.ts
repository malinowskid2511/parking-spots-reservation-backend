import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ParkingSpot } from '../entities/parking-spot.entity';
import { ReservationService } from '../services/reservation.service';
import { ReservationController } from '../controllers/reservation.controller';
import { Log } from '../entities/log.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LogService } from '../services/log.service';
import { LoggingMiddleware } from '../common/logging.middleware';
import { RabbitmqService } from '../services/rabbitmq.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Log]),
    TypeOrmModule.forFeature([Reservation, ParkingSpot]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL || 'amqp://localhost:5672'],
          queue: 'parking_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [ReservationService, LogService, RabbitmqService],
  controllers: [ReservationController],
})
export class ReservationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('reservation/status', 'reservation/reserve');
  }
}
