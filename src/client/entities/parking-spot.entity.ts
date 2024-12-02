import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity()
export class ParkingSpot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  spotId: string;

  @Column()
  column: number;

  @Column()
  row: string;

  @Column({ default: 'regular' })
  type: 'combustion' | 'electric';

  @Column({ default: 'free' })
  status: 'free' | 'reserved' | 'pending';

  @OneToMany(() => Reservation, (reservation) => reservation.parkingSpot)
  reservations: Reservation[];
  parkingSpot: any;
  userId: any;
}
