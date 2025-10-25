import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { NotificationsRepository } from './notifications.repository';

type MessageData = Record<string, string>;

@Injectable()
export class NotificationsService {
  private readonly topicAll: string;

  constructor(
    @Inject('FIREBASE_ADMIN') private readonly fb: typeof admin,
    private readonly config: ConfigService,
    private readonly notificationsRepo: NotificationsRepository,
  ) {
    this.topicAll = this.config.get<string>('FCM_TOPIC_ALL', 'employees_all');
  }

  async registerToken(uid: string, token: string) {
    await this.notificationsRepo.addUserToken(uid, token);
    await this.fb.messaging().subscribeToTopic([token], this.topicAll);
  }

  async unregisterToken(uid: string, token: string) {
    await this.notificationsRepo.removeUserToken(uid, token);
    await this.fb.messaging().unsubscribeFromTopic([token], this.topicAll);
  }

  async sendToUser(
    uid: string,
    title: string,
    body: string,
    data?: MessageData,
  ) {
    const tokens = await this.notificationsRepo.listUserTokens(uid);
    if (tokens.length === 0) {
      return { success: false, sent: 0, error: 'No FCM tokens for user' };
    }

    const message: admin.messaging.MulticastMessage = {
      notification: { title, body },
      data: data ?? {},
      tokens,
      android: { priority: 'high' },
    };

    const resp = await this.fb.messaging().sendEachForMulticast(message);
    const invalid: string[] = [];

    resp.responses.forEach((r, i) => {
      if (!r.success) {
        const code = (r.error as any)?.errorInfo?.code || r.error?.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          invalid.push(tokens[i]);
        }
      }
    });
    await Promise.all(
      invalid.map((t) => this.notificationsRepo.removeUserToken(uid, t)),
    );

    return {
      success: true,
      sent: resp.successCount,
      failed: resp.failureCount,
      invalid,
    };
  }

  async sendToAll(title: string, body: string) {
    const message: admin.messaging.Message = {
      topic: this.topicAll,
      notification: { title, body },
      android: { priority: 'high' },
    };

    const id = await this.fb.messaging().send(message);
    return { success: true, messageId: id, topic: this.topicAll };
  }
}
