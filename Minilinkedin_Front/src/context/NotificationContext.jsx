import React, { createContext, useCallback, useEffect, useState } from "react";
import notificationService from "../services/notificationService";
import { useAuth } from "../hooks/useAuth";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeError = (err) => {
    return (
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "Erreur"
    );
  };

  const normalizeNotification = (notif) => ({
    ...notif,
    notificationId: notif.notificationId ?? notif.id ?? null,
    createdAt: notif.createdAt ?? notif.createdOn ?? null,
    isRead: Boolean(notif.isRead ?? notif.read ?? false),
  });

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await notificationService.getMyNotifications();
      const normalized = (data || []).map(normalizeNotification);
      setNotifications(normalized);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id) => {
    if (!id) return;

    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    } catch (err) {
      setError(normalizeError(err));
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    if (!id) return;

    try {
      await notificationService.markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === id
            ? { ...n, isRead: true }
            : n
        )
      );
    } catch (err) {
      setError(normalizeError(err));
    }
  }, []);

  const value = {
    notifications,
    loading,
    error,
    fetchNotifications,
    deleteNotification,
    markAsRead,
    setError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};