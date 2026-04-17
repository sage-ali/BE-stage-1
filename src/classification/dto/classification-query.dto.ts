import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ClassificationQueryDto {
  @IsString()
  @IsNotEmpty({
    message: 'Name query parameter is required and cannot be empty',
  })
  @Matches(/^[a-zA-Z\s-]+$/, {
    message: 'Name must contain only letters, spaces, and hyphens',
  })
  name!: string;
}
