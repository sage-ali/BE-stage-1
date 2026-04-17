import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { EnrichProfileDto } from './dto/enrich-profile.dto';
import { EnrichedProfile } from './types/profiles.types';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('enrich')
  @ApiOperation({
    summary: 'Enrich a first name with gender, age, and nationality data',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully enriched profile',
  })
  @ApiResponse({ status: 400, description: 'Invalid name parameter' })
  @ApiResponse({
    status: 502,
    description: 'Upstream API error or invalid data',
  })
  async enrich(@Query() query: EnrichProfileDto): Promise<EnrichedProfile> {
    const enrichedProfile = await this.profilesService.enrichProfile(
      query.name,
    );
    if (!enrichedProfile) {
      throw new Error('Profile enrichment failed');
    }
    return enrichedProfile;
  }
}
