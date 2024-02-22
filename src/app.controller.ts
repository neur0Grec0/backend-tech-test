import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('companies')
export class AppController {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly appService: AppService) {}
  //Nest js is a popular, preformant, nice and neat framework, so I decided to use it for this.

  //The framework automatically does input sanitation for security, so I don't need to do that here.
  //I restricted the resource consumption, if someone requests 10000000s of records it could cause unexpected issues.
  //They should make multiple requests instead
  //The rest of the responses are for users to make use of. I could add some more here, for example explaining if an error occured.
  @Get()
  getAllCompanies(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('filters') filters?: object,
  ): any[] {
    const MAX_LIMIT = 200;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(
        `Number of requested records exceeds the maximum allowed value of ${MAX_LIMIT}.`,
      );
    }

    return this.appService.getAllCompanies(limit, offset, filters);
  }

  @Get(':ids')
  getCompaniesByIds(@Param('ids') ids: string): any {
    const MAX_ITEMS = 20;

    if (!ids || !/^\d+(,\d+)*$/.test(ids)) {
      throw new BadRequestException(
        'Invalid parameter: ids must be comma-separated numeric values',
      );
    }

    const idArray = ids.split(',').map((id) => parseInt(id.trim(), 10));

    if (idArray.length > MAX_ITEMS) {
      throw new BadRequestException(
        `Number of requested records exceeds the maximum limit of ${MAX_ITEMS}`,
      );
    }

    try {
      const companies = this.appService.getCompaniesByIds(idArray);
      if (!companies.length) {
        throw new NotFoundException('Companies not found');
      }
      return companies;
    } catch (error) {
      throw error;
    }
  }
}
