import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMonthlyTotals } from '../backend/src/utils/helpers.js';

test('buildMonthlyTotals groups totals by YYYY-MM', () => {
  const totals = buildMonthlyTotals([
    { issueDate: '2026-01-01', amount: 100 },
    { issueDate: '2026-01-15', amount: 50.5 },
    { issueDate: '2026-02-03', amount: 20 }
  ]);

  assert.equal(totals['2026-01'], 150.5);
  assert.equal(totals['2026-02'], 20);
});
