import { WebsiteConfig, defaultServices, defaultAdvantages, defaultStats } from '../models/WebsiteConfig.js';

export class WebsiteConfigService {
  static async getConfig() {
    let config = await WebsiteConfig.findOne();
    if (!config) {
      config = await WebsiteConfig.create({
        garageName: 'National Auto Garage',
        tagline: 'Two-Wheeler Service & Repair Specialists',
        headlineLine1: 'COMPLETE BIKE SERVICE &',
        headlineLine2: 'ENGINE REPAIR',
        heroSubtitle: 'Expert 2-wheeler mechanics Imran & Naim Pathan at Mosali Chowkdi. Fast general service, engine overhaul, wiring & genuine spare parts.',
        mechanic1Name: 'Imran Pathan',
        mechanic1Phone: '9624844188',
        mechanic2Name: 'Naim Pathan',
        mechanic2Phone: '8128144350',
        whatsappPhone: '9624844188',
        whatsappInquiryText: 'Hello National Auto Garage, I want to inquire about bike service.',
        stats: defaultStats,
        services: defaultServices,
        advantages: defaultAdvantages,
        garageAddressName: 'National Auto Garage',
        addressLine1: 'Near White House Petrol Pump, Mosali Chowkdi',
        addressLine2: 'Mosali, Mangrol, Surat - 394421',
        googleMapsUrl: 'https://maps.app.goo.gl/skxxbgWa1k7Zrzef9',
        openingHoursMonSat: '9:00 AM - 9:00 PM',
        openingHoursSun: '9:00 AM - 2:00 PM',
        footerAboutText: "National Auto Garage is Mosali's premier two-wheeler workshop providing transparent, reliable bike servicing and repairs by Imran & Naim Pathan.",
      });
    }
    return config;
  }

  static async updateConfig(data) {
    const { _id, id, createdAt, updatedAt, __v, ...cleanData } = data;
    let config = await WebsiteConfig.findOne();
    if (!config) {
      config = new WebsiteConfig(cleanData);
    } else {
      Object.assign(config, cleanData);
    }
    await config.save();
    return config;
  }

  static async resetToDefaults() {
    let config = await WebsiteConfig.findOne();
    const defaults = {
      garageName: 'National Auto Garage',
      tagline: 'Two-Wheeler Service & Repair Specialists',
      logoUrl: '',
      headlineLine1: 'COMPLETE BIKE SERVICE &',
      headlineLine2: 'ENGINE REPAIR',
      heroSubtitle: 'Expert 2-wheeler mechanics Imran & Naim Pathan at Mosali Chowkdi. Fast general service, engine overhaul, wiring & genuine spare parts.',
      mechanic1Name: 'Imran Pathan',
      mechanic1Phone: '9624844188',
      mechanic2Name: 'Naim Pathan',
      mechanic2Phone: '8128144350',
      whatsappPhone: '9624844188',
      whatsappInquiryText: 'Hello National Auto Garage, I want to inquire about bike service.',
      stats: defaultStats,
      services: defaultServices,
      advantages: defaultAdvantages,
      garageAddressName: 'National Auto Garage',
      addressLine1: 'Near White House Petrol Pump, Mosali Chowkdi',
      addressLine2: 'Mosali, Mangrol, Surat - 394421',
      googleMapsUrl: 'https://maps.app.goo.gl/skxxbgWa1k7Zrzef9',
      openingHoursMonSat: '9:00 AM - 9:00 PM',
      openingHoursSun: '9:00 AM - 2:00 PM',
      footerAboutText: "National Auto Garage is Mosali's premier two-wheeler workshop providing transparent, reliable bike servicing and repairs by Imran & Naim Pathan.",
    };

    if (!config) {
      config = await WebsiteConfig.create(defaults);
    } else {
      Object.assign(config, defaults);
      await config.save();
    }
    return config;
  }
}
