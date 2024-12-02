import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AdministratorController } from 'controllers/admin.controller';
import { AdministratorService } from 'services/admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministratorModule } from 'modules/admin.module';
import { Reservation } from 'entities/reservation.entity';
import { ParkingSpot } from 'entities/parking-spot.entity';
import { Log } from 'entities/log.entity';
import { RabbitmqService } from 'services/rabbitmq.service';

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
    AdministratorModule,
    TypeOrmModule.forFeature([ParkingSpot, Reservation, Log]),
  ],
  controllers: [AppController, AdministratorController],
  providers: [AppService, AdministratorService, RabbitmqService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  async onModuleInit() {
    await this.rabbitmqService.connect();
  }
}
