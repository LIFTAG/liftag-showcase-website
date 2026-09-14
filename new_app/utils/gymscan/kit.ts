import type { SiteLocale } from '../../types/locale'
import { gymDemoMessages } from '../../i18n/messages/gymDemo.ts'

export interface KitFields {
  name: string;
  email: string;
  gym: string;
  city: string;
  equipment: string;
  notes: string;
}
export type KitErrors = Partial<Record<keyof KitFields, string>>;
export const KIT_LIMITS = {
  name: 120,
  email: 254,
  gym: 160,
  city: 120,
} as const;

export function validateKit(fields: KitFields, locale: SiteLocale = 'en'): KitErrors {
  const copy = gymDemoMessages(locale).kit
  const errors: KitErrors = {};
  for (const key of ["name", "gym", "city"] as const) {
    if (!fields[key].trim())
      errors[key] = copy.required[key === 'name' ? 'name' : key === 'gym' ? 'gym' : 'city'];
    else if (fields[key].trim().length > KIT_LIMITS[key])
      errors[key] = copy.maxLength.replace('{max}', String(KIT_LIMITS[key]));
  }
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) ||
    fields.email.length > 254
  )
    errors.email = copy.emailError;
  if (
    fields.equipment.trim() &&
    (!/^\d+$/.test(fields.equipment.trim()) ||
      Number(fields.equipment) < 1 ||
      Number(fields.equipment) > 10000)
  )
    errors.equipment = copy.equipment;
  if (fields.notes.length > 2000)
    errors.notes = copy.notes;
  return errors;
}

/** Keep the existing public contact contract; gym context belongs in message. */
export function kitContactPayload(fields: KitFields, turnstileToken: string) {
  return {
    name: fields.name.trim(),
    email: fields.email.trim(),
    subject: "Gym partnership inquiry",
    message: [
      "Gym partnership request",
      `Gym: ${fields.gym.trim()}`,
      `City: ${fields.city.trim()}`,
      `Equipment count: ${fields.equipment.trim() || "Not provided"}`,
      `Notes: ${fields.notes.trim() || "Not provided"}`,
    ].join("\n"),
    turnstileToken,
  };
}
