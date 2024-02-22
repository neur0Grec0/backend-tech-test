import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

//Some tests for the controller, I could add some more and make these more detailed. There's cases I haven't accounted for.
describe('CompaniesController', () => {
  let controller: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getAllCompanies', () => {
    describe('getAllCompanies', () => {
      it('should return companies with default limit and offset', () => {
        jest.spyOn(appService, 'getAllCompanies').mockReturnValue([]);

        controller.getAllCompanies();
        expect(appService.getAllCompanies).toHaveBeenCalledWith(
          10,
          0,
          undefined,
        );
      });

      it('should throw BadRequestException for negative limit or offset', () => {
        jest.spyOn(appService, 'getAllCompanies').mockReturnValue([]);

        expect(() => controller.getAllCompanies('-1', '0')).toThrow(
          'Invalid limit or offset value for pagination.',
        );
        expect(() => controller.getAllCompanies('10', '-6')).toThrow(
          'Invalid limit or offset value for pagination.',
        );
      });

      it('should throw BadRequestException for non-numeric limit or offset', () => {
        jest.spyOn(appService, 'getAllCompanies').mockReturnValue([]);

        expect(() => controller.getAllCompanies('abc', '0')).toThrow(
          'Invalid limit or offset value for pagination.',
        );
        expect(() => controller.getAllCompanies('10', 'xyz')).toThrow(
          'Invalid limit or offset value for pagination.',
        );
      });
    });

    it('should throw BadRequestException for negative limit or offset', () => {
      jest.spyOn(appService, 'getAllCompanies').mockReturnValue([]);

      expect(() => controller.getAllCompanies('-1', '0')).toThrow(
        'Invalid limit or offset value for pagination.',
      );
      expect(() => controller.getAllCompanies('10', '-6')).toThrow(
        'Invalid limit or offset value for pagination.',
      );
    });

    it('should throw BadRequestException for non-numeric limit or offset', () => {
      jest.spyOn(appService, 'getAllCompanies').mockReturnValue([]);

      expect(() => controller.getAllCompanies('abc', '0')).toThrow(
        'Invalid limit or offset value for pagination.',
      );
      expect(() => controller.getAllCompanies('10', 'xyz')).toThrow(
        'Invalid limit or offset value for pagination.',
      );
    });
  });

  describe('getCompaniesByIds', () => {
    it('should return companies when valid comma-separated numeric IDs are provided', () => {
      const ids = '1,2,3';
      const expectedCompanies = [
        {
          id: 1,
          name: 'Spinka, Boehm and Osinski',
          industry: 'Restaurants',
          active: false,
          website: 'https://angelfire.com',
          telephone: '913-872-2823',
          slogan: 'Optimized zero defect secured line',
          address: '619 Farmco Place',
          city: 'Delaware',
          country: 'Canada',
        },
        {
          id: 2,
          name: 'Langworth-Johnson',
          industry: 'Specialty Chemicals',
          active: false,
          website: 'https://mozilla.org',
          telephone: '773-196-9862',
          slogan: 'Decentralized neutral project',
          address: '7 Badeau Court',
          city: 'Chicago',
          country: 'United States',
        },
        {
          id: 3,
          name: 'Schuster-Turner',
          industry: 'Other Consumer Services',
          active: false,
          website: 'http://intel.com',
          telephone: '922-943-7768',
          slogan: 'Open-architected exuding knowledge user',
          address: '3731 Moose Point',
          city: 'Oakville',
          country: 'Canada',
        },
      ];
      jest
        .spyOn(appService, 'getCompaniesByIds')
        .mockReturnValue(expectedCompanies);

      const result = controller.getCompaniesByIds(ids);
      expect(result).toEqual(expectedCompanies);
    });

    it('should throw BadRequestException when ids parameter is empty', () => {
      const ids = '';
      expect(() => controller.getCompaniesByIds(ids)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when ids parameter contains non-numeric values', () => {
      const ids = '1,a,3';
      expect(() => controller.getCompaniesByIds(ids)).toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when provided IDs do not correspond to any companies', () => {
      const ids = '4,5,6';
      jest.spyOn(appService, 'getCompaniesByIds').mockReturnValue([]);

      expect(() => controller.getCompaniesByIds(ids)).toThrow(
        NotFoundException,
      );
    });
  });
});
