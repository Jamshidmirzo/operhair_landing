/**
 * Real app screenshots, in the order they appear in each app's flow.
 * Keys double as i18n keys under `forClients.screens.items` /
 * `forBarbers.screens.items`.
 */

export const CLIENT_SCREENS = [
  { key: "home", src: "/app-screens/client/home.png" },
  { key: "barberProfile", src: "/app-screens/client/barber-profile.png" },
  { key: "quickBooking", src: "/app-screens/client/quick-booking.png" },
  { key: "myBookings", src: "/app-screens/client/my-bookings.png" },
  { key: "editProfile", src: "/app-screens/client/edit-profile.png" },
  { key: "settings", src: "/app-screens/client/settings.png" },
  { key: "language", src: "/app-screens/client/language.png" },
] as const;

export const PRO_SCREENS = [
  { key: "calendar", src: "/app-screens/pro/calendar.png" },
  { key: "appointment", src: "/app-screens/pro/appointment.png" },
  { key: "newClient", src: "/app-screens/pro/new-client.png" },
  { key: "workingSchedule", src: "/app-screens/pro/working-schedule.png" },
  { key: "newService", src: "/app-screens/pro/new-service.png" },
  { key: "profile", src: "/app-screens/pro/profile.png" },
  { key: "language", src: "/app-screens/pro/language.png" },
] as const;

/** Width / height of each app's screenshots. */
export const CLIENT_SCREEN_RATIO = 1290 / 2796;
export const PRO_SCREEN_RATIO = 1440 / 2880;

export const STORE_LINKS = {
  hayrli: {
    apple: "https://apps.apple.com/uz/app/hayrli/id6782782767",
    google: "https://play.google.com/store/apps/details?id=flek.hayrli.app",
  },
  pro: {
    apple: "https://apps.apple.com/uz/app/hayrli-pro/id6778512406",
    google: "https://play.google.com/store/apps/details?id=flek.hayrli.pro.app",
  },
} as const;
