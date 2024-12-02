// administrator.controller.ts
import {
  Controller,
  Get,
  Param,
  Patch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdministratorService } from '../services/admin.service';
import { Reservation } from '../entities/reservation.entity';

@Controller('admin')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get('logs')
  async getLogs() {
    try {
      return await this.administratorService.getLogs();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('reservations/pending')
  async getPendingReservations(): Promise<Reservation[]> {
    try {
      return await this.administratorService.getPendingReservations();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch pending reservations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Patch('confirm/:reservationId')
  async confirmReservation(
    @Param('reservationId') reservationId: string,
  ): Promise<Reservation> {
    try {
      return await this.administratorService.confirmReservation(reservationId);
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
      return await this.administratorService.rejectReservation(reservationId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
