import { describe, it, expect, beforeEach } from '@jest/globals';
import { AddressController } from '../../../interface/controllers/AddressController';
import { createMockRequest, createMockResponse } from '../../test-utils';

// Mock dependencies
jest.mock('../../../application/services/AddressService');

describe('AddressController', () => {
  let addressController: AddressController;
  let mockAddressService: any;

  beforeEach(() => {
    mockAddressService = {
      getCustomerAddresses: jest.fn(),
      getAddressById: jest.fn(),
      createAddress: jest.fn(),
      updateAddress: jest.fn(),
      deleteAddress: jest.fn(),
    };

    addressController = new AddressController(mockAddressService);
    jest.clearAllMocks();
  });

  describe('getAddresses', () => {
    it('should retrieve all customer addresses', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockAddressService.getCustomerAddresses.mockResolvedValue([
        {
          id: 'addr-1',
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
        },
        {
          id: 'addr-2',
          customerId,
          street: '456 Oak Ave',
          city: 'Medellín',
          state: 'Antioquia',
          zipCode: '050001',
          country: 'Colombia',
          phone: '9876543210',
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      await addressController.getAddresses(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockAddressService.getCustomerAddresses).toHaveBeenCalledWith(customerId);
    });

    it('should return empty array if no addresses', async () => {
      const customerId = 'cust-no-addresses';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockAddressService.getCustomerAddresses.mockResolvedValue([]);

      await addressController.getAddresses(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockAddressService.getCustomerAddresses.mockRejectedValue(
        new Error('Database error')
      );

      await addressController.getAddresses(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAddressById', () => {
    it('should retrieve specific address', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        params: { id: addressId },
      });
      const res = createMockResponse();

      mockAddressService.getAddressById.mockResolvedValue({
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

      await addressController.getAddressById(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockAddressService.getAddressById).toHaveBeenCalledWith(addressId, customerId);
    });

    it('should return 404 if address not found', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        params: { id: 'nonexistent' },
      });
      const res = createMockResponse();

      mockAddressService.getAddressById.mockResolvedValue(null);

      await addressController.getAddressById(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should verify customer ownership', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-different', role: 'CUSTOMER' },
        params: { id: 'addr-1' },
      });
      const res = createMockResponse();

      mockAddressService.getAddressById.mockResolvedValue(null);

      await addressController.getAddressById(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createAddress', () => {
    it('should create new address with valid data', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        body: {
          street: '789 Pine St',
          city: 'Cali',
          state: 'Valle del Cauca',
          zipCode: '760001',
          country: 'Colombia',
          phone: '5551234567',
          isDefault: false,
        },
      });
      const res = createMockResponse();

      mockAddressService.createAddress.mockResolvedValue({
        id: 'addr-new',
        customerId,
        street: '789 Pine St',
        city: 'Cali',
        state: 'Valle del Cauca',
        zipCode: '760001',
        country: 'Colombia',
        phone: '5551234567',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await addressController.createAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockAddressService.createAddress).toHaveBeenCalledWith(
        customerId,
        expect.objectContaining({
          street: '789 Pine St',
          city: 'Cali',
          state: 'Valle del Cauca',
          zipCode: '760001',
        })
      );
    });

    it('should return 400 on validation error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          street: '789 Pine St',
          // Missing required fields
        },
      });
      const res = createMockResponse();

      await addressController.createAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate postal code format', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          street: '789 Pine St',
          city: 'Cali',
          state: 'Valle del Cauca',
          zipCode: '123', // Invalid: too short
          country: 'Colombia',
          phone: '5551234567',
        },
      });
      const res = createMockResponse();

      await addressController.createAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          street: '789 Pine St',
          city: 'Cali',
          state: 'Valle del Cauca',
          zipCode: '760001',
          country: 'Colombia',
          phone: '5551234567',
        },
      });
      const res = createMockResponse();

      mockAddressService.createAddress.mockRejectedValue(
        new Error('Database error')
      );

      await addressController.createAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateAddress', () => {
    it('should update address with valid data', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        params: { id: addressId },
        body: {
          city: 'Medellín',
          state: 'Antioquia',
        },
      });
      const res = createMockResponse();

      mockAddressService.updateAddress.mockResolvedValue({
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Medellín',
        state: 'Antioquia',
        zipCode: '110111',
        country: 'Colombia',
        phone: '1234567890',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await addressController.updateAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockAddressService.updateAddress).toHaveBeenCalledWith(
        addressId,
        customerId,
        expect.objectContaining({
          city: 'Medellín',
          state: 'Antioquia',
        })
      );
    });

    it('should support partial updates', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        params: { id: addressId },
        body: {
          phone: '9876543210',
        },
      });
      const res = createMockResponse();

      mockAddressService.updateAddress.mockResolvedValue({
        id: addressId,
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        phone: '9876543210',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await addressController.updateAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if address not found', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        params: { id: 'nonexistent' },
        body: { city: 'Bogotá' },
      });
      const res = createMockResponse();

      mockAddressService.updateAddress.mockRejectedValue(
        new Error('Dirección no encontrada')
      );

      await addressController.updateAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should verify customer ownership before updating', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-different', role: 'CUSTOMER' },
        params: { id: 'addr-1' },
        body: { city: 'Bogotá' },
      });
      const res = createMockResponse();

      mockAddressService.updateAddress.mockRejectedValue(
        new Error('Dirección no encontrada')
      );

      await addressController.updateAddress(req as any, res);

      expect(mockAddressService.updateAddress).toHaveBeenCalledWith(
        'addr-1',
        'cust-different',
        expect.any(Object)
      );
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        params: { id: 'addr-1' },
        body: { city: 'Bogotá' },
      });
      const res = createMockResponse();

      mockAddressService.updateAddress.mockRejectedValue(
        new Error('Database error')
      );

      await addressController.updateAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteAddress', () => {
    it('should delete address', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        params: { id: addressId },
      });
      const res = createMockResponse();

      mockAddressService.deleteAddress.mockResolvedValue(undefined);

      await addressController.deleteAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockAddressService.deleteAddress).toHaveBeenCalledWith(addressId, customerId);
    });

    it('should return 404 if address not found', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        params: { id: 'nonexistent' },
      });
      const res = createMockResponse();

      mockAddressService.deleteAddress.mockRejectedValue(
        new Error('Dirección no encontrada')
      );

      await addressController.deleteAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should verify customer ownership before deletion', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-different', role: 'CUSTOMER' },
        params: { id: 'addr-1' },
      });
      const res = createMockResponse();

      mockAddressService.deleteAddress.mockRejectedValue(
        new Error('Dirección no encontrada')
      );

      await addressController.deleteAddress(req as any, res);

      expect(mockAddressService.deleteAddress).toHaveBeenCalledWith('addr-1', 'cust-different');
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        params: { id: 'addr-1' },
      });
      const res = createMockResponse();

      mockAddressService.deleteAddress.mockRejectedValue(
        new Error('Database error')
      );

      await addressController.deleteAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Address default management', () => {
    it('should set address as default', async () => {
      const customerId = 'cust-123';
      const addressId = 'addr-1';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        params: { id: addressId },
        body: { isDefault: true },
      });
      const res = createMockResponse();

      mockAddressService.updateAddress.mockResolvedValue({
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

      await addressController.updateAddress(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isDefault: true,
        })
      );
    });

    it('should return default address first in list', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockAddressService.getCustomerAddresses.mockResolvedValue([
        {
          id: 'addr-1',
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
        },
        {
          id: 'addr-2',
          customerId,
          street: '456 Oak Ave',
          city: 'Medellín',
          state: 'Antioquia',
          zipCode: '050001',
          country: 'Colombia',
          phone: '9876543210',
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      await addressController.getAddresses(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const callArg = res.json.mock.calls[0][0];
      expect(callArg[0].isDefault).toBe(true);
    });
  });
});
