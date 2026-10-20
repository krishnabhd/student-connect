// server/config/seed.ts
import { UserModel } from '../models/schemas.ts';
import { DEMO_USERS } from './demoData.ts';
import { hashPassword, DEFAULT_DEMO_PASSWORD } from '../utils/password.ts';

export async function seedIfEmpty(): Promise<void> {
  const demoPasswordHash = hashPassword(DEFAULT_DEMO_PASSWORD);
  const usersWithPasswords = DEMO_USERS.map((u) => ({
    ...u,
    passwordHash: u.passwordHash || demoPasswordHash,
  }));

  const count = await UserModel.countDocuments();
  if (count === 0) {
    await UserModel.insertMany(usersWithPasswords);
    console.log(`🌱 Seeded ${usersWithPasswords.length} demo users`);
    return;
  }

  // Ensure every demo account exists so Student Login demos always work,
  // even if the DB was partially populated earlier.
  let upserted = 0;
  let backfilled = 0;

  for (const user of usersWithPasswords) {
    const existing = await UserModel.findOne({ id: user.id }).lean();

    if (!existing) {
      await UserModel.create(user);
      upserted += 1;
      continue;
    }

    // Backfill password + login identifiers for legacy demo docs only
    const patch: Record<string, unknown> = {};
    if (!existing.passwordHash) patch.passwordHash = demoPasswordHash;
    if (!existing.username && user.username) patch.username = user.username;
    if (!existing.admissionNumber && user.admissionNumber) {
      patch.admissionNumber = user.admissionNumber;
    }

    if (Object.keys(patch).length > 0) {
      await UserModel.updateOne({ id: user.id }, { $set: patch });
      backfilled += 1;
    }
  }

  console.log(
    `ℹ️  Users collection has ${count} docs; ensured ${usersWithPasswords.length} demo accounts (inserted ${upserted}, backfilled ${backfilled})`
  );
}
