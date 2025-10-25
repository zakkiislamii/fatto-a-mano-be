import { Module } from '@nestjs/common';
import { NotificationsController } from './modules/notifications/notifications.controller';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [NotificationsController],
})
export class AppModule {}
