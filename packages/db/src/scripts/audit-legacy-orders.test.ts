import { expect, test } from 'vitest'
import { Pool } from 'pg'
import { auditLegacyOrders, hasLegacyOrderAuditIssues } from './audit-legacy-orders.ts'
import { loadTestDatabaseEnv } from '../config/env.loader.ts'

test('classifies only integrity findings as blocking', () => {
  expect(
    hasLegacyOrderAuditIssues({
      summary: [],
      orderIssues: [],
      issuanceIssues: [],
      inventoryCapacityIssues: [],
      priceSnapshotDifferences: [{ order_id: 1 }],
      checkInIssues: [],
      providerReferences: [],
    })
  ).toBe(false)
})

test('runs only select queries while collecting the legacy audit', async () => {
  const queries: string[] = []
  const database = {
    query: async (query: string) => {
      queries.push(query)
      return { rows: [] }
    },
  }

  const audit = await auditLegacyOrders(database)

  expect(queries).toHaveLength(7)
  expect(
    queries.every(
      (query) => query.trimStart().startsWith('SELECT') || query.trimStart().startsWith('WITH')
    )
  ).toBe(true)
  expect(audit).toEqual({
    summary: [],
    orderIssues: [],
    issuanceIssues: [],
    inventoryCapacityIssues: [],
    priceSnapshotDifferences: [],
    checkInIssues: [],
    providerReferences: [],
  })
})

const testDatabaseUrl = process.env.DATABASE_TEST_URL
  ? loadTestDatabaseEnv().DATABASE_TEST_URL
  : undefined

test.skipIf(!testDatabaseUrl)(
  'characterizes legacy orders and issued tickets in the isolated test database',
  async () => {
    const pool = new Pool({ connectionString: testDatabaseUrl!, max: 1 })
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      await client.query(`
        CREATE TEMPORARY TABLE tickets (
          id integer PRIMARY KEY,
          document_id uuid NOT NULL,
          quantity integer NOT NULL,
          price numeric NOT NULL
        ) ON COMMIT DROP;
        CREATE TEMPORARY TABLE orders (
          id integer PRIMARY KEY,
          document_id uuid NOT NULL,
          ticket_id integer NOT NULL,
          status text,
          quantity integer NOT NULL,
          amount numeric NOT NULL,
          provider text NOT NULL,
          paid_at timestamptz,
          external_order_id text,
          metadata jsonb
        ) ON COMMIT DROP;
        CREATE TEMPORARY TABLE tickets_sold (
          id integer PRIMARY KEY,
          document_id uuid NOT NULL,
          order_id integer,
          checked_in boolean NOT NULL,
          used_at timestamptz,
          checked_in_by_account_id integer,
          checked_in_by_role text
        ) ON COMMIT DROP;
        INSERT INTO tickets (id, document_id, quantity, price)
        VALUES (1, '00000000-0000-0000-0000-000000000001', 2, 50);
        INSERT INTO orders (
          id, document_id, ticket_id, status, quantity, amount, provider, paid_at
        ) VALUES (
          1, '00000000-0000-0000-0000-000000000011', 1, 'completed', 2, 100,
          'mercado_pago', now()
        );
        INSERT INTO tickets_sold (id, document_id, order_id, checked_in)
        VALUES
          (1, '00000000-0000-0000-0000-000000000021', 1, false),
          (2, '00000000-0000-0000-0000-000000000022', 1, false);
      `)

      const validAudit = await auditLegacyOrders(client)

      expect(hasLegacyOrderAuditIssues(validAudit)).toBe(false)
      expect(validAudit.summary).toEqual([
        {
          completed_orders: '1',
          completed_ordered_units: '2',
          completed_order_amount: '100',
          completed_issued_units: '2',
        },
      ])

      await client.query(`
        INSERT INTO orders (
          id, document_id, ticket_id, status, quantity, amount, provider, paid_at
        ) VALUES
          (2, '00000000-0000-0000-0000-000000000012', 1, 'completed', 1, 50,
           'mercado_pago', now()),
          (3, '00000000-0000-0000-0000-000000000013', 1, 'cancelled', 1, 50,
           'mercado_pago', now());
        UPDATE tickets_sold
        SET checked_in = true
        WHERE id = 1;
      `)

      const invalidAudit = await auditLegacyOrders(client)

      expect(invalidAudit.orderIssues).toHaveLength(1)
      expect(invalidAudit.issuanceIssues).toHaveLength(1)
      expect(invalidAudit.inventoryCapacityIssues).toHaveLength(1)
      expect(invalidAudit.checkInIssues).toHaveLength(1)
      expect(hasLegacyOrderAuditIssues(invalidAudit)).toBe(true)
    } finally {
      await client.query('ROLLBACK')
      client.release()
      await pool.end()
    }
  }
)
