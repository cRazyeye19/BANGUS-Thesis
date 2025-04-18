import { getAuth } from "firebase/auth";
import { push, ref, set, remove } from "firebase/database";
import { database } from "../config/firebase";

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendBrowserNotification = (
  title: string,
  options: NotificationOptions
) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, options);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
  return null;
};

export const createNotification = async (
  type: string,
  message: string,
  details: any = {}
) => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return;

  const notificationRef = ref(database, `BANGUSERS/${uid}/notifications`);
  const newNotificationRef = push(notificationRef);

  const notification = {
    id: newNotificationRef.key,
    type,
    message,
    details,
    timestamp: Date.now(),
    read: false,
  };

  await set(newNotificationRef, notification);

  if (Notification.permission === "granted") {
    sendBrowserNotification(message, {
      body: details.description || "",
      icon: "/favicon.ico",
      tag: type,
    });
  }

  return notification;
};

export const deleteAllNotifications = async () => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return;

  const notificationsRef = ref(database, `BANGUS/${uid}/notifications`);
  await remove(notificationsRef);
};
