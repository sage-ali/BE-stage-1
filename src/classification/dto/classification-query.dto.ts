import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClassificationQueryDto {
  @ApiProperty({
    description: 'The name to classify',
    required: true,
    example: 'john',
  })
  @IsString()
  @IsNotEmpty({
    message: 'Name query parameter is required and cannot be empty',
  })
  @Matches(/^[a-zA-Z\s-]+$/, {
    message: 'Name must contain only letters, spaces, and hyphens',
  })
  name!: string;
}
