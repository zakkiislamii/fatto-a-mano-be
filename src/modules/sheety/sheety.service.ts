import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SheetyService {
  private readonly sheetyUrl: string;
  private readonly sheetyToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('SHEETY_URL');
    const token = this.configService.get<string>('SHEETY_TOKEN');

    if (!url || !token) {
      throw new InternalServerErrorException(
        'Sheety configuration is missing. Please check SHEETY_URL and SHEETY_TOKEN in .env',
      );
    }

    this.sheetyUrl = url;
    this.sheetyToken = token;
  }

  async getAll() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.sheetyUrl, {
          headers: {
            Authorization: `Bearer ${this.sheetyToken}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch data from Sheety: ${error.message}`);
    }
  }
}
