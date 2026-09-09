"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export default function NativeAppBootstrap() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let disposed = false;
    const setup = async () => {
      const permission = await PushNotifications.requestPermissions();
      if (disposed || permission.receive !== "granted") return;

      await PushNotifications.createChannel({
        id: "giftgrid-updates",
        name: "GiftGrid updates",
        description: "Application, opportunity, message, and support updates.",
        importance: 4,
        visibility: 1,
      }).catch(() => undefined);

      await PushNotifications.register();
    };

    const registration = PushNotifications.addListener("registration", ({ value }) => {
      // The token is ready for the authenticated device-registration API.
      window.dispatchEvent(new CustomEvent("giftgrid:push-token", { detail: value }));
    });
    const registrationError = PushNotifications.addListener("registrationError", (error) => {
      console.warn("GiftGrid push registration failed", error);
    });
    const received = PushNotifications.addListener("pushNotificationReceived", (notification) => {
      window.dispatchEvent(new CustomEvent("giftgrid:push-received", { detail: notification }));
    });

    void setup().catch((error) => console.warn("GiftGrid push setup failed", error));

    return () => {
      disposed = true;
      void Promise.all([registration, registrationError, received]).then((listeners) =>
        Promise.all(listeners.map((listener) => listener.remove())),
      );
    };
  }, []);

  return null;
}
