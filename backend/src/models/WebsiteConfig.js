import mongoose from 'mongoose';

const serviceItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    badge: { type: String, default: '' },
    description: { type: String, required: true },
    icon: { type: String, default: 'Wrench' },
    bgImage: { type: String, default: '' },
    imgPosition: { type: String, default: 'object-right' },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const advantageItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    badge: { type: String, default: '' },
    description: { type: String, required: true },
    icon: { type: String, default: 'Award' },
    bgImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const statItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    subtext: { type: String, default: '' },
  },
  { _id: false }
);

const defaultServices = [
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
];

const defaultAdvantages = [
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
];

const defaultStats = [
  { label: 'Years Experience', value: '20+', subtext: 'Serving Mosali since 2004' },
  { label: 'Bikes Serviced', value: '1,000+', subtext: 'Motorcycles & Scooters' },
  { label: 'Customer Rating', value: '4.9 ★', subtext: 'Trusted by locals' },
  { label: 'Honest Pricing', value: '100%', subtext: 'No hidden charges' },
];

const websiteConfigSchema = new mongoose.Schema(
  {
    // Brand & Identity
    garageName: { type: String, default: 'National Auto Garage' },
    tagline: { type: String, default: 'Two-Wheeler Service & Repair Specialists' },
    logoUrl: { type: String, default: '' },

    // Hero Section
    headlineLine1: { type: String, default: 'COMPLETE BIKE SERVICE &' },
    headlineLine2: { type: String, default: 'ENGINE REPAIR' },
    heroSubtitle: {
      type: String,
      default: 'Expert 2-wheeler mechanics Imran & Naim Pathan at Mosali Chowkdi. Fast general service, engine overhaul, wiring & genuine spare parts.',
    },
    mechanic1Name: { type: String, default: 'Imran Pathan' },
    mechanic1Phone: { type: String, default: '9624844188' },
    mechanic2Name: { type: String, default: 'Naim Pathan' },
    mechanic2Phone: { type: String, default: '8128144350' },
    whatsappPhone: { type: String, default: '9624844188' },
    whatsappInquiryText: {
      type: String,
      default: 'Hello National Auto Garage, I want to inquire about bike service.',
    },

    // Hero Stats (4 cards)
    stats: {
      type: [statItemSchema],
      default: defaultStats,
    },

    // Services (6 Cards)
    services: {
      type: [serviceItemSchema],
      default: defaultServices,
    },

    // Why Choose Us (4 Cards)
    advantages: {
      type: [advantageItemSchema],
      default: defaultAdvantages,
    },

    // Contact & Location
    garageAddressName: { type: String, default: 'National Auto Garage' },
    addressLine1: { type: String, default: 'Near White House Petrol Pump, Mosali Chowkdi' },
    addressLine2: { type: String, default: 'Mosali, Mangrol, Surat - 394421' },
    googleMapsUrl: { type: String, default: 'https://maps.app.goo.gl/skxxbgWa1k7Zrzef9' },
    openingHoursMonSat: { type: String, default: '9:00 AM - 9:00 PM' },
    openingHoursSun: { type: String, default: '9:00 AM - 2:00 PM' },

    // Footer & Extra
    footerAboutText: {
      type: String,
      default: "National Auto Garage is Mosali's premier two-wheeler workshop providing transparent, reliable bike servicing and repairs by Imran & Naim Pathan.",
    },
  },
  { timestamps: true }
);

export const WebsiteConfig = mongoose.model('WebsiteConfig', websiteConfigSchema);
export { defaultServices, defaultAdvantages, defaultStats };
