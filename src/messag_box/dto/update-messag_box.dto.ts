import { PartialType } from '@nestjs/mapped-types';
import { CreateMessagBoxDto } from './create-messag_box.dto';

export class UpdateMessagBoxDto extends PartialType(CreateMessagBoxDto) {}
