import { describe, it, expect, beforeEach } from '@jest/globals';
import { clientRouter } from '../routers/client';
import { prisma } from '@biolab/database';

// Mock context
const mockContext = {
  prisma,
  session: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'ADMIN',
    },
  },
};

describe('Client Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return list of clients with pagination', async () => {
      const mockClients = [
        {
          id: '1',
          companyName: 'Test Company',
          email: 'test@company.com',
          contactPerson: 'John Doe',
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          consultant: null,
          _count: { documents: 5, certifications: 2 },
        },
      ];

      (prisma.client.findMany as jest.Mock).mockResolvedValue(mockClients);

      const caller = clientRouter.createCaller(mockContext as any);
      const result = await caller.list({ limit: 10 });

      expect(result.clients).toEqual(mockClients);
      expect(prisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 11,
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should filter by status when provided', async () => {
      (prisma.client.findMany as jest.Mock).mockResolvedValue([]);

      const caller = clientRouter.createCaller(mockContext as any);
      await caller.list({ limit: 10, status: 'LEAD' });

      expect(prisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'LEAD' },
        })
      );
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const newClient = {
        companyName: 'New Company',
        contactPerson: 'Jane Doe',
        email: 'jane@newcompany.com',
        certificationTypes: ['ORGANIC_CROP'],
      };

      const mockCreatedClient = {
        id: 'new-id',
        ...newClient,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.client.create as jest.Mock).mockResolvedValue(mockCreatedClient);

      const caller = clientRouter.createCaller(mockContext as any);
      const result = await caller.create(newClient);

      expect(result.id).toBe('new-id');
      expect(result.companyName).toBe(newClient.companyName);
      expect(prisma.client.create).toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const invalidClient = {
        companyName: 'Test',
        contactPerson: 'Test',
        email: 'invalid-email',
        certificationTypes: [],
      };

      const caller = clientRouter.createCaller(mockContext as any);

      await expect(caller.create(invalidClient)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update client status', async () => {
      const mockUpdatedClient = {
        id: 'client-1',
        status: 'ACTIVE',
      };

      (prisma.client.update as jest.Mock).mockResolvedValue(mockUpdatedClient);

      const caller = clientRouter.createCaller(mockContext as any);
      const result = await caller.update({
        id: 'client-1',
        status: 'ACTIVE',
      });

      expect(result.status).toBe('ACTIVE');
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: 'client-1' },
        data: { status: 'ACTIVE' },
      });
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      (prisma.client.delete as jest.Mock).mockResolvedValue({ id: 'client-1' });

      const caller = clientRouter.createCaller(mockContext as any);
      await caller.delete({ id: 'client-1' });

      expect(prisma.client.delete).toHaveBeenCalledWith({
        where: { id: 'client-1' },
      });
    });
  });
});
