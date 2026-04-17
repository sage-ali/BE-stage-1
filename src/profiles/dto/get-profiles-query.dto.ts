import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetProfilesQueryDto {
  @ApiProperty({
    description: 'Filter by gender',
    example: 'male',
    required: false,
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({
    description: 'Filter by country ID',
    example: 'NG',
    required: false,
  })
  @IsOptional()
  @IsString()
  country_id?: string;

  @ApiProperty({
    description: 'Filter by age group',
    example: 'adult',
    required: false,
    enum: ['child', 'teenager', 'adult', 'senior'],
  })
  @IsOptional()
  @IsString()
  age_group?: string;
}
