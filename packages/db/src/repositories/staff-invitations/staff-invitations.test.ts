import assert from 'node:assert/strict'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { sql } from 'drizzle-orm'
import { STAFF_INVITATION_STATUS, USER_ROLE } from '@repo/types'

const databasePath = join(tmpdir(), 'afterdark-staff-invitations-test.db')
for (const path of [databasePath, `${databasePath}-shm`, `${databasePath}-wal`]) {
  rmSync(path, { force: true })
}
process.env.TURSO_DATABASE_URL = `file:${databasePath.replaceAll('\\', '/')}`

const dbModulePromise = import('../../index.ts')

test.after(async () => {
  const { db } = await dbModulePromise
  db.$client.close()
})

test('persists organization invitations and registers staff membership atomically', async () => {
  const {
    createStaffInvitation,
    db,
    findStaffInvitationByDocumentIdForOwner,
    findStaffInvitationByTokenWithOrganization,
    findStaffInvitationsByOwnerDocumentId,
    registerStaffForOrganization,
  } = await dbModulePromise

  await db.run(sql`PRAGMA foreign_keys=ON`)
  await db.run(sql`
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      provider TEXT NOT NULL,
      provider_account_id TEXT
    )
  `)
  await db.run(sql`
    CREATE TABLE owners (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE owner_account_lnk (
      id INTEGER PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE organizations (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      tax_id TEXT
    )
  `)
  await db.run(sql`
    CREATE TABLE organization_accounts_lnk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      UNIQUE(organization_id, account_id)
    )
  `)
  await db.run(sql`
    CREATE TABLE staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      avatar_id INTEGER,
      status TEXT DEFAULT 'active' NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE staff_account_lnk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      staff_id INTEGER NOT NULL REFERENCES staff(id),
      account_id INTEGER NOT NULL REFERENCES accounts(id)
    )
  `)
  await db.run(sql`
    CREATE TABLE account_role_lnk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      role_id INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE staff_invitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      email TEXT NOT NULL,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      invited_by_owner_id INTEGER NOT NULL REFERENCES owners(id),
      slug TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      security_word_hash TEXT,
      expires_at INTEGER NOT NULL,
      status TEXT NOT NULL,
      role TEXT NOT NULL,
      accepted_at INTEGER
    )
  `)

  await db.run(sql`
    INSERT INTO accounts (
      id, document_id, created_at, updated_at, email, provider
    ) VALUES
      (1, 'owner-account-one', 100, 100, 'owner-one@example.com', 'local'),
      (2, 'owner-account-two', 100, 100, 'owner-two@example.com', 'local')
  `)
  await db.run(sql`
    INSERT INTO owners (id, document_id, name, last_name, phone, status) VALUES
      (1, 'owner-one', 'One', 'Owner', '11111111', 'active'),
      (2, 'owner-two', 'Two', 'Owner', '22222222', 'active')
  `)
  await db.run(sql`
    INSERT INTO owner_account_lnk (id, owner_id, account_id) VALUES (1, 1, 1), (2, 2, 2)
  `)
  await db.run(sql`
    INSERT INTO organizations (
      id, document_id, created_at, updated_at, name
    ) VALUES (1, 'organization-one', 100, 100, 'Organization One')
  `)
  await db.run(sql`
    INSERT INTO organization_accounts_lnk (
      id, document_id, created_at, updated_at, organization_id, account_id
    ) VALUES
      (1, 'owner-membership-one', 100, 100, 1, 1),
      (2, 'owner-membership-two', 100, 100, 1, 2)
  `)

  const invitation = await createStaffInvitation({
    email: 'staff@example.com',
    organizationId: 1,
    invitedByOwnerId: 1,
    slug: 'staff',
    token: 'invitation-token',
    securityWordHash: null,
    expiresAt: new Date(2_000_000),
    status: STAFF_INVITATION_STATUS.PENDING,
    role: USER_ROLE.STAFF,
  })

  const tokenRow = await findStaffInvitationByTokenWithOrganization('invitation-token')
  assert.equal(tokenRow?.organizationDocumentId, 'organization-one')
  assert.equal(tokenRow?.organizationName, 'Organization One')
  assert.equal(tokenRow?.invitation.organizationId, 1)

  const secondOwnerInvitations = await findStaffInvitationsByOwnerDocumentId('owner-two')
  assert.equal(secondOwnerInvitations.length, 1)
  assert.equal(secondOwnerInvitations[0]?.invitation.documentId, invitation.documentId)
  assert.equal(
    (await findStaffInvitationByDocumentIdForOwner(invitation.documentId, 'owner-two'))?.id,
    invitation.id
  )

  await registerStaffForOrganization({
    email: 'staff@example.com',
    hashedPassword: 'hashed-password',
    roleId: 4,
    roleName: USER_ROLE.STAFF,
    profile: { name: 'Staff', lastName: 'Member', phone: '33333333' },
    organizationId: 1,
  })

  const membership = await db.all(sql`
    SELECT accounts.email, organizations.document_id AS organization_document_id
    FROM accounts
    INNER JOIN organization_accounts_lnk
      ON organization_accounts_lnk.account_id = accounts.id
    INNER JOIN organizations
      ON organizations.id = organization_accounts_lnk.organization_id
    WHERE accounts.email = 'staff@example.com'
  `)
  assert.deepEqual(membership, [
    { email: 'staff@example.com', organization_document_id: 'organization-one' },
  ])

  await assert.rejects(
    registerStaffForOrganization({
      email: 'rollback@example.com',
      hashedPassword: 'hashed-password',
      roleId: 4,
      roleName: USER_ROLE.STAFF,
      profile: { name: 'Rollback', lastName: 'Member', phone: '44444444' },
      organizationId: 999,
    })
  )

  const rolledBackAccounts = await db.all(
    sql`SELECT id FROM accounts WHERE email = 'rollback@example.com'`
  )
  assert.deepEqual(rolledBackAccounts, [])
})
