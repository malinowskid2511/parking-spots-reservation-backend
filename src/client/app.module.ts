import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingSpot } from './entities/parking-spot.entity';
import { ParkingSpotSeederService } from './services/parking-spot-seeder.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Reservation } from './entities/reservation.entity';
import { ReservationModule } from './modules/reservation.module';
import { ReservationService } from './services/reservation.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './services/sheduler.service';
import { ReservationController } from './controllers/reservation.controller';
import { RabbitmqModule } from './modules/rabbitmq.module';
import { RabbitmqService } from './services/rabbitmq.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOSTNAME,
      // port: 5432,
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),

    ReservationModule,
    RabbitmqModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([ParkingSpot, Reservation]),

    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL || 'amqp://localhost:5672'],
          queue: 'reservation_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [
    ParkingSpotSeederService,
    ReservationService,
    SchedulerService,
    RabbitmqService,
  ],
  controllers: [ReservationController],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly parkingSpotSeederService: ParkingSpotSeederService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  async onModuleInit() {
    await this.rabbitmqService.connect();
    await this.parkingSpotSeederService.seed();
  }
}
