import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  profile_photo?: string;

  // 🔥 nuevo campo opcional
  @IsOptional()
  @IsString()
  role?: string; // 'user' o 'admin' o lo que uses
}
