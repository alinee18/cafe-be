import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: 'Nasi Goreng' })
  @IsNotEmpty({ message: 'Nama menu wajib diisi' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 15000 })
  @IsInt({ message: 'Harga harus angka' })
  @Min(1, { message: 'Harga minimal 1' })
  price!: number;

  @ApiProperty({ example: 'Nasi goreng spesial dengan telur', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://image.com/nasi-goreng.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt({ message: 'CategoryId harus angka' })
  categoryId?: number;
}