import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';

export enum ReservationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum VehicleType {
  ELECTRIC = 'electric',
  COMBUSTION = 'combustion',
}

export enum ParkingSpotType {
  ELECTRIC = 'electric',
  COMBUSTION = 'combustion',
}

export class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  surname: string;

  @IsNotEmpty()
  @IsString()
  licensePlate: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  spotId: string;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @IsNotEmpty()
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus = ReservationStatus.PENDING;
}
