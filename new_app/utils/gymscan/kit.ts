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

export function validateKit(fields: KitFields): KitErrors {
  const errors: KitErrors = {};
  for (const key of ["name", "gym", "city"] as const) {
    if (!fields[key].trim())
      errors[key] =
        `Enter ${key === "name" ? "your name" : key === "gym" ? "your gym name" : "your city"}.`;
    else if (fields[key].trim().length > KIT_LIMITS[key])
      errors[key] = `Use ${KIT_LIMITS[key]} characters or fewer.`;
  }
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) ||
    fields.email.length > 254
  )
    errors.email = "Enter a valid email address.";
  if (
    fields.equipment.trim() &&
    (!/^\d+$/.test(fields.equipment.trim()) ||
      Number(fields.equipment) < 1 ||
      Number(fields.equipment) > 10000)
  )
    errors.equipment = "Enter a whole number from 1 to 10,000.";
  if (fields.notes.length > 2000)
    errors.notes = "Use 2,000 characters or fewer.";
  return errors;
}

/** Keep the existing public contact contract; gym context belongs in message. */
export function kitContactPayload(fields: KitFields, turnstileToken: string) {
  return {
    name: fields.name.trim(),
    email: fields.email.trim(),
    subject: "Gym partnership inquiry",
    message: [
      "Free LIFTAG kit request",
      `Gym: ${fields.gym.trim()}`,
      `City: ${fields.city.trim()}`,
      `Equipment count: ${fields.equipment.trim() || "Not provided"}`,
      `Notes: ${fields.notes.trim() || "Not provided"}`,
    ].join("\n"),
    turnstileToken,
  };
}
