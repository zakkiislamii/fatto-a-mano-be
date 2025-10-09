import { Injectable } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';

@Injectable()
export class NotificationsRepository {
  private db = getFirestore();

  async addUserToken(uid: string, token: string): Promise<void> {
    const ref = this.db.doc(`users/${uid}/fcmTokens/${token}`);
    await ref.set(
      {
        token,
        updatedAt: new Date(),
      },
      { merge: true }, // idempotent
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
    return snap.docs.map((d) => d.id); // docId = token
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
}
