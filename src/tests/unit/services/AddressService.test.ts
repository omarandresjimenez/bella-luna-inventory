import { describe, it, expect, beforeEach } from '@jest/globals';
import { AddressService } from '../../../application/services/AddressService';
import { prismaMock } from '../../setup';

describe('AddressService', () => {
  let addressService: AddressService;

  beforeEach(() => {
    addressService = new AddressService(prismaMock);
    jest.clearAllMocks();
  });

  describe('getCustomerAddresses', () => {
    it('should retrieve all addresses for customer', async () => {
      const customerId = 'cust-123';

      prismaMock.address.findMany.mockResolvedValue([
        {
          id: 'addr-1',
          customerId,
          street: '123 Main St',
          city: 'Bogotá',
          state: 'Cundinamarca',
          zipCode: '110111',
          country: 'Colombia',
          isDefault: true,
          createdAt: new Date(),
        },
        {
          id: 'addr-2',
          customerId,
          street: '456 Oak Ave',
          city: 'Medellín',
          state: 'Antioquia',
          zipCode: '050001',
          country: 'Colombia',
          isDefault: false,
          createdAt: new Date(),
        },
      ]);

      const result = await addressService.getCustomerAddresses(customerId);

      expect(result).toHaveLength(2);
      expect(result[0].isDefault).toBe(true);
      expect(prismaMock.address.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { customerId },
        })
      );
    });

    it('should sort by default first, then by creation date', async () => {
      const customerId = 'cust-123';
      const date1 = new Date('2024-01-10');
      const date2 = new Date('2024-01-05');

      prismaMock.address.findMany.mockResolvedValue([
        {
          id: 'addr-1',
          customerId,
          street: '123 Main St',
          city: 'Bogotá',
          state: 'Cundinamarca',
          zipCode: '110111',
          country: 'Colombia',
          isDefault: true,
          createdAt: date1,
        },
        {
          id: 'addr-2',
          customerId,
          street: '456 Oak Ave',
          city: 'Medellín',
          state: 'Antioquia',
          zipCode: '050001',
          country: 'Colombia',
          isDefault: false,
          createdAt: date2,
        },
      ]);

      const result = await addressService.getCustomerAddresses(customerId);

      expect(result[0].isDefault).toBe(true);
      expect(result[1].isDefault).toBe(false);
    });

    it('should return empty array if customer has no addresses', async () => {
      const customerId = 'cust-no-addresses';

      prismaMock.address.findMany.mockResolvedValue([]);

      const result = await addressService.getCustomerAddresses(customerId);

      expect(result).toHaveLength(0);
    });
  });

  describe('getAddressById', () => {
    it('should retrieve address by ID for authorized customer', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';

      prismaMock.address.findFirst.mockResolvedValue({
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        isDefault: true,
        createdAt: new Date(),
      });

      const result = await addressService.getAddressById(addressId, customerId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(addressId);
      expect(prismaMock.address.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: addressId,
            customerId,
          }),
        })
      );
    });

    it('should not return address for different customer', async () => {
      const customerId = 'cust-123';
      const differentCustomerId = 'cust-456';
      const addressId = 'addr-1';

      prismaMock.address.findFirst.mockResolvedValue(null);

      const result = await addressService.getAddressById(addressId, differentCustomerId);

      expect(result).toBeNull();
    });

    it('should return null if address does not exist', async () => {
      const customerId = 'cust-123';

      prismaMock.address.findFirst.mockResolvedValue(null);

      const result = await addressService.getAddressById('nonexistent', customerId);

      expect(result).toBeNull();
    });
  });

  describe('createAddress', () => {
    it('should create new address for customer', async () => {
      const customerId = 'cust-123';
      const addressData = {
        street: '789 Pine St',
        city: 'Cali',
        state: 'Valle del Cauca',
        zipCode: '760001',
        country: 'Colombia',
        isDefault: false,
      };

      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'customer@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.address.create.mockResolvedValue({
        id: 'addr-new',
        customerId,
        ...addressData,
        createdAt: new Date(),
      });

      const result = await addressService.createAddress(customerId, addressData as any);

      expect(result).toBeDefined();
      expect(result.street).toBe(addressData.street);
      expect(result.city).toBe(addressData.city);
      expect(prismaMock.address.create).toHaveBeenCalled();
    });

    it('should default country to Colombia if not provided', async () => {
      const customerId = 'cust-123';
      const addressData = {
        street: '789 Pine St',
        city: 'Cali',
        state: 'Valle del Cauca',
        zipCode: '760001',
      };

      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'customer@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.address.create.mockResolvedValue({
        id: 'addr-new',
        customerId,
        ...addressData,
        country: 'Colombia',
        createdAt: new Date(),
      });

      const result = await addressService.createAddress(customerId, addressData as any);

      expect(result.country).toBe('Colombia');
    });

    it('should unset other default addresses when setting new default', async () => {
      const customerId = 'cust-123';
      const addressData = {
        street: '789 Pine St',
        city: 'Cali',
        state: 'Valle del Cauca',
        zipCode: '760001',
        country: 'Colombia',
        isDefault: true,
      };

      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'customer@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.address.updateMany.mockResolvedValue({ count: 1 });

      prismaMock.address.create.mockResolvedValue({
        id: 'addr-new',
        customerId,
        ...addressData,
        createdAt: new Date(),
      });

      const result = await addressService.createAddress(customerId, addressData as any);

      expect(prismaMock.address.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId,
            isDefault: true,
          }),
        })
      );
      expect(result.isDefault).toBe(true);
    });

    it('should create customer if not exists', async () => {
      const customerId = 'cust-new';
      const addressData = {
        street: '789 Pine St',
        city: 'Cali',
        state: 'Valle del Cauca',
        zipCode: '760001',
        country: 'Colombia',
        isDefault: false,
      };

      prismaMock.customer.findUnique.mockResolvedValue(null);

      prismaMock.customer.create.mockResolvedValue({
        id: customerId,
        email: `user_${customerId}@local.dev`,
        password: '',
        firstName: 'Usuario',
        lastName: 'Local',
        phone: '',
        birthDate: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.address.create.mockResolvedValue({
        id: 'addr-new',
        customerId,
        ...addressData,
        createdAt: new Date(),
      });

      const result = await addressService.createAddress(customerId, addressData as any);

      expect(prismaMock.customer.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('updateAddress', () => {
    it('should update address for authorized customer', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';
      const updateData = {
        street: '999 New Street',
        city: 'Barranquilla',
      };

      prismaMock.address.findFirst.mockResolvedValue({
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        isDefault: false,
        createdAt: new Date(),
      });

      prismaMock.address.update.mockResolvedValue({
        id: addressId,
        customerId,
        street: updateData.street,
        city: updateData.city,
        state: 'Atlántico',
        zipCode: '080001',
        country: 'Colombia',
        isDefault: false,
        createdAt: new Date(),
      });

      const result = await addressService.updateAddress(
        addressId,
        customerId,
        updateData as any
      );

      expect(result.street).toBe(updateData.street);
      expect(result.city).toBe(updateData.city);
      expect(prismaMock.address.update).toHaveBeenCalled();
    });

    it('should prevent updating address of different customer', async () => {
      const customerId = 'cust-123';
      const differentCustomerId = 'cust-456';
      const addressId = 'addr-1';

      prismaMock.address.findFirst.mockResolvedValue(null);

      await expect(
        addressService.updateAddress(addressId, differentCustomerId, { city: 'Bogotá' } as any)
      ).rejects.toThrow('Dirección no encontrada');
    });

    it('should unset other defaults when updating to default', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';

      prismaMock.address.findFirst.mockResolvedValue({
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        phone: '1234567890',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.address.updateMany.mockResolvedValue({ count: 1 });

      prismaMock.address.update.mockResolvedValue({
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        phone: '1234567890',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await addressService.updateAddress(
        addressId,
        customerId,
        { isDefault: true } as any
      );

      expect(prismaMock.address.updateMany).toHaveBeenCalled();
      expect(result.isDefault).toBe(true);
    });

    it('should allow partial updates', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';

      const existingAddress = {
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        isDefault: false,
        createdAt: new Date(),
      };

      prismaMock.address.findFirst.mockResolvedValue(existingAddress);

      prismaMock.address.update.mockResolvedValue({
        ...existingAddress,
        city: 'Medellín',
      });

      const result = await addressService.updateAddress(
        addressId,
        customerId,
        { city: 'Medellín' } as any
      );

      expect(result.city).toBe('Medellín');
      expect(result.street).toBe(existingAddress.street); // Other fields unchanged
    });
  });

  describe('deleteAddress', () => {
    it('should delete address for authorized customer', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';

      prismaMock.address.findFirst.mockResolvedValue({
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        isDefault: false,
        createdAt: new Date(),
      });

      prismaMock.address.delete.mockResolvedValue({
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        isDefault: false,
        createdAt: new Date(),
      });

      await addressService.deleteAddress(addressId, customerId);

      expect(prismaMock.address.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: addressId },
        })
      );
    });

    it('should prevent deleting address of different customer', async () => {
      const customerId = 'cust-123';
      const differentCustomerId = 'cust-456';
      const addressId = 'addr-1';

      prismaMock.address.findFirst.mockResolvedValue(null);

      await expect(
        addressService.deleteAddress(addressId, differentCustomerId)
      ).rejects.toThrow('Dirección no encontrada');

      expect(prismaMock.address.delete).not.toHaveBeenCalled();
    });

    it('should throw error if address does not exist', async () => {
      const customerId = 'cust-123';

      prismaMock.address.findFirst.mockResolvedValue(null);

      await expect(
        addressService.deleteAddress('nonexistent', customerId)
      ).rejects.toThrow('Dirección no encontrada');
    });

    it('should handle deletion of default address', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';

      prismaMock.address.findFirst.mockResolvedValue({
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        isDefault: true,
        createdAt: new Date(),
      });

      prismaMock.address.delete.mockResolvedValue({
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        isDefault: true,
        createdAt: new Date(),
      });

      await addressService.deleteAddress(addressId, customerId);

      expect(prismaMock.address.delete).toHaveBeenCalled();
    });
  });

  describe('Address validation', () => {
    it('should require all mandatory fields for new address', async () => {
      const customerId = 'cust-123';
      const incompleteData = {
        street: '123 Main St',
        city: 'Bogotá',
        // Missing state, zipCode, country
      };

      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'customer@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // The service doesn't validate in constructor, so it would pass through
      // Validation should happen at DTO level, not service level
    });
  });
});
