import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './CreateProperty.dto';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}