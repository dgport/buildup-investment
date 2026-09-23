// Integration regression: all fixtures are rolled back, and only a local DB is allowed.
const assert = require('node:assert/strict');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const database = new URL(process.env.DATABASE_URL);
assert(['localhost', '127.0.0.1', '[::1]'].includes(database.hostname), 'Use a local test database');
require('tsconfig-paths').register({ baseUrl: path.join(__dirname, '../dist'), paths: { '@/*': ['*'] } });
const { PrismaClient } = require('@prisma/client');
const { PropertiesService } = require('../dist/properties/properties.service');
const db = new PrismaClient();
const marker = `market-check-${randomUUID()}`;
const rollback = new Error('ROLLBACK_TEST_FIXTURES');

(async () => {
  try {
    await db.$transaction(async (tx) => {
      const owner = await tx.user.create({ data: { email: `${marker}@example.invalid`, firstname: 'Market', lastname: 'Test' } });
      const records = [
        ['sale', 'SALE', true, 'APPROVED'],
        ['rent', 'RENT', true, 'APPROVED'],
        ['daily', 'DAILY_RENT', true, 'APPROVED'],
        ['hidden', 'RENT', false, 'APPROVED'],
        ['pending', 'DAILY_RENT', true, 'PENDING'],
      ];
      for (const [key, dealType, visible, status] of records) {
        await tx.property.create({ data: { externalId: `${marker}-${key}`, propertyType: 'APARTMENT', dealType, public: visible, status, userId: owner.id } });
      }
      const service = new PropertiesService(tx, {}, {});
      const query = (filters = {}) => service.findAll({ externalId: marker, includePrivate: false, onlyApproved: true, ...filters });
      const rentals = await query({ market: 'rent', limit: 1 });
      assert.equal(rentals.meta.total, 2);
      assert.equal(rentals.meta.totalPages, 2);
      assert.equal(rentals.data.length, 1);
      assert.equal((await query({ market: 'rent', dealType: 'DAILY_RENT' })).meta.total, 1);
      assert.equal((await query({ market: 'sale' })).meta.total, 1);
      assert.equal((await query({ market: 'rent', dealType: 'SALE' })).meta.total, 0);
      assert.equal((await query({ market: 'sale', dealType: 'RENT' })).meta.total, 0);
      assert.equal((await service.findUserProperties(owner.id, { market: 'rent' })).meta.total, 4);
      assert.equal((await service.findUserProperties('another-owner', { market: 'rent', externalId: marker })).meta.total, 0);
      assert.equal((await query({ market: 'rent', includePrivate: true, onlyApproved: false })).meta.total, 4);
      await assert.rejects(query({ market: 'invalid' }), /market must be/);
      throw rollback;
    }, { timeout: 20000 });
  } catch (error) {
    if (error !== rollback) throw error;
  }
  assert.equal(await db.property.count({ where: { externalId: { startsWith: marker } } }), 0);
  console.log('PASS: market isolation, rent subtypes, pagination, moderation, owner isolation; fixtures rolled back');
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
