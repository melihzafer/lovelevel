/**
 * Notification Utilities
 * Handles notification scheduling, permission management, and service worker integration
 */

import { getNextMonthiversary, isMonthiversary, daysBetween } from './dateUtils';
import * as db from './db';

export interface NotificationSchedule {
  type: 'monthiversary' | 'reminder';
  scheduledFor: Date;
  title: string;
  body: string;
  tag: string;
}

/**
 * Check if notifications are supported in the current browser
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  
  // Update settings in database
  await db.updateSettings({
    notificationsEnabled: permission === 'granted',
    notificationPermission: permission,
  });

  return permission;
}

/**
 * Show a test notification
 */
export async function showTestNotification(): Promise<void> {
  if (getNotificationPermission() !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification('LoveLevel 💕', {
    body: 'Notifications are working! You\'ll receive monthiversary reminders.',
    icon: '/lovelevel/icons/icon-192.png',
    badge: '/lovelevel/icons/icon-192-maskable.png',
    tag: 'test-notification',
    data: {
      url: '/lovelevel/',
      type: 'test',
    },
  });
}

/**
 * Check if today is a monthiversary and show notification
 */
export async function checkAndNotifyMonthiversary(): Promise<boolean> {
  if (getNotificationPermission() !== 'granted') {
    return false;
  }

  const settings = await db.getSettings();
  const startDate = new Date(settings.relationshipStartDate);
  const today = new Date();

  if (isMonthiversary(startDate, today)) {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification('Happy Monthiversary! 💕', {
      body: settings.messageTemplate || 'Another month of love together!',
      icon: '/lovelevel/icons/icon-192.png',
      badge: '/lovelevel/icons/icon-192-maskable.png',
      tag: 'monthiversary',
      requireInteraction: true,
      data: {
        url: '/lovelevel/',
        type: 'monthiversary',
      },
    });

    return true;
  }

  return false;
}

/**
 * Schedule a reminder notification for upcoming monthiversary
 */
export async function scheduleMonthiversaryReminder(): Promise<void> {
  if (getNotificationPermission() !== 'granted') {
    return;
  }

  const settings = await db.getSettings();
  const startDate = new Date(settings.relationshipStartDate);
  const today = new Date();
  const nextMonthiversary = getNextMonthiversary(startDate, today);
  const daysUntil = daysBetween(today, nextMonthiversary);

  // Show reminder 1 day before
  if (daysUntil === 1) {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification('Monthiversary Tomorrow! 💝', {
      body: 'Your special day is coming up tomorrow. Plan something special!',
      icon: '/lovelevel/icons/icon-192.png',
      badge: '/lovelevel/icons/icon-192-maskable.png',
      tag: 'monthiversary-reminder',
      data: {
        url: '/lovelevel/challenges',
        type: 'reminder',
      },
    });
  }
}

/**
 * Get upcoming notification schedule
 */
export async function getUpcomingNotifications(): Promise<NotificationSchedule[]> {
  const settings = await db.getSettings();
  const startDate = new Date(settings.relationshipStartDate);
  const today = new Date();
  const nextMonthiversary = getNextMonthiversary(startDate, today);
  const daysUntil = daysBetween(today, nextMonthiversary);

  const schedule: NotificationSchedule[] = [];

  // Reminder notification (1 day before)
  if (daysUntil > 1) {
    const reminderDate = new Date(nextMonthiversary);
    reminderDate.setDate(reminderDate.getDate() - 1);
    
    schedule.push({
      type: 'reminder',
      scheduledFor: reminderDate,
      title: 'Monthiversary Tomorrow! 💝',
      body: 'Your special day is coming up tomorrow',
      tag: 'monthiversary-reminder',
    });
  }

  // Monthiversary notification
  schedule.push({
    type: 'monthiversary',
    scheduledFor: nextMonthiversary,
    title: 'Happy Monthiversary! 💕',
    body: settings.messageTemplate || 'Another month of love together!',
    tag: 'monthiversary',
  });

  return schedule;
}

/**
 * Initialize notification system
 * Call this on app startup to set up notification checking
 */
export async function initializeNotifications(): Promise<void> {
  if (!isNotificationSupported()) {
    return;
  }

  const settings = await db.getSettings();
  
  if (!settings.notificationsEnabled) {
    return;
  }

  // Check for monthiversary on app startup
  await checkAndNotifyMonthiversary();
  
  // Schedule reminder check
  await scheduleMonthiversaryReminder();

  // Set up periodic check (once per day at midnight)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    checkAndNotifyMonthiversary();
    scheduleMonthiversaryReminder();
    
    // Set up daily interval
    setInterval(() => {
      checkAndNotifyMonthiversary();
      scheduleMonthiversaryReminder();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }, msUntilMidnight);
}
