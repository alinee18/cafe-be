import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMenuDto {
  @IsNotEmpty({ message: 'Nama menu wajib diisi' })
  @IsString()
  name!: string;

  @IsInt({ message: 'Harga harus angka' })
  @Min(1, { message: 'Harga minimal 1' })
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  // 🔥 TAMBAH INI
  @IsOptional()
  @IsInt({ message: 'CategoryId harus angka' })
  categoryId?: number;
}