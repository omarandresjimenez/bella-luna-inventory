import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StoreService {
  // Get store settings
  async getSettings() {
    const settings = await prisma.storeSettings.findFirst();

    if (!settings) {
      throw new Error('Configuración de tienda no encontrada');
    }

    return {
      storeName: settings.storeName,
      storeEmail: settings.storeEmail,
      storePhone: settings.storePhone,
      storeAddress: settings.storeAddress,
      whatsappNumber: settings.whatsappNumber,
      deliveryFee: Number(settings.deliveryFee),
      freeDeliveryThreshold: settings.freeDeliveryThreshold
        ? Number(settings.freeDeliveryThreshold)
        : null,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
    };
  }

  // Update store settings (admin only)
  async updateSettings(data: {
    storeName?: string;
    storeEmail?: string;
    storePhone?: string;
    storeAddress?: string;
    whatsappNumber?: string;
    deliveryFee?: number;
    freeDeliveryThreshold?: number;
    metaTitle?: string;
    metaDescription?: string;
  }) {
    const settings = await prisma.storeSettings.upsert({
      where: { id: '1' },
      update: data,
      create: {
        id: '1',
        ...data,
      },
    });

    return settings;
  }
}
