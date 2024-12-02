// scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationService } from './reservation.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly reservationService: ReservationService) {}

  @Cron('* * * * * *')
  async handlePendingReservations() {
    await this.reservationService.expirePendingReservations();
    await this.reservationService.expireReservedReservations();
  }
  @Cron('* * * * * *')
  async handleReservedReservations() {
    await this.reservationService.expireReservedReservations();
  }
}
