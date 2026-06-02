import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer'; // <--- Wajib di-import

export class CreateMenuDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // <--- Mengubah string "20000" menjadi angka 20000 sebelum divalidasi
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // <--- Mengubah string "1" menjadi angka 1 sebelum divalidasi
  categoryId?: number;
}