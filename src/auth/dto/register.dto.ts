import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString({
    message:
      'Username harus berupa teks',
  })
  @IsNotEmpty({
    message:
      'Username wajib diisi',
  })
  username!: string;

  @IsEmail(
    {},
    {
      message:
        'Format email tidak valid',
    },
  )
  email!: string;

  @MinLength(6, {
    message:
      'Password minimal 6 karakter',
  })
  password!: string;
}