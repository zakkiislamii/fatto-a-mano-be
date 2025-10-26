import { Injectable } from '@nestjs/common';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

@Injectable()
export class NotificationsRepository {
  private get db(): Firestore {
    return getFirestore();
  }

  async addUserToken(uid: string, token: string): Promise<void> {
    const ref = this.db.doc(`users/${uid}/fcmTokens/${token}`);
    await ref.set(
      {
        token,
        updatedAt: new Date(),
      },
      { merge: true },
    );
  }

  async removeUserToken(uid: string, token: string): Promise<void> {
    await this.db
      .doc(`users/${uid}/fcmTokens/${token}`)
      .delete()
      .catch(() => {});
  }

  async listUserTokens(uid: string): Promise<string[]> {
    const snap = await this.db.collection(`users/${uid}/fcmTokens`).get();
    return snap.docs.map((d) => d.id);
  }

  async listAllTokens(): Promise<string[]> {
    const usersSnap = await this.db.collection('users').get();
    const tokens: string[] = [];
    for (const userDoc of usersSnap.docs) {
      const ts = await userDoc.ref.collection('fcmTokens').get();
      tokens.push(...ts.docs.map((d) => d.id));
    }
    return tokens;
  }

  async saveUserNotification(
    uid: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<string> {
    const ref = this.db.collection(`users/${uid}/notifications`).doc();
    await ref.set({
      title,
      body,
      data: data ?? {},
      createdAt: new Date(),
      read: false,
    });
    return ref.id;
  }

  async saveNotificationForAll(title: string, body: string): Promise<string[]> {
    const usersSnap = await this.db.collection('users').get();
    const savedIds: string[] = [];

    const batch = this.db.batch();
    let batchCount = 0;

    for (const userDoc of usersSnap.docs) {
      const notifRef = userDoc.ref.collection('notifications').doc();
      batch.set(notifRef, {
        title,
        body,
        createdAt: new Date(),
        read: false,
      });
      savedIds.push(notifRef.id);
      batchCount++;

      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    return savedIds;
  }
}
