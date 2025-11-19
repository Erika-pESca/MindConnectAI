import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  chatId: number;

  @IsString()
  @IsNotEmpty()
  contenido: string;
}
