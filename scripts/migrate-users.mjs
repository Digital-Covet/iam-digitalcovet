#!/usr/bin/env node
/**
 * Migrates User + Account data from Supabase (source) to Neon (target).
 *
 * Usage:
 *   DATABASE_SOURCE_URL="postgresql://..." node scripts/migrate-users.mjs
 *
 * Env vars:
 *   DATABASE_SOURCE_URL  – Supabase connection string (source)
 *   DATABASE_URL         – Neon connection string (target, already in .env)
 */

import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const SOURCE_URL = process.env.DATABASE_SOURCE_URL;
const TARGET_URL = process.env.DATABASE_URL;

if (!SOURCE_URL) {
  console.error("DATABASE_SOURCE_URL is required.");
  process.exit(1);
}
if (!TARGET_URL) {
  console.error("DATABASE_URL is required (target Neon database).");
  process.exit(1);
}

const source = new Pool({ connectionString: SOURCE_URL, ssl: { rejectUnauthorized: false } });
const target = new Pool({ connectionString: TARGET_URL, ssl: { rejectUnauthorized: false } });

async function readUsers() {
  const { rows } = await source.query(
    `SELECT id, name, email, "emailVerified", image, "createdAt", "updatedAt",
            "twoFactorEnabled", "passwordChanged", role, banned, "banReason",
            "banExpires", "departmentId"
     FROM "user"`
  );
  return rows;
}

async function readAccounts() {
  const { rows } = await source.query(
    `SELECT id, "accountId", "providerId", "userId", "accessToken",
            "refreshToken", "idToken", "accessTokenExpiresAt",
            "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt"
     FROM "account"`
  );
  return rows;
}

async function readTwoFactors() {
  const { rows } = await source.query(
    `SELECT id, secret, "backupCodes", "userId", verified
     FROM "twoFactor"`
  );
  return rows;
}

function deriveInitials(name) {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

async function migrate() {
  console.log("Reading from source (Supabase)...");
  const users = await readUsers();
  const accounts = await readAccounts();
  const twoFactors = await readTwoFactors();

  console.log(`  Found ${users.length} users, ${accounts.length} accounts, ${twoFactors.length} 2FA records.`);

  const client = await target.connect();
  try {
    await client.query("BEGIN");

    let usersInserted = 0;
    let usersSkipped = 0;

    for (const u of users) {
      try {
        await client.query(
          `INSERT INTO "user" (
             id, name, email, "emailVerified", image, "createdAt", "updatedAt",
             "twoFactorEnabled", "passwordChanged", role, banned, "banReason",
             "banExpires", "departmentId", initials, "avatarTone", "appAccess"
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
           ON CONFLICT (id) DO NOTHING`,
          [
            u.id,
            u.name,
            u.email,
            u.emailVerified ?? false,
            u.image ?? null,
            u.createdAt,
            u.updatedAt,
            u.twoFactorEnabled ?? false,
            u.passwordChanged ?? false,
            u.role ?? "employee",
            u.banned ?? false,
            u.banReason ?? null,
            u.banExpires ?? null,
            u.departmentId ?? null,
            deriveInitials(u.name),
            "primary",
            [],
          ]
        );
        usersInserted++;
      } catch (err) {
        if (err.code === "23505") {
          usersSkipped++;
        } else {
          throw err;
        }
      }
    }

    let accountsInserted = 0;
    let accountsSkipped = 0;

    for (const a of accounts) {
      try {
        await client.query(
          `INSERT INTO account (
             id, "accountId", "providerId", "userId", "accessToken",
             "refreshToken", "idToken", "accessTokenExpiresAt",
             "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt"
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           ON CONFLICT (id) DO NOTHING`,
          [
            a.id,
            a.accountId,
            a.providerId,
            a.userId,
            a.accessToken ?? null,
            a.refreshToken ?? null,
            a.idToken ?? null,
            a.accessTokenExpiresAt ?? null,
            a.refreshTokenExpiresAt ?? null,
            a.scope ?? null,
            a.password ?? null,
            a.createdAt,
            a.updatedAt,
          ]
        );
        accountsInserted++;
      } catch (err) {
        if (err.code === "23505") {
          accountsSkipped++;
        } else {
          throw err;
        }
      }
    }

    let tfInserted = 0;
    let tfSkipped = 0;

    for (const tf of twoFactors) {
      try {
        await client.query(
          `INSERT INTO "twoFactor" (id, secret, "backupCodes", "userId", verified)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (id) DO NOTHING`,
          [tf.id, tf.secret, tf.backupCodes, tf.userId, tf.verified ?? true]
        );
        tfInserted++;
      } catch (err) {
        if (err.code === "23505") {
          tfSkipped++;
        } else {
          throw err;
        }
      }
    }

    await client.query("COMMIT");

    console.log("\nMigration complete:");
    console.log(`  Users:      ${usersInserted} inserted, ${usersSkipped} skipped (already exist)`);
    console.log(`  Accounts:   ${accountsInserted} inserted, ${accountsSkipped} skipped`);
    console.log(`  2FA:        ${tfInserted} inserted, ${tfSkipped} skipped`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed, rolled back:", err);
    process.exit(1);
  } finally {
    client.release();
    await source.end();
    await target.end();
  }
}

migrate();
