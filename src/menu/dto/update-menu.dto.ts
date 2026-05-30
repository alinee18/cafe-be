import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt({ message: 'Harga harus angka' })
  @Min(1, { message: 'Harga minimal 1' })
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  // 🔥 TAMBAH INI BIAR UPDATE RELASI BISA
  @IsOptional()
  @IsInt({ message: 'CategoryId harus angka' })
  categoryId?: number;
}