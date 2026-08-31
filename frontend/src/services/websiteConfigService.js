import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

export const defaultWebsiteConfig = {
  // Brand & Identity
  garageName: 'National Auto Garage',
  tagline: 'Two-Wheeler Service & Repair Specialists',
  logoUrl: '',

  // Hero Section
  headlineLine1: 'COMPLETE BIKE SERVICE &',
  headlineLine2: 'ENGINE REPAIR',
  heroSubtitle:
    'Expert 2-wheeler mechanics Imran & Naim Pathan at Mosali Chowkdi. Fast general service, engine overhaul, wiring & genuine spare parts.',
  mechanic1Name: 'Imran Pathan',
  mechanic1Phone: '9624844188',
  mechanic2Name: 'Naim Pathan',
  mechanic2Phone: '8128144350',
  whatsappPhone: '9624844188',
  whatsappInquiryText: 'Hello National Auto Garage, I want to inquire about bike service.',

  // Hero Stats (4 cards)
  stats: [
    { label: 'Years Experience', value: '20+', subtext: 'Serving Mosali since 2004' },
    { label: 'Bikes Serviced', value: '1,000+', subtext: 'Motorcycles & Scooters' },
    { label: 'Customer Rating', value: '4.9 ★', subtext: 'Trusted by locals' },
    { label: 'Honest Pricing', value: '100%', subtext: 'No hidden charges' },
  ],

  // Services (6 Cards)
  services: [
    {
      id: 'full-service',
      title: 'Full Bike Service',
      badge: 'Popular',
      description: 'Complete bike checkup, fresh engine oil change, and carburetor wash.',
      icon: 'Wrench',
      bgImage: '',
      imgPosition: 'object-[100%_18%]',
      isActive: true,
    },
    {
      id: 'engine-repair',
      title: 'Engine Repair & Tuning',
      badge: 'Specialist',
      description: 'Engine rebuilding, fixing white smoke, piston work, and smooth pickup.',
      icon: 'Flame',
      bgImage: '',
      imgPosition: 'object-[100%_18%]',
      isActive: true,
    },
    {
      id: 'brakes-suspension',
      title: 'Brakes & Shocker Service',
      badge: '',
      description: 'New brake shoes, disc pads, front fork oil seal, and smooth shockers.',
      icon: 'Disc',
      bgImage: '',
      imgPosition: 'object-[100%_18%]',
      isActive: true,
    },
    {
      id: 'wiring-battery',
      title: 'Wiring & Battery Check',
      badge: '',
      description: 'Starter motor repair, battery testing, indicator lights, and wiring fix.',
      icon: 'Zap',
      bgImage: '',
      imgPosition: 'object-right',
      isActive: true,
    },
    {
      id: 'chain-gears',
      title: 'Chain & Gear System',
      badge: '',
      description: 'Smooth gear shift, new chain sprocket set, and clutch cable change.',
      icon: 'Layers',
      bgImage: '',
      imgPosition: 'object-right',
      isActive: true,
    },
    {
      id: 'genuine-spares',
      title: 'Original Spare Parts',
      badge: '100% Original',
      description: '100% authentic OEM parts, premium Castrol/Motul engine oils, and certified filters.',
      icon: 'Shield',
      bgImage: '',
      imgPosition: 'object-[100%_25%]',
      isActive: true,
    },
  ],

  // Why Choose Us (4 Cards)
  advantages: [
    {
      id: 'exp',
      title: '20+ Years Experience',
      badge: 'Master Mechanics',
      description: 'Imran and Naim Pathan have over 20 years of hands-on experience fixing all bikes and scooters.',
      icon: 'Award',
      bgImage: '',
      isActive: true,
    },
    {
      id: 'parts',
      title: 'Original Spare Parts',
      badge: '100% Genuine',
      description: 'We only fit 100% original company parts and trusted high-grade engine oil in every service.',
      icon: 'ShieldCheck',
      bgImage: '',
      isActive: true,
    },
    {
      id: 'fast',
      title: 'Fast Same-Day Service',
      badge: 'Quick Delivery',
      description: 'Quick oil change, general tuneup, and minor repairs finished efficiently on the same day.',
      icon: 'Zap',
      bgImage: '',
      isActive: true,
    },
    {
      id: 'bill',
      title: 'Clear & Honest Bills',
      badge: 'Transparent',
      description: 'No hidden charges or extra fees. Get a clear digital bill directly sent to your WhatsApp.',
      icon: 'ThumbsUp',
      bgImage: '',
      isActive: true,
    },
  ],

  // Contact & Location
  garageAddressName: 'National Auto Garage',
  addressLine1: 'Near White House Petrol Pump, Mosali Chowkdi',
  addressLine2: 'Mosali, Mangrol, Surat - 394421',
  googleMapsUrl: 'https://maps.app.goo.gl/skxxbgWa1k7Zrzef9',
  openingHoursMonSat: '9:00 AM - 9:00 PM',
  openingHoursSun: '9:00 AM - 2:00 PM',

  // Footer & Extra
  footerAboutText:
    "National Auto Garage is Mosali's premier two-wheeler workshop providing transparent, reliable bike servicing and repairs by Imran & Naim Pathan.",
};

export const WebsiteConfigService = {
  async getConfig() {
    try {
      const configRef = doc(db, 'website_config', 'global');
      const snap = await getDoc(configRef);
      if (snap && snap.exists()) {
        return { ...defaultWebsiteConfig, ...snap.data() };
      }
      try {
        await setDoc(configRef, defaultWebsiteConfig, { merge: true });
      } catch (e) {}
      return defaultWebsiteConfig;
    } catch (e) {
      return defaultWebsiteConfig;
    }
  },

  async updateConfig(newConfig) {
    try {
      const configRef = doc(db, 'website_config', 'global');
      const updated = {
        ...newConfig,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(configRef, updated, { merge: true });
      return { ...defaultWebsiteConfig, ...updated };
    } catch (e) {
      return { ...defaultWebsiteConfig, ...newConfig };
    }
  },

  async resetToDefaults() {
    try {
      const configRef = doc(db, 'website_config', 'global');
      await setDoc(configRef, defaultWebsiteConfig);
      return defaultWebsiteConfig;
    } catch (e) {
      return defaultWebsiteConfig;
    }
  },
};
