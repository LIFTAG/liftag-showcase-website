/**
 * What “NFC tags and QR codes are free” means on this site.
 * Software is free. Physical stickers and chips are not.
 */
export const NFC_QR_FREE_SOFTWARE =
  'Creating and managing NFC tags and QR codes is free. Gym owners get the dashboard to set them up, and members get the full LIFTAG app.'

export const NFC_QR_HARDWARE_SELF_BUY =
  'LIFTAG does not buy or ship the physical NFC tags or QR stickers. Gyms purchase those themselves.'

export const NFC_QR_FREE_MEANS = `${NFC_QR_FREE_SOFTWARE} ${NFC_QR_HARDWARE_SELF_BUY}`

export const NFC_QR_HARDWARE_FAQ = {
  question: 'Are NFC tags and QR codes free?',
  answer: NFC_QR_FREE_MEANS,
} as const
