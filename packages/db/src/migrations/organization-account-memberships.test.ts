import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createClient } from '@libsql/client'

const migrationUrl = new URL(
  './20260814212201_organization-account-memberships.sql',
  import.meta.url
)

const legacyFixtureSql = `
  PRAGMA foreign_keys=ON;

  CREATE TABLE assets (id INTEGER PRIMARY KEY);
  CREATE TABLE accounts (id INTEGER PRIMARY KEY, email TEXT NOT NULL);
  CREATE TABLE owners (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    document_id TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
    birthday TEXT,
    national_id TEXT,
    organization_name TEXT,
    tax_id TEXT,
    status TEXT DEFAULT 'active' NOT NULL
  );
  CREATE TABLE owner_account_lnk (
    id INTEGER PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES owners(id),
    account_id INTEGER NOT NULL REFERENCES accounts(id)
  );
  CREATE TABLE staff (
    id INTEGER PRIMARY KEY,
    document_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE staff_account_lnk (
    id INTEGER PRIMARY KEY,
    staff_id INTEGER NOT NULL REFERENCES staff(id),
    account_id INTEGER NOT NULL REFERENCES accounts(id)
  );
  CREATE TABLE locations (
    id INTEGER PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES owners(id)
  );
  CREATE TABLE staff_location_lnk (
    id INTEGER PRIMARY KEY,
    document_id TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    staff_id INTEGER NOT NULL REFERENCES staff(id),
    location_id INTEGER NOT NULL REFERENCES locations(id),
    UNIQUE(staff_id, location_id)
  );
  CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    document_id TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    location_id INTEGER NOT NULL REFERENCES locations(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    starts_at INTEGER NOT NULL,
    ends_at INTEGER NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'draft' NOT NULL
  );
  CREATE TABLE staff_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    document_id TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    email TEXT NOT NULL,
    location_id INTEGER NOT NULL REFERENCES locations(id),
    invited_by_owner_id INTEGER NOT NULL REFERENCES owners(id),
    slug TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    security_word_hash TEXT,
    expires_at INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    role TEXT DEFAULT 'staff' NOT NULL,
    accepted_at INTEGER
  );

  INSERT INTO accounts (id, email) VALUES
    (1, 'owner-one@example.com'),
    (2, 'owner-two@example.com'),
    (3, 'staff@example.com');
  INSERT INTO owners (
    id, document_id, created_at, updated_at, name, last_name, phone,
    organization_name, tax_id, status
  ) VALUES
    (1, 'owner-one', 100, 110, 'Alice', 'Owner', '11111111', '  Night Org  ', '20329642330', 'active'),
    (2, 'owner-two', 200, 210, ' Bob ', ' Builder ', '22222222', NULL, NULL, 'active');
  INSERT INTO owner_account_lnk (id, owner_id, account_id) VALUES (1, 1, 1), (2, 2, 2);
  INSERT INTO staff (id, document_id, created_at, updated_at) VALUES (1, 'staff-one', 300, 310);
  INSERT INTO staff_account_lnk (id, staff_id, account_id) VALUES (1, 1, 3);
  INSERT INTO locations (id, owner_id) VALUES (10, 1), (11, 1), (20, 2);
  INSERT INTO staff_location_lnk (
    id, document_id, created_at, updated_at, staff_id, location_id
  ) VALUES
    (1, 'staff-location-one', 400, 410, 1, 10),
    (2, 'staff-location-two', 420, 430, 1, 11),
    (3, 'staff-location-three', 440, 450, 1, 20);
  INSERT INTO events (
    id, document_id, created_at, updated_at, location_id, name, description,
    starts_at, ends_at, location, status
  ) VALUES
    (1, 'event-one', 500, 510, 10, 'First Event', 'First', 1000, 1100, NULL, 'published'),
    (2, 'event-two', 520, 530, 20, 'Second Event', 'Second', 1200, 1300, NULL, 'draft');
  INSERT INTO staff_invitations (
    id, document_id, created_at, updated_at, email, location_id,
    invited_by_owner_id, slug, token, expires_at, status, role
  ) VALUES
    (1, 'invitation-one', 600, 610, 'invitee@example.com', 20, 2,
     'invitee', 'token-one', 2000, 'pending', 'staff');
`

test('migrates legacy organization ownership without losing relationships', async () => {
  const client = createClient({ url: 'file::memory:' })

  try {
    await client.executeMultiple(legacyFixtureSql)

    const migrationSql = await readFile(migrationUrl, 'utf8')
    await client.executeMultiple(migrationSql.replaceAll('--> statement-breakpoint', ''))

    const organizations = await client.execute(
      'SELECT id, name, tax_id FROM organizations ORDER BY id'
    )
    assert.deepEqual(organizations.rows, [
      { id: 1, name: 'Night Org', tax_id: '20329642330' },
      { id: 2, name: 'Bob Builder', tax_id: null },
    ])

    const memberships = await client.execute(
      `SELECT organization_id, account_id
       FROM organization_accounts_lnk
       ORDER BY organization_id, account_id`
    )
    assert.deepEqual(memberships.rows, [
      { organization_id: 1, account_id: 1 },
      { organization_id: 1, account_id: 3 },
      { organization_id: 2, account_id: 2 },
      { organization_id: 2, account_id: 3 },
    ])

    const events = await client.execute(
      'SELECT id, location_id, organization_id FROM events ORDER BY id'
    )
    assert.deepEqual(events.rows, [
      { id: 1, location_id: 10, organization_id: 1 },
      { id: 2, location_id: 20, organization_id: 2 },
    ])

    const invitations = await client.execute(
      'SELECT id, organization_id, status FROM staff_invitations ORDER BY id'
    )
    assert.deepEqual(invitations.rows, [{ id: 1, organization_id: 2, status: 'pending' }])

    const ownerColumns = await client.execute('PRAGMA table_info(owners)')
    const ownerColumnNames = ownerColumns.rows.map((row) => row.name)
    assert.equal(ownerColumnNames.includes('organization_name'), false)
    assert.equal(ownerColumnNames.includes('tax_id'), false)

    const legacyTable = await client.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'staff_location_lnk'"
    )
    assert.equal(legacyTable.rows.length, 0)

    const foreignKeyCheck = await client.execute('PRAGMA foreign_key_check')
    assert.deepEqual(foreignKeyCheck.rows, [])

    await assert.rejects(
      client.execute({
        sql: `INSERT INTO organization_accounts_lnk
              (document_id, created_at, updated_at, organization_id, account_id)
              VALUES (?, ?, ?, ?, ?)`,
        args: ['duplicate-membership', 700, 700, 1, 3],
      })
    )
  } finally {
    client.close()
  }
})
