import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({
    description: 'The first name to enrich and store',
    example: 'ella',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z]+$/, {
    message: 'name must contain only alphabetic characters',
  })
  name!: string;
}
