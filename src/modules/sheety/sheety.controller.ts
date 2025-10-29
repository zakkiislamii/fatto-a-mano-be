import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SheetyService } from './sheety.service';

@Controller('sheety')
export class SheetyController {
  constructor(private readonly sheetyService: SheetyService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll() {
    return this.sheetyService.getAll();
  }
}
