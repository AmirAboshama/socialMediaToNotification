import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import path from "node:path";

class NotificationService {

  private _serviceAccount = JSON.parse(
    readFileSync(
      path.resolve("./socialmediaapp-3c97b-firebase-adminsdk-fbsvc-6df6322329.json"),
      "utf-8"
    )
  );

  private _client: admin.app.App;

  constructor() {

    this._client =
      admin.apps.length > 0
        ? admin.app()
        : admin.initializeApp({
            credential: admin.credential.cert(this._serviceAccount),
          });

  }

  async sendNotification({
    token,
    data,
  }: {
    token: string;
    data: { title: string; body: string };
  }) {

    return await this._client.messaging().send({
      token,
      notification: data,
    });

  }

  async sendNotifications({
    tokens,
    data,
  }: {
    tokens: string[];
    data: { title: string; body: string };
  }) {

    return await Promise.all(
      tokens.map((token) => {
        return this.sendNotification({ token, data });
      })
    );

  }
}

export default NotificationService;