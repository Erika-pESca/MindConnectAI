import { PartialType } from '@nestjs/mapped-types';
import { CreateWiseChatDto } from './create-wise-chat.dto';

export class UpdateWiseChatDto extends PartialType(CreateWiseChatDto) {}
