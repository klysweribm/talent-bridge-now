import type { Request } from 'express';
import { Body, Controller, Param, Post, Put, Req, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { ICandidate, ICandidateActor, ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import type { IJwtPayload } from '../../../../shared/auth/jwt-payload.interface';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { CandidateService } from '../../application/services/candidate.service';
import { CvExtractionService } from '../../application/services/cv-extraction.service';
import { CV_EXTRACTION_THROTTLE_LIMIT, CV_EXTRACTION_THROTTLE_TTL_MS } from '../../domain/constants/cv.constants';
import { CreateCandidateDto } from '../../domain/dto/create-candidate.dto';
import { CandidateIdParamDto } from '../../domain/dto/candidate-id-param.dto';
import { ExtractCvDto } from '../../domain/dto/extract-cv.dto';
import type { ICvUploadedFile } from '../../domain/interfaces/cv-upload.interface';
import { ApiCandidatesController, ApiCreateCandidate, ApiExtractCv, ApiUpdateCandidate } from './candidates.swagger';
import { CvUploadTooLargeFilter } from './cv-upload-too-large.filter';

type AuthedRequest = Request & { readonly user: IJwtPayload };

/** El autor sale siempre de la sesión (JWT), nunca del cuerpo. */
const toActor = (req: AuthedRequest): ICandidateActor => ({ id: req.user.sub, email: req.user.email, role: req.user.role });

@ApiCandidatesController()
@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class CandidatesController {
  constructor(
    private readonly extraction: CvExtractionService,
    private readonly candidates: CandidateService,
  ) {}

  @Post('cv-extraction')
  @Throttle({ default: { limit: CV_EXTRACTION_THROTTLE_LIMIT, ttl: CV_EXTRACTION_THROTTLE_TTL_MS } })
  @UseFilters(CvUploadTooLargeFilter)
  @UseInterceptors(FileInterceptor('file'))
  @ApiExtractCv()
  extractCv(@UploadedFile() file: ICvUploadedFile | undefined, @Body() dto: ExtractCvDto): Promise<ICvExtractionResult> {
    return this.extraction.extract(file, dto.mode);
  }

  @Post()
  @ApiCreateCandidate()
  create(@Body() dto: CreateCandidateDto, @Req() req: AuthedRequest): Promise<ICandidate> {
    return this.candidates.create(dto, toActor(req));
  }

  @Put(':id')
  @ApiUpdateCandidate()
  update(@Param() params: CandidateIdParamDto, @Body() dto: CreateCandidateDto, @Req() req: AuthedRequest): Promise<ICandidate> {
    return this.candidates.update(params.id, dto, toActor(req));
  }
}
