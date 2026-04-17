import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  gender!: string;

  @ApiProperty()
  gender_probability!: number;

  @ApiProperty()
  sample_size!: number;

  @ApiProperty()
  age!: number;

  @ApiProperty()
  age_group!: string;

  @ApiProperty()
  country_id!: string;

  @ApiProperty()
  country_probability!: number;

  @ApiProperty()
  created_at!: Date;
}

export class ProfileSuccessResponseDto {
  @ApiProperty({ example: 'success' })
  status!: string;

  @ApiProperty({ type: ProfileResponseDto })
  data!: ProfileResponseDto;
}

export class ProfileSuccessWithMessageResponseDto {
  @ApiProperty({ example: 'success' })
  status!: string;

  @ApiProperty({ example: 'Profile already exists' })
  message!: string;

  @ApiProperty({ type: ProfileResponseDto })
  data!: ProfileResponseDto;
}

export class ProfileListResponseDto {
  @ApiProperty({ example: 'success' })
  status!: string;

  @ApiProperty({ example: 2 })
  count!: number;

  @ApiProperty({ type: [ProfileResponseDto] })
  data!: ProfileResponseDto[];
}
