import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWiseChatDto {
  @IsString()
  @MaxLength(150)
  nombre_chat: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
