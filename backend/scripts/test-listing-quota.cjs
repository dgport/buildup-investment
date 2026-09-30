// Real PostgreSQL checks, rolled back: no persisted users, listings or emails.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const { enforceListingQuota } = require('../dist/properties/listing-quota');
const { validate } = require('class-validator');
const { UpdateUserDto } = require('../dist/admin/dto/admin.dto');
const db = new PrismaClient();
const rollback = new Error('ROLLBACK_QUOTA_TEST');
(async () => {
  for (const listingLimit of [-1, 1.5, null, '3', 1000001]) {
    const dto = Object.assign(new UpdateUserDto(), { listingLimit });
    assert.ok((await validate(dto)).length, 'invalid limit accepted');
  }
  for (const listingLimit of [0, 3, 10]) {
    assert.equal((await validate(Object.assign(new UpdateUserDto(), { listingLimit }))).length, 0);
  }
  try {
    await db.$transaction(async tx => {
      const user = await tx.user.create({ data: { firstname: 'Quota', lastname: 'Check', email: `quota-${randomUUID()}@example.invalid` } });
      assert.equal(user.listingLimit, 3);
      for (const [index,status] of ['APPROVED','PENDING','DRAFT'].entries()) {
        await enforceListingQuota(tx,user.id);
        await tx.property.create({ data: { externalId: randomUUID(), userId: user.id, propertyType:'APARTMENT',dealType: index ? 'RENT' : 'SALE', status, public: false } });
      }
      await assert.rejects(enforceListingQuota(tx,user.id), e => e.getResponse().code === 'LISTING_LIMIT_REACHED');
      await tx.user.update({ where: { id:user.id }, data:{ listingLimit:4 } });
      await enforceListingQuota(tx,user.id);
      await tx.user.update({ where: { id:user.id }, data:{ listingLimit:0 } });
      await assert.rejects(enforceListingQuota(tx,user.id));
      assert.equal(await tx.property.count({where:{userId:user.id}}),3);
      await tx.user.update({ where: { id:user.id }, data:{ listingLimit:3 } });
      const first=await tx.property.findFirstOrThrow({where:{userId:user.id}});
      await tx.property.delete({where:{id:first.id}});
      await enforceListingQuota(tx,user.id);
      throw rollback;
    });
  } catch(error) { if(error!==rollback) throw error; }
  const fixture = await db.user.create({ data: { firstname:'Quota',lastname:'Concurrent',email:`quota-${randomUUID()}@example.invalid` } });
  try {
    await db.property.createMany({data:[0,1].map(()=>({externalId:randomUUID(),userId:fixture.id,propertyType:'APARTMENT',dealType:'SALE',public:false}))});
    const results=await Promise.allSettled([0,1].map(()=>db.$transaction(async tx=>{
      await enforceListingQuota(tx,fixture.id);
      return tx.property.create({data:{externalId:randomUUID(),userId:fixture.id,propertyType:'APARTMENT',dealType:'RENT',public:false}});
    })));
    assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
    assert.equal(await db.property.count({where:{userId:fixture.id}}),3);
  } finally {
    await db.$transaction([db.property.deleteMany({where:{userId:fixture.id}}),db.user.delete({where:{id:fixture.id}})]);
  }
  console.log('PASS: default 3; all statuses and markets count; fourth blocked; increase/zero/delete behavior; strict DTO validation; concurrent requests cannot exceed 3. Temporary fixtures removed.');
})().catch(error => {console.error(error);process.exitCode=1;}).finally(()=>db.$disconnect());
