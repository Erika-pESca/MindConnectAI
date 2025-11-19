import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateHistorialDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
