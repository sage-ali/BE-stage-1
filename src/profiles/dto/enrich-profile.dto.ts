import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrichProfileDto {
  @ApiProperty({
    description: 'The first name to enrich',
    example: 'peter',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z]+$/, {
    message: 'name must contain only alphabetic characters',
  })
  name!: string;
}
