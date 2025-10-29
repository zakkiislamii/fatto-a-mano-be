import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SheetyService } from './sheety.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Controller('sheety')
export class SheetyController {
  constructor(private readonly sheetyService: SheetyService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll() {
    return this.sheetyService.getAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.sheetyService.create(createEmployeeDto);
  }
}
