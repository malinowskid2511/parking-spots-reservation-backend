import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ParkingSpot } from '../entities/parking-spot.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  surname: string;

  @ManyToOne(() => ParkingSpot, (parkingSpot) => parkingSpot.reservations, {
    eager: true,
    cascade: false,
  })
  @JoinColumn({ name: 'parkingSpotId' })
  parkingSpot: ParkingSpot;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column()
  status: string;

  @Column()
  licensePlate: string;

  @CreateDateColumn()
  createdAt: Date;
}
