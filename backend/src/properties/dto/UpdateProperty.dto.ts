import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './CreateProperty.dto';

/**
 * Every field is optional. Omitted fields are left untouched; an explicit
 * empty string clears a nullable text/enum/number field.
 */
export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
