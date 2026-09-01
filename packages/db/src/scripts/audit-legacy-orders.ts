import { fileURLToPath } from 'node:url'
import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import { loadMigrationEnv } from '../config/env.loader.ts'

export type LegacyOrdersAuditDatabase = {
  query<Row extends QueryResultRow>(query: string): Promise<{ rows: Row[] }>
}

type LegacyOrdersAudit = {
  summary: QueryResultRow[]
  orderIssues: QueryResultRow[]
  issuanceIssues: QueryResultRow[]
  inventoryCapacityIssues: QueryResultRow[]
  priceSnapshotDifferences: QueryResultRow[]
  checkInIssues: QueryResultRow[]
  providerReferences: QueryResultRow[]
}

const SUMMARY_QUERY = `
  SELECT
    count(*) FILTER (WHERE status = 'completed') AS completed_orders,
    COALESCE(sum(quantity) FILTER (WHERE status = 'completed'), 0) AS completed_ordered_units,
    COALESCE(sum(amount) FILTER (WHERE status = 'completed'), 0) AS completed_order_amount,
    COALESCE((
      SELECT count(*)
      FROM tickets_sold ts
      JOIN orders o ON o.id = ts.order_id
      WHERE o.status = 'completed'
    ), 0) AS completed_issued_units
  FROM orders;
`

const ORDER_ISSUES_QUERY = `
  SELECT
    id AS order_id,
    document_id AS order_document_id,
    status,
    quantity,
    amount,
    provider,
    paid_at
  FROM orders
  WHERE quantity <= 0
    OR amount < 0
    OR provider <> 'mercado_pago'
    OR (status = 'completed' AND paid_at IS NULL)
    OR (status IS DISTINCT FROM 'completed' AND paid_at IS NOT NULL)
    OR status IS NULL
    OR status NOT IN ('pending', 'completed', 'rejected', 'cancelled')
  ORDER BY id;
`

const ISSUANCE_ISSUES_QUERY = `
  SELECT
    o.id AS order_id,
    o.document_id AS order_document_id,
    o.status,
    o.quantity AS ordered_quantity,
    count(ts.id) AS issued_quantity,
    count(ts.id) - o.quantity AS issuance_delta
  FROM orders o
  LEFT JOIN tickets_sold ts ON ts.order_id = o.id
  GROUP BY o.id, o.document_id, o.status, o.quantity
  HAVING
    (o.status = 'completed' AND count(ts.id) <> o.quantity)
    OR (o.status IS DISTINCT FROM 'completed' AND count(ts.id) > 0)
    OR o.quantity <= 0
  ORDER BY o.id;
`

const INVENTORY_CAPACITY_ISSUES_QUERY = `
  WITH completed_order_quantities AS (
    SELECT ticket_id, sum(quantity) AS completed_quantity
    FROM orders
    WHERE status = 'completed'
    GROUP BY ticket_id
  )
  SELECT
    t.id AS ticket_id,
    t.document_id AS ticket_document_id,
    t.quantity AS ticket_capacity,
    coalesce(coq.completed_quantity, 0) AS completed_quantity
  FROM tickets t
  LEFT JOIN completed_order_quantities coq ON coq.ticket_id = t.id
  WHERE coalesce(coq.completed_quantity, 0) > t.quantity
  ORDER BY t.id;
`

const PRICE_SNAPSHOT_DIFFERENCES_QUERY = `
  SELECT
    o.id AS order_id,
    o.document_id AS order_document_id,
    o.ticket_id,
    o.quantity,
    o.amount AS order_amount,
    t.price AS current_ticket_price,
    t.price * o.quantity AS current_price_times_quantity
  FROM orders o
  JOIN tickets t ON t.id = o.ticket_id
  WHERE o.amount <> t.price * o.quantity
  ORDER BY o.ticket_id, o.id;
`

const CHECK_IN_ISSUES_QUERY = `
  SELECT
    ts.id AS ticket_sold_id,
    ts.document_id AS ticket_sold_document_id,
    ts.order_id,
    ts.checked_in,
    ts.used_at,
    ts.checked_in_by_account_id,
    ts.checked_in_by_role
  FROM tickets_sold ts
  WHERE (ts.checked_in AND ts.used_at IS NULL)
    OR (NOT ts.checked_in AND (
      ts.used_at IS NOT NULL
      OR ts.checked_in_by_account_id IS NOT NULL
      OR ts.checked_in_by_role IS NOT NULL
    ))
    OR (ts.checked_in_by_account_id IS NULL) <> (ts.checked_in_by_role IS NULL)
  ORDER BY ts.id;
`

const PROVIDER_REFERENCES_QUERY = `
  SELECT
    count(*) FILTER (WHERE external_order_id IS NOT NULL) AS external_reference_count,
    count(*) FILTER (
      WHERE external_order_id IS NULL AND metadata ? 'preferenceId'
    ) AS metadata_preference_only_count,
    count(*) FILTER (
      WHERE external_order_id IS NOT NULL AND metadata ? 'preferenceId'
    ) AS both_reference_forms_count
  FROM orders;
`

export async function auditLegacyOrders(
  database: LegacyOrdersAuditDatabase
): Promise<LegacyOrdersAudit> {
  const [
    summary,
    orderIssues,
    issuanceIssues,
    inventoryCapacityIssues,
    priceSnapshotDifferences,
    checkInIssues,
    providerReferences,
  ] = await Promise.all([
    database.query(SUMMARY_QUERY),
    database.query(ORDER_ISSUES_QUERY),
    database.query(ISSUANCE_ISSUES_QUERY),
    database.query(INVENTORY_CAPACITY_ISSUES_QUERY),
    database.query(PRICE_SNAPSHOT_DIFFERENCES_QUERY),
    database.query(CHECK_IN_ISSUES_QUERY),
    database.query(PROVIDER_REFERENCES_QUERY),
  ])

  return {
    summary: summary.rows,
    orderIssues: orderIssues.rows,
    issuanceIssues: issuanceIssues.rows,
    inventoryCapacityIssues: inventoryCapacityIssues.rows,
    priceSnapshotDifferences: priceSnapshotDifferences.rows,
    checkInIssues: checkInIssues.rows,
    providerReferences: providerReferences.rows,
  }
}

export function hasLegacyOrderAuditIssues(audit: LegacyOrdersAudit): boolean {
  return (
    audit.orderIssues.length > 0 ||
    audit.issuanceIssues.length > 0 ||
    audit.inventoryCapacityIssues.length > 0 ||
    audit.checkInIssues.length > 0
  )
}

export async function runLegacyOrdersAudit(connectionString: string): Promise<LegacyOrdersAudit> {
  const pool = new Pool({ connectionString, max: 1 })
  let client: PoolClient | undefined
  let transactionStarted = false

  try {
    client = await pool.connect()
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY')
    transactionStarted = true
    return await auditLegacyOrders(client)
  } finally {
    try {
      if (transactionStarted) await client?.query('ROLLBACK')
    } finally {
      client?.release()
      await pool.end()
    }
  }
}

async function main() {
  const { DATABASE_MIGRATION_URL } = loadMigrationEnv()
  const audit = await runLegacyOrdersAudit(DATABASE_MIGRATION_URL)

  process.stdout.write(`${JSON.stringify(audit, null, 2)}\n`)
  if (hasLegacyOrderAuditIssues(audit)) process.exitCode = 1
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main()
}
