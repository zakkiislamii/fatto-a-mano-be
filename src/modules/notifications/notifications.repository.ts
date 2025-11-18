import { Injectable } from '@nestjs/common';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class NotificationsRepository {
  private get db(): Firestore {
    return getFirestore();
  }

  async addUserToken(uid: string, token: string): Promise<void> {
    const ref = this.db.doc(`users/${uid}/fcmTokens/${token}`);
    const doc = await ref.get();
    if (doc.exists) {
      await ref.update({
        updated_at: FieldValue.serverTimestamp(),
      });
    } else {
      await ref.set({
        token,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
    }
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
    const snap = await this.db.collectionGroup('fcmTokens').get();
    return snap.docs.map((d) => d.id);
  }

  async saveUserNotification(
    uid: string,
    title: string,
    body: string,
  ): Promise<string> {
    const ref = this.db.collection(`users/${uid}/notifications`).doc();
    await ref.set({
      title,
      body,
      created_at: FieldValue.serverTimestamp(),
      read: false,
    });
    return ref.id;
  }

  async saveBroadcastNotification(
    title: string,
    body: string,
  ): Promise<string> {
    const ref = this.db.collection('broadcastNotifications').doc();
    await ref.set({
      title,
      body,
      created_at: FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  async saveNotificationForAllPerUserBatch(
    title: string,
    body: string,
  ): Promise<string[]> {
    const usersSnap = await this.db.collection('users').get();
    const savedIds: string[] = [];

    let batch = this.db.batch();
    let batchCount = 0;

    for (const userDoc of usersSnap.docs) {
      const notifRef = userDoc.ref.collection('notifications').doc();
      batch.set(notifRef, {
        title,
        body,
        created_at: FieldValue.serverTimestamp(),
        read: false,
      });
      savedIds.push(notifRef.id);
      batchCount++;

      if (batchCount >= 500) {
        await batch.commit();
        batch = this.db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    return savedIds;
  }
}
