import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { Log } from '../entities/log.entity';
import { ParkingSpot } from '../entities/parking-spot.entity';
import { RabbitmqService } from '../services/rabbitmq.service';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(ParkingSpot)
    private readonly parkingSpotRepository: Repository<ParkingSpot>,
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  async getLogs(): Promise<any[]> {
    return await this.logRepository.find();
  }

  async getPendingReservations(): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { status: 'pending' },
      relations: ['parkingSpot'],
    });
  }

  async confirmReservation(reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['parkingSpot'],
    });

    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    if (reservation.status === 'reserved') {
      throw new HttpException(
        'This reservation has already been approved.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const parkingSpot = reservation.parkingSpot;
    parkingSpot.status = 'reserved';
    reservation.status = 'reserved';

    await this.parkingSpotRepository.save(parkingSpot);
    const updatedReservation =
      await this.reservationRepository.save(reservation);

    const message = JSON.stringify({
      reservationId: updatedReservation.id,
      userId: updatedReservation.userId,
      status: 'reserved',
    });
    await this.rabbitmqService.publishToQueue('admin_responses', message);

    return updatedReservation;
  }

  async rejectReservation(reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['parkingSpot'],
    });

    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    if (reservation.status === 'rejected') {
      throw new HttpException(
        'This reservation has already been rejected.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const parkingSpot = reservation.parkingSpot;
    parkingSpot.status = 'free';
    reservation.status = 'rejected';

    await this.parkingSpotRepository.save(parkingSpot);
    const updatedReservation =
      await this.reservationRepository.save(reservation);

    const message = JSON.stringify({
      reservationId: updatedReservation.id,
      userId: updatedReservation.userId,
      status: 'rejected',
    });
    await this.rabbitmqService.publishToQueue('admin_responses', message);

    return updatedReservation;
  }
}
