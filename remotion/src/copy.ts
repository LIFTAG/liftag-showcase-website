export type Locale = 'en' | 'sk';

export type ReelCopy = {
  protocol: string;
  line1: string;
  line2: string;
  refresh: string;
  product: string;
  productParts: readonly [string, string, string];
  libraryParts: readonly [string, string];
  tagline: string;
  productTracking: string;
};

export const COPY: Record<Locale, ReelCopy> = {
  en: {
    protocol: 'LIFTAG  //  SITE.01',
    line1: 'THE SITE',
    line2: 'GOT A',
    refresh: 'REFRESH',
    product: 'SCAN  ·  LOG  ·  PROGRESS',
    productParts: ['SCAN', 'LOG', 'PROGRESS'],
    libraryParts: ['EVERY LIFT', 'ON THE WEB'],
    tagline: 'FOR LIFTERS.  BY LIFTERS.',
    productTracking: '0.2em',
  },
  sk: {
    protocol: 'LIFTAG  //  SITE.01',
    line1: 'WEB',
    line2: 'DOSTAL',
    refresh: 'REFRESH',
    product: 'SKENUJ  ·  ZALOGUJ  ·  SLEDUJ',
    productParts: ['SKENUJ', 'ZALOGUJ', 'SLEDUJ'],
    libraryParts: ['KAŽDÝ CVÍK', 'NA WEBE'],
    tagline: 'PRE LIFTEROV.  OD LIFTEROV.',
    productTracking: '0.12em',
  },
};
