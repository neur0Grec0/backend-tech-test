import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getAllCompanies(
    limit: number,
    offset: number,
    filters?: any,
    //You can filter records inclusely or not inclusively, I found that useful for my own clarity
    //It could be useful for users. It's set to inclusive by default.
    inclusiveFiltering: boolean = true,
    //I provide the option to not return employees, not all users may require that data when they are requesting companies.
    //Not returning and proccessing unessecary data saves reasources. Set to true by default
    includeEmployees: boolean = true,
  ): any[] {
    const companies = this.retrieve('companies');

    let filteredCompanies = companies;

    // Apply filters if provided
    // Filter before pagination, otherwise you will only filter what you paginate
    if (filters) {
      filteredCompanies = companies.filter((company) => {
        let matchesFilters = true;

        for (const key in filters) {
          if (Object.prototype.hasOwnProperty.call(filters, key)) {
            const filterValue = filters[key];
            const companyValue = company[key];

            if (
              typeof companyValue === 'boolean' &&
              typeof filterValue === 'boolean'
            ) {
              if (companyValue !== filterValue) {
                matchesFilters = false;
                break; // Exit loop if the boolean values don't match
              }
            } else {
              const companyValueLower = String(companyValue).toLowerCase();
              const filterValueLower = String(filterValue).toLowerCase();
              const includesFilter =
                companyValueLower.includes(filterValueLower);

              if (
                (inclusiveFiltering && !includesFilter) ||
                (!inclusiveFiltering && includesFilter)
              ) {
                matchesFilters = false;
                break;
              }
            }
          }
        }

        return matchesFilters;
      });
    }

    if (includeEmployees) {
      const employees = this.retrieve('employees');
      filteredCompanies = filteredCompanies.map((company) => {
        const companyEmployees = employees.filter(
          (employee) => employee.company_id === company.id,
        );
        //destructuring keeps things neat
        return { ...company, employees: companyEmployees };
      });
    }

    const paginatedCompanies = filteredCompanies.slice(
      //offset is zero indexed, so we need to add 1
      offset + 1 * limit - limit,
      offset + 1 * limit,
    );

    return paginatedCompanies;
  }

  getCompaniesByIds(ids: number[]): any[] {
    const companies = this.retrieve('companies', ids);
    const employees = this.retrieve('employees');

    const companiesWithEmployees = companies.map((company) => {
      const companyEmployees = employees.filter(
        (employee) => employee.company_id === company.id,
      );
      return { ...company, employees: companyEmployees };
    });

    return companiesWithEmployees;
  }

  //seperated this into it's own method so I don't need to reuse code and make to make testing easier.
  private retrieve(dataType: 'companies' | 'employees', ids?: number[]): any[] {
    const dataFolderPath = path.join(__dirname, '..', '.', 'data', dataType);
    const dataFiles = fs.readdirSync(dataFolderPath);
    let allData: any[] = [];

    //I just combine all the data in the files together for each item, the same way it would function if you were querying a database.
    dataFiles.forEach((file) => {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataFolderPath, file);
        try {
          const fileData = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(fileData);
          allData = allData.concat(data);
        } catch (error) {
          console.error(
            `Error reading or parsing JSON file ${filePath}: ${error}`,
          );
        }
      }
    });

    if (ids) {
      allData = allData.filter(
        (item) => typeof item === 'object' && ids.includes(item.id),
      );
    }

    return allData;
  }
}
