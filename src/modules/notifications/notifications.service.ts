import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { NotificationsRepository } from './notifications.repository';

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

  async sendToUser(uid: string, title: string, body: string) {
    const tokens = await this.notificationsRepo.listUserTokens(uid);
    if (tokens.length === 0) {
      return { success: false, sent: 0, error: 'No FCM tokens for user' };
    }

    const tKirim = Date.now().toString();

    const message: admin.messaging.MulticastMessage = {
      data: {
        feature: 'send_to_user',
        title,
        body,
        tKirim,
      },
      tokens,
      android: {
        priority: 'high',
        ttl: 0,
      },
      apns: {
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'background',
        },
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
      },
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

    if (invalid.length > 0) {
      Promise.allSettled(
        invalid.map((t) => this.notificationsRepo.removeUserToken(uid, t)),
      ).catch((err) => console.error('Token cleanup failed', err));
    }

    this.notificationsRepo
      .saveUserNotification(uid, title, body)
      .catch((err) => console.error('saveUserNotification failed', err));

    return {
      success: true,
      sent: resp.successCount,
      failed: resp.failureCount,
      invalid,
      tKirim,
    };
  }

  async sendToAll(title: string, body: string) {
    const tKirim = Date.now().toString();

    const message: admin.messaging.Message = {
      topic: this.topicAll,
      data: {
        feature: 'send_to_all',
        title,
        body,
        tKirim,
      },
      android: {
        priority: 'high',
        ttl: 0,
      },
      apns: {
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'background',
        },
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
      },
    };

    const id = await this.fb.messaging().send(message);

    this.notificationsRepo
      .saveBroadcastNotification(title, body)
      .catch((err) => console.error('saveBroadcastNotification failed', err));

    return { success: true, messageId: id, topic: this.topicAll, tKirim };
  }

  async sendToUserWithFallback(uid: string, title: string, body: string) {
    const tokens = await this.notificationsRepo.listUserTokens(uid);
    if (tokens.length === 0) {
      return { success: false, sent: 0, error: 'No FCM tokens for user' };
    }

    const tKirim = Date.now().toString();

    const message: admin.messaging.MulticastMessage = {
      notification: { title, body },
      data: {
        feature: 'send_to_user',
        title,
        body,
        tKirim,
      },
      tokens,
      android: {
        priority: 'high',
        ttl: 3600,
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            alert: { title, body },
            sound: 'default',
          },
        },
      },
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

    if (invalid.length > 0) {
      Promise.allSettled(
        invalid.map((t) => this.notificationsRepo.removeUserToken(uid, t)),
      ).catch((err) => console.error('Token cleanup failed', err));
    }

    this.notificationsRepo
      .saveUserNotification(uid, title, body)
      .catch((err) => console.error('saveUserNotification failed', err));

    return {
      success: true,
      sent: resp.successCount,
      failed: resp.failureCount,
      invalid,
    };
  }
}
