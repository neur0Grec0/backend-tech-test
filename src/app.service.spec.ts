import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import * as fs from 'fs';

jest.mock('fs');

//Some tests for the service, I could add some more and make these more detailed. There's cases I haven't accounted for.
describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getAllCompanies', () => {
    const companiesData = [
      {
        id: 11,
        name: 'Bayer and Sons',
        industry: 'Real Estate Investment Trusts',
        active: true,
        website: 'http://unblog.fr',
        telephone: '187-321-4674',
        slogan: 'Multi-channelled systematic policy',
        address: '574 Monterey Place',
        city: 'Swift Current',
        country: 'Canada',
      },
      {
        id: 27,
        name: 'Murphy-Witting',
        industry: 'Packaged Foods',
        active: false,
        website: 'http://purevolume.com',
        telephone: '301-578-5980',
        slogan: 'Advanced fault-tolerant initiative',
        address: '67 Hanson Court',
        city: 'Hyattsville',
        country: 'United States',
      },
    ];

    it('should return all companies when no filters are provided', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['company1.json']);
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(
        JSON.stringify(companiesData) as any,
      );

      const result = service.getAllCompanies(10, 0, undefined, true);
      expect(result).toEqual([
        {
          id: 11,
          name: 'Bayer and Sons',
          industry: 'Real Estate Investment Trusts',
          active: true,
          website: 'http://unblog.fr',
          telephone: '187-321-4674',
          slogan: 'Multi-channelled systematic policy',
          address: '574 Monterey Place',
          city: 'Swift Current',
          country: 'Canada',
          employees: [],
        },
        {
          id: 27,
          name: 'Murphy-Witting',
          industry: 'Packaged Foods',
          active: false,
          website: 'http://purevolume.com',
          telephone: '301-578-5980',
          slogan: 'Advanced fault-tolerant initiative',
          address: '67 Hanson Court',
          city: 'Hyattsville',
          country: 'United States',
          employees: [],
        },
      ]);
    });

    it('should filter companies by industry', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['company1.json']);
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(
        JSON.stringify(companiesData) as any,
      );

      const filters = { industry: 'Investment' };
      const expected = [
        {
          id: 11,
          name: 'Bayer and Sons',
          industry: 'Real Estate Investment Trusts',
          active: true,
          website: 'http://unblog.fr',
          telephone: '187-321-4674',
          slogan: 'Multi-channelled systematic policy',
          address: '574 Monterey Place',
          city: 'Swift Current',
          country: 'Canada',
          employees: [],
        },
      ];
      const result = service.getAllCompanies(10, 0, filters);
      expect(result).toEqual(expected);
    });

    it('should return paginated companies without employees when includeEmployees is false', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'company1.json',
        'company2.json',
      ]);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce(
          JSON.stringify([{ id: 1, name: 'Company A' }]) as any,
        )
        .mockReturnValueOnce(
          JSON.stringify([{ id: 2, name: 'Company B' }]) as any,
        );

      const companies = service.getAllCompanies(10, 0);
      expect(companies).toEqual([
        { id: 1, name: 'Company A', employees: [] },
        { id: 2, name: 'Company B', employees: [] },
      ]);
    });

    it('should return companies with employees when includeEmployees is true', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['company1.json']);
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(
        JSON.stringify([{ id: 1, name: 'Company A' }]) as any,
      );
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(
        JSON.stringify([{ id: 1, name: 'Employee 1', company_id: 1 }]) as any,
      );

      const companies = service.getAllCompanies(10, 0, undefined, true);
      expect(companies).toEqual([
        {
          id: 1,
          name: 'Company A',
          employees: [{ id: 1, name: 'Employee 1', company_id: 1 }],
        },
      ]);
    });
  });

  describe('getCompaniesByIds', () => {
    it('should return companies by provided IDs with associated employees', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'company1.json',
        'company2.json',
      ]);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce(
          JSON.stringify([{ id: 1, name: 'Company A' }]) as any,
        )
        .mockReturnValueOnce(
          JSON.stringify([{ id: 2, name: 'Company B' }]) as any,
        )
        .mockReturnValueOnce(
          JSON.stringify([
            { id: 1, name: 'Employee 1', company_id: 1 },
            { id: 2, name: 'Employee 2', company_id: 1 },
          ]) as any,
        )
        .mockReturnValueOnce(
          JSON.stringify([
            { id: 3, name: 'Employee 3', company_id: 2 },
            { id: 4, name: 'Employee 4', company_id: 2 },
          ]) as any,
        );

      const companies = service.getCompaniesByIds([1, 2]);

      expect(companies).toEqual([
        {
          id: 1,
          name: 'Company A',
          employees: [
            { id: 1, name: 'Employee 1', company_id: 1 },
            { id: 2, name: 'Employee 2', company_id: 1 },
          ],
        },
        {
          id: 2,
          name: 'Company B',
          employees: [
            { id: 3, name: 'Employee 3', company_id: 2 },
            { id: 4, name: 'Employee 4', company_id: 2 },
          ],
        },
      ]);
    });

    it('should return empty array if no companies are found for provided IDs', () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'company1.json',
        'company2.json',
      ]);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce(
          JSON.stringify([{ id: 1, name: 'Company A' }]) as any,
        )
        .mockReturnValueOnce(
          JSON.stringify([{ id: 2, name: 'Company B' }]) as any,
        );

      const companies = service.getCompaniesByIds([3, 4]);
      expect(companies).toEqual([]);
    });

    it('should handle invalid JSON file gracefully', () => {
      const invalidJsonFileName = 'invalid.json';
      const invalidJsonContent = '{ id: 1, name: "Company A" }';

      (fs.readdirSync as jest.Mock).mockReturnValue([invalidJsonFileName]);
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(invalidJsonContent);

      const companies = service.getAllCompanies(10, 0);

      expect(companies).toEqual([]);
    });
  });
});
