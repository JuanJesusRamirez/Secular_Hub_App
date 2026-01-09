import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient; prismaDisabled?: PrismaClient };

function createDisabledPrisma(): PrismaClient {
  // Return a proxy object that safely handles common model queries used by the app
  const modelHandler: ProxyHandler<any> = {
    get(_t, _modelName: string) {
      // Each model returns a proxy with common methods
      return new Proxy({}, {
        get(_obj, method: string) {
          if (method === 'findMany') return async () => [];
          if (method === 'count') return async () => 0;
          if (method === 'groupBy') return async () => [];
          if (method === 'findUnique' || method === 'findFirst') return async () => null;
          if (method === 'create' || method === 'update' || method === 'upsert' || method === 'delete') return async () => null;
          // Default safe no-op
          return async () => null;
        }
      });
    }
  };

  const handler: ProxyHandler<any> = {
    get(_t, prop: string) {
      if (prop === '$connect' || prop === '$disconnect') return async () => {};
      if (prop === '$transaction') return async (arg: any) => {
        // Support both array and callback forms
        if (Array.isArray(arg)) return [];
        if (typeof arg === 'function') return arg();
        return [];
      };
      // Return model proxies for any model access
      return new Proxy({}, modelHandler);
    }
  };

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return new Proxy({}, handler) as PrismaClient;
}

export const prisma: PrismaClient = (() => {
  const dbDisabled = process.env.DISABLE_DB === 'true' || !process.env.DATABASE_URL;
  if (dbDisabled) {
    // Use a singleton disabled-prisma instance so behavior is stable.
    if (!globalForPrisma.prismaDisabled) {
      // eslint-disable-next-line no-console
      console.warn('Prisma DB disabled or DATABASE_URL missing; running in degraded mode (no DB).');
      globalForPrisma.prismaDisabled = createDisabledPrisma();
    }
    return globalForPrisma.prismaDisabled!;
  }

  // Normal Prisma client
  const client = globalForPrisma.prisma || new PrismaClient({ log: ['query'] });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
})();
