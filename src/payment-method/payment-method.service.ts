import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/create-payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePaymentMethodDto) {
    // If isPrimary is true, unset other primary methods for this user
    if (dto.isPrimary) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.paymentMethod.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id, userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return paymentMethod;
  }

  async update(id: string, userId: string, dto: UpdatePaymentMethodDto) {
    // Verify ownership
    await this.findOne(id, userId);

    // If isPrimary is true, unset other primary methods
    if (dto.isPrimary) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async setPrimary(id: string, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    // Unset other primary methods
    await this.prisma.paymentMethod.updateMany({
      where: { userId, id: { not: id } },
      data: { isPrimary: false },
    });

    return this.prisma.paymentMethod.update({
      where: { id },
      data: { isPrimary: true },
    });
  }

  async getPrimary(userId: string) {
    return this.prisma.paymentMethod.findFirst({
      where: { userId, isPrimary: true, isActive: true },
    });
  }
}
