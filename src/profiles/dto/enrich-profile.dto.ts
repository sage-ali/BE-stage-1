import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object for enriching a profile.
 */
export class EnrichProfileDto {
  /**
   * The first name to enrich.
   * Must contain only alphabetic characters.
   */
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
