import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({
    example: 'Nasi Goreng Spesial',
    description: 'Nama menu yang akan ditampilkan di aplikasi',
  })
  @IsNotEmpty({ message: 'Nama menu tidak boleh kosong' })
  @IsString({ message: 'Nama menu harus berupa teks' })
  name!: string;

  @ApiProperty({
    example: 15000,
    description: 'Harga menu dalam Rupiah (tanpa titik/koma)',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Harga harus berupa angka bulat' })
  @Min(1, { message: 'Harga minimal adalah 1' })
  price!: number;

  @ApiProperty({
    example: 'Nasi goreng dengan telur, ayam, dan sayuran',
    required: false,
    description: 'Deskripsi singkat menu (opsional)',
  })
  @IsOptional()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  description?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    required: false,
    description: 'URL gambar menu (opsional). Gunakan link dari upload atau CDN',
  })
  @IsOptional()
  @IsString({ message: 'Image harus berupa URL/string' })
  image?: string;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'ID kategori menu (opsional, harus sesuai kategori yang ada)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'CategoryId harus berupa angka' })
  categoryId?: number;
}