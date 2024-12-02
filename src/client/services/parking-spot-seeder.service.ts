import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingSpot } from '../entities/parking-spot.entity';

@Injectable()
export class ParkingSpotSeederService {
  constructor(
    @InjectRepository(ParkingSpot)
    private parkingSpotRepository: Repository<ParkingSpot>,
  ) {}

  async seed() {
    const rows = ['A', 'B', 'C']; // Define the rows
    const columns = [1, 2, 3, 4, 5]; // Define the columns

    // Iterate through rows and columns to create spots
    for (const row of rows) {
      for (const column of columns) {
        const spotId = `${row}${column}`;

        // Check if the parking spot already exists in the database
        const existingSpot = await this.parkingSpotRepository.findOne({
          where: { spotId },
        });

        // If the spot does not exist, create and save it
        if (!existingSpot) {
          const parkingSpot = this.parkingSpotRepository.create({
            spotId,
            row,
            column,
            status: 'free', // Initially set all spots to 'free'
            type: this.getSpotType(spotId), // Set type based on specific logic
          });

          // Save the new parking spot to the database
          await this.parkingSpotRepository.save(parkingSpot);
          console.log(`Created parking spot ${spotId}`);
        } else {
          console.log(`Parking spot ${spotId} already exists, skipping.`);
        }
      }
    }

    console.log('Parking spots seeding completed!');
  }

  // Helper method to define the spot type logic
  private getSpotType(spotId: string): 'combustion' | 'electric' {
    // Set specific spots A1, B1, C1 as electric
    if (spotId === 'A1' || spotId === 'B1' || spotId === 'C1') {
      return 'electric';
    }

    // All other spots are 'combustion'
    return 'combustion';
  }
}
