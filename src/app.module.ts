import { Module } from '@nestjs/common';
import { NotificationsController } from './modules/notifications/notifications.controller';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SheetyModule } from './modules/sheety/sheety.module';
import { SheetyController } from './modules/sheety/sheety.controller';

@Module({
  imports: [NotificationsModule, SheetyModule],
  controllers: [NotificationsController, SheetyController],
})
export class AppModule {}
