import type { BacklogItem } from '../types';
/** Web implementation; replace this adapter with Capacitor LocalNotifications in native builds. */
export const notifications={async requestPermission(){if(!('Notification'in window))return 'unsupported';return Notification.requestPermission()},scheduleAssignmentReminder(item:BacklogItem){if(!item.dueDate)return null;const reminder=new Date(item.dueDate);reminder.setDate(reminder.getDate()-7);return reminder.toISOString().slice(0,10)},cancelAssignmentReminder(_id:string){/* native adapter hook */}};
