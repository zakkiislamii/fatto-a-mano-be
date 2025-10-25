import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import * as admin from 'firebase-admin';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const saJson = config.get<string>('FIREBASE_SA_JSON');

        if (!saJson) {
          throw new Error('FIREBASE_SA_JSON environment variable is not set');
        }

        try {
          const serviceAccount: string = JSON.parse(saJson);

          if (!admin.apps.length) {
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
            });
          }
          return admin;
        } catch (error) {
          throw new Error(`Failed to parse FIREBASE_SA_JSON: ${error.message}`);
        }
      },
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
