import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { GetProfilesQueryDto } from './dto/get-profiles-query.dto';
import {
  ProfileSuccessResponseDto,
  ProfileSuccessWithMessageResponseDto,
  ProfileListResponseDto,
} from './dto/profile-response.dto';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new profile with idempotency',
    description:
      'Creates a new profile by enriching the name with gender, age, and nationality data. If the profile already exists, returns the existing one.',
  })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
    type: ProfileSuccessResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Profile already exists',
    type: ProfileSuccessWithMessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid name parameter' })
  @ApiResponse({
    status: 502,
    description: 'Upstream API error or invalid data',
  })
  async create(
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<ProfileSuccessResponseDto | ProfileSuccessWithMessageResponseDto> {
    const result = await this.profilesService.createProfile(
      createProfileDto.name,
    );

    if (result.existing) {
      return {
        status: 'success',
        message: 'Profile already exists',
        data: {
          id: result.profile.id,
          name: result.profile.name,
          gender: result.profile.gender,
          gender_probability: result.profile.gender_probability,
          sample_size: result.profile.sample_size,
          age: result.profile.age,
          age_group: result.profile.age_group,
          country_id: result.profile.country_id,
          country_probability: result.profile.country_probability,
          created_at: result.profile.created_at,
        },
      };
    }

    return {
      status: 'success',
      data: {
        id: result.profile.id,
        name: result.profile.name,
        gender: result.profile.gender,
        gender_probability: result.profile.gender_probability,
        sample_size: result.profile.sample_size,
        age: result.profile.age,
        age_group: result.profile.age_group,
        country_id: result.profile.country_id,
        country_probability: result.profile.country_probability,
        created_at: result.profile.created_at,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get profile by ID',
    description: 'Retrieves a profile by its unique identifier.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile found',
    type: ProfileSuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async findById(@Param('id') id: string): Promise<ProfileSuccessResponseDto> {
    const profile = await this.profilesService.findProfileById(id);

    if (!profile) {
      throw new Error('Profile not found');
    }

    return {
      status: 'success',
      data: {
        id: profile.id,
        name: profile.name,
        gender: profile.gender,
        gender_probability: profile.gender_probability,
        sample_size: profile.sample_size,
        age: profile.age,
        age_group: profile.age_group,
        country_id: profile.country_id,
        country_probability: profile.country_probability,
        created_at: profile.created_at,
      },
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all profiles with optional filtering',
    description:
      'Retrieves all profiles with optional case-insensitive filtering by gender, country_id, and age_group.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profiles retrieved successfully',
    type: ProfileListResponseDto,
  })
  async findAll(
    @Query() query: GetProfilesQueryDto,
  ): Promise<ProfileListResponseDto> {
    const { count, data } = await this.profilesService.findAllProfiles({
      gender: query.gender,
      country_id: query.country_id,
      age_group: query.age_group,
    });

    return {
      status: 'success',
      count,
      data: data.map((profile) => ({
        id: profile.id,
        name: profile.name,
        gender: profile.gender,
        gender_probability: profile.gender_probability,
        sample_size: profile.sample_size,
        age: profile.age,
        age_group: profile.age_group,
        country_id: profile.country_id,
        country_probability: profile.country_probability,
        created_at: profile.created_at,
      })),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete profile by ID',
    description: 'Deletes a profile by its unique identifier.',
  })
  @ApiResponse({
    status: 204,
    description: 'Profile deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.profilesService.deleteProfile(id);
  }
}
