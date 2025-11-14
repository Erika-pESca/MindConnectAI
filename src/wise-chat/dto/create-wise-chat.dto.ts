import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWiseChatDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
