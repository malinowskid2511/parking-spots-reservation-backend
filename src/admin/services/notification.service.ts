import { Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class NotificationService {
  @EventPattern('reservation.created')
  async handleReservationCreated(data: any) {
    console.log('Received new reservation:', data);
  }
}
