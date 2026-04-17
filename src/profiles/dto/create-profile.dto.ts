import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object for creating a profile.
 */
export class CreateProfileDto {
  /**
   * The first name to enrich and store.
   * Must contain only alphabetic characters.
   */
  @ApiProperty({
    description: 'The first name to enrich and store',
    example: 'ella',
  })
  @IsNotEmpty({ message: 'Missing or empty name' })
  @IsString({ message: 'Invalid type' })
  @Matches(/^[a-zA-Z]+$/, {
    message: 'name must contain only alphabetic characters',
  })
  name!: string;
}
