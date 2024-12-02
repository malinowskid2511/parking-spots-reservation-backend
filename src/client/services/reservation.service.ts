import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ParkingSpot } from '../entities/parking-spot.entity';
import { CreateReservationDto } from 'dto/create-reservation.dto';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitmqService } from './rabbitmq.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(ParkingSpot)
    private parkingSpotRepository: Repository<ParkingSpot>,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  async getParkingStatus(): Promise<ParkingSpot[]> {
    return await this.parkingSpotRepository.find();
  }

  async reserveSpot(
    reservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const {
      userId,
      spotId,
      name,
      surname,
      startTime,
      endTime,
      vehicleType,
      licensePlate,
    } = reservationDto;

    const start = new Date(startTime);
    const end = new Date(endTime);

    const duration = (end.getTime() - start.getTime()) / 60000;
    if (duration < 10 || duration % 5 !== 0) {
      throw new HttpException(
        'Reservation duration must be at least 10 minutes and a multiple of 5 minutes.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const parkingSpot = await this.parkingSpotRepository.findOne({
      where: { spotId },
    });
    if (start.getTime() < new Date().getTime()) {
      throw new HttpException(
        `Parking spot can't be reserved in the past.`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (!parkingSpot) {
      throw new HttpException(
        `Parking spot ${spotId} does not exist.`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (parkingSpot.type === 'electric' && vehicleType !== 'electric') {
      throw new HttpException(
        `Parking spot ${spotId} is reserved for electric vehicles only.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingReservation = await this.reservationRepository.findOne({
      where: [
        {
          parkingSpot,
          status: 'reserved',
          startTime: Between(start, end),
        },
        {
          parkingSpot,
          status: 'reserved',
          endTime: Between(start, end),
        },
        {
          parkingSpot,
          status: 'pending',
          startTime: Between(start, end),
        },
        {
          parkingSpot,
          status: 'pending',
          endTime: Between(start, end),
        },
      ],
    });

    if (existingReservation) {
      throw new HttpException(
        `Parking spot ${spotId} is already reserved or has a pending reservation in this time period.`,
        HttpStatus.CONFLICT,
      );
    }

    const reservation = this.reservationRepository.create({
      userId,
      name,
      surname,
      parkingSpot,
      licensePlate,
      startTime: start,
      endTime: end,
      status: 'pending',
    });
    parkingSpot.status = 'pending';
    await this.parkingSpotRepository.save(parkingSpot);

    const savedReservation = await this.reservationRepository.save(reservation);
    const message = JSON.stringify(savedReservation);
    await this.rabbitmqService.publishToQueue('parking_reservations', message);
    return savedReservation;
  }
  async reserveParkingSpot(): Promise<void> {
    // Example of sending a message to a RabbitMQ queue when a parking spot is reserved
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
    return await this.reservationRepository.save(reservation);
  }

  async rejectReservation(reservationId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
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

    reservation.status = 'rejected';
    await this.reservationRepository.save(reservation);

    const parkingSpot = reservation.parkingSpot;
    parkingSpot.status = 'free';
    await this.parkingSpotRepository.save(parkingSpot);

    return reservation;
  }
  async expirePendingReservations(): Promise<void> {
    const expiredReservations = await this.reservationRepository.find({
      where: {
        status: 'pending',
        createdAt: LessThanOrEqual(
          new Date(new Date().getTime() - 5 * 60 * 1000),
        ),
      },
      relations: ['parkingSpot'],
    });

    for (const reservation of expiredReservations) {
      const parkingSpot = reservation.parkingSpot;
      parkingSpot.status = 'free';
      reservation.status = 'expired';
      await this.parkingSpotRepository.save(parkingSpot);
      await this.reservationRepository.save(reservation);
    }
  }
  async expireReservedReservations(): Promise<void> {
    const expiredReservations = await this.reservationRepository.find({
      where: {
        status: 'reserved',
        endTime: LessThanOrEqual(new Date()),
      },
      relations: ['parkingSpot'],
    });

    for (const reservation of expiredReservations) {
      const parkingSpot = reservation.parkingSpot;
      parkingSpot.status = 'free';
      reservation.status = 'expired';
      await this.parkingSpotRepository.save(parkingSpot);
      await this.reservationRepository.save(reservation);
    }
  }
}
