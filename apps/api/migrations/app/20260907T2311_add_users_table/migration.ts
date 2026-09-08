#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0c162dba483011e37e0ef9e6168bf27c526995839936d1da5b106687bd96a2a2/contract';
import startContract from '../../snapshots/0c162dba483011e37e0ef9e6168bf27c526995839936d1da5b106687bd96a2a2/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9ec11ab22a7c5a041f44303a1b3978e79465ca27bb14f9d0eedb256131d6654d/contract';
import endContract from '../../snapshots/9ec11ab22a7c5a041f44303a1b3978e79465ca27bb14f9d0eedb256131d6654d/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('display_name', 'character varying(120)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 120 } },
          }),
          col('email', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('password_hash', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('role', 'text', {
            notNull: true,
            default: lit('technician'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('users_role_check_d6ebfb35', "\"role\" IN ('dispatcher', 'technician')"),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
