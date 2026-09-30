import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/** Lock the owner row until the listing is committed, including concurrent requests. */
export async function enforceListingQuota(
  tx: Prisma.TransactionClient,
  userId: string,
) {
  const owners = await tx.$queryRaw<{ listing_limit: number }[]>`
    SELECT listing_limit FROM users WHERE id = ${userId} FOR UPDATE
  `;
  const owner = owners[0];
  if (!owner) throw new NotFoundException('User not found');
  const used = await tx.property.count({ where: { userId } });
  if (used >= owner.listing_limit) {
    throw new ForbiddenException({
      statusCode: 403,
      code: 'LISTING_LIMIT_REACHED',
      message:
        'Listing limit reached. Contact an administrator to increase your limit.',
      limit: owner.listing_limit,
      used,
    });
  }
}
