import { Module } from '@nestjs/common';
import { AdministratorService } from '../services/admin.service';
import { AdministratorController } from '../controllers/admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { Log } from '../entities/log.entity';
import { ParkingSpot } from 'entities/parking-spot.entity';
import { RabbitmqService } from 'services/rabbitmq.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Log, ParkingSpot])],
  controllers: [AdministratorController],
  providers: [AdministratorService, RabbitmqService],
})
export class AdministratorModule {}
