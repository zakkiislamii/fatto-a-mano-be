import { Module } from '@nestjs/common';
import { SheetyController } from './sheety.controller';
import { SheetyService } from './sheety.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [SheetyController],
  providers: [SheetyService],
  exports: [SheetyService],
})
export class SheetyModule {}
