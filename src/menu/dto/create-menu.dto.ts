import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer'; // <--- PASTIKAN INI DI-IMPORT!

export class CreateMenuDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // <--- Tambahkan ini agar teks "20000" otomatis lolos sebagai angka
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // <--- Tambahkan ini juga untuk categoryId
  categoryId?: number;
}