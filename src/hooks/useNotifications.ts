import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TEMPLATES,
} from "@/constants/notifications";

export interface Notification {
  id: string;
  type: (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  group_id?: string;
  related_user_id?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Notifications are currently empty - will be implemented when notifications table is added

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);

    // TODO: Set up notifications table in Supabase
    // For now, show empty notifications instead of mock data
    setNotifications([]);
    setUnreadCount(0);
    setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
