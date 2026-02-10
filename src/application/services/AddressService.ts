import { PrismaClient } from '@prisma/client';
import { Address } from '@prisma/client';

export interface CreateAddressDTO {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressDTO {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

export class AddressService {
  constructor(private prisma: PrismaClient) {}

  // Get all addresses for a customer
  async getCustomerAddresses(customerId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  // Get address by ID (with ownership check)
  async getAddressById(addressId: string, customerId: string): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: {
        id: addressId,
        customerId,
      },
    });
  }

  // Create new address
  async createAddress(customerId: string, data: CreateAddressDTO): Promise<Address> {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        ...data,
        country: data.country || 'Colombia',
        customerId,
      },
    });
  }

  // Update address
  async updateAddress(
    addressId: string,
    customerId: string,
    data: UpdateAddressDTO
  ): Promise<Address> {
    // Verify ownership
    const existingAddress = await this.getAddressById(addressId, customerId);
    if (!existingAddress) {
      throw new Error('Dirección no encontrada');
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId, isDefault: true, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  // Delete address
  async deleteAddress(addressId: string, customerId: string): Promise<void> {
    // Verify ownership
    const existingAddress = await this.getAddressById(addressId, customerId);
    if (!existingAddress) {
      throw new Error('Dirección no encontrada');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });
  }
}
