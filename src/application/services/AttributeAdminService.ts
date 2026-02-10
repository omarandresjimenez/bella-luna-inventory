import { PrismaClient, Attribute, AttributeType } from '@prisma/client';

export interface CreateAttributeDTO {
  name: string;
  displayName: string;
  type: 'TEXT' | 'COLOR_HEX' | 'NUMBER';
  sortOrder?: number;
}

export interface UpdateAttributeDTO {
  name?: string;
  displayName?: string;
  type?: 'TEXT' | 'COLOR_HEX' | 'NUMBER';
  sortOrder?: number;
}

export interface CreateAttributeValueDTO {
  value: string;
  displayValue?: string;
  colorHex?: string;
  sortOrder?: number;
}

export class AttributeAdminService {
  constructor(private prisma: PrismaClient) {}

  // Get all attributes with their values
  async getAllAttributes(): Promise<Attribute[]> {
    return this.prisma.attribute.findMany({
      include: {
        values: {
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  // Get attribute by ID
  async getAttributeById(id: string): Promise<Attribute | null> {
    return this.prisma.attribute.findUnique({
      where: { id },
      include: {
        values: {
          orderBy: { sortOrder: 'asc' }
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  }

  // Create new attribute
  async createAttribute(data: CreateAttributeDTO): Promise<Attribute> {
    // Check for duplicate name
    const existing = await this.prisma.attribute.findUnique({
      where: { name: data.name }
    });

    if (existing) {
      throw new Error('Ya existe un atributo con ese nombre');
    }

    const attributeType = data.type as AttributeType;

    return this.prisma.attribute.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        type: attributeType,
        sortOrder: data.sortOrder ?? 0
      }
    });
  }

  // Update attribute
  async updateAttribute(id: string, data: UpdateAttributeDTO): Promise<Attribute> {
    const existing = await this.prisma.attribute.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Atributo no encontrado');
    }

    // Check for duplicate name if changing name
    if (data.name && data.name !== existing.name) {
      const duplicate = await this.prisma.attribute.findUnique({
        where: { name: data.name }
      });
      if (duplicate) {
        throw new Error('Ya existe un atributo con ese nombre');
      }
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.type) {
      updateData.type = data.type as AttributeType;
    }

    return this.prisma.attribute.update({
      where: { id },
      data: updateData
    });
  }

  // Delete attribute
  async deleteAttribute(id: string): Promise<void> {
    const existing = await this.prisma.attribute.findUnique({
      where: { id },
      include: {
        products: true,
        values: true
      }
    });

    if (!existing) {
      throw new Error('Atributo no encontrado');
    }

    if (existing.products.length > 0) {
      throw new Error('No se puede eliminar un atributo asociado a productos');
    }

    // Delete all attribute values first
    if (existing.values.length > 0) {
      await this.prisma.attributeValue.deleteMany({
        where: { attributeId: id }
      });
    }

    await this.prisma.attribute.delete({
      where: { id }
    });
  }

  // Add value to attribute
  async addAttributeValue(
    attributeId: string, 
    data: CreateAttributeValueDTO
  ) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id: attributeId }
    });

    if (!attribute) {
      throw new Error('Atributo no encontrado');
    }

    return this.prisma.attributeValue.create({
      data: {
        attributeId,
        value: data.value,
        displayValue: data.displayValue,
        colorHex: data.colorHex,
        sortOrder: data.sortOrder ?? 0
      }
    });
  }

  // Remove value from attribute
  async removeAttributeValue(valueId: string): Promise<void> {
    const existing = await this.prisma.attributeValue.findUnique({
      where: { id: valueId },
      include: {
        variants: true
      }
    });

    if (!existing) {
      throw new Error('Valor de atributo no encontrado');
    }

    if (existing.variants.length > 0) {
      throw new Error('No se puede eliminar un valor asociado a variantes de producto');
    }

    await this.prisma.attributeValue.delete({
      where: { id: valueId }
    });
  }
}
