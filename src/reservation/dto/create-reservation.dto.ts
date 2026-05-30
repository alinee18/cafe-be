import { IsInt, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
    tableId!: number;

  @IsDateString()
    date!: string;
}