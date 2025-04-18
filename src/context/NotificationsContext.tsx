import { createContext, useContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { database } from "../config/firebase";
import { requestNotificationPermission } from "../utils/notifications";

export interface Notification {
  id: string;
  type: string;
  message: string;
  details: any;
  timestamp: number;
  read: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  hasPermission: false,
  requestPermission: async () => false,
});

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check notification permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const permission = await requestNotificationPermission();
      setHasPermission(permission);
    };
    
    checkPermission();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setNotifications([]);
        return;
      }

      const notificationsRef = query(
        ref(database, `BANGUS/${user.uid}/notifications`),
        orderByChild("timestamp")
      );

      const notificationsListener = onValue(notificationsRef, (snapshot) => {
        const notificationsData: Notification[] = [];
        let unread = 0;

        snapshot.forEach((childSnapshot) => {
          const notification = {
            id: childSnapshot.key as string,
            ...childSnapshot.val(),
          };
          
          notificationsData.push(notification);
          if (!notification.read) {
            unread++;
          }
        });

        // Sort by timestamp descending (newest first)
        notificationsData.sort((a, b) => b.timestamp - a.timestamp);
        
        setNotifications(notificationsData);
        setUnreadCount(unread);
      });

      return () => {
        notificationsListener();
      };
    });

    return () => unsubscribe();
  }, []);

  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    setHasPermission(permission);
    return permission;
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        hasPermission,
        requestPermission,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
