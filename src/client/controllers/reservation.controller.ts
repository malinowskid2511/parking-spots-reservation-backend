// reservation.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Patch,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ReservationService } from '../services/reservation.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { Reservation } from 'entities/reservation.entity';
import { ParkingSpot } from 'entities/parking-spot.entity';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('status')
  async getParkingStatus(): Promise<ParkingSpot[]> {
    try {
      const status = await this.reservationService.getParkingStatus();
      return status;
    } catch (error) {
      console.error('Error fetching parking status:', error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('reserve')
  async reserveSpot(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    try {
      return await this.reservationService.reserveSpot(createReservationDto);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('confirm/:reservationId')
  async confirmReservation(
    @Param('reservationId') reservationId: string,
  ): Promise<Reservation> {
    try {
      return await this.reservationService.confirmReservation(reservationId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Patch('reject/:reservationId')
  async rejectReservation(
    @Param('reservationId') reservationId: string,
  ): Promise<Reservation> {
    try {
      return await this.reservationService.rejectReservation(reservationId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
