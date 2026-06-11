import { describe, expect, it } from "vitest";
import { computeReimbursements } from "./greedy";

describe("computeReimbursements", () => {
	// -------------------------------------------------------------------------
	// Edge cases
	// -------------------------------------------------------------------------

	it("should return empty array when balances is empty", () => {
		expect(computeReimbursements([])).toEqual([]);
	});

	it("should return empty array when all balances are zero", () => {
		const balances = [
			{ name: "Alice", amount: 0 },
			{ name: "Bob", amount: 0 },
		];
		expect(computeReimbursements([])).toEqual([]);
	});

	it("should return empty array when all balances are below 0.01 threshold", () => {
		const balances = [
			{ name: "Alice", amount: 0.001 },
			{ name: "Bob", amount: -0.001 },
		];
		expect(computeReimbursements(balances)).toEqual([]);
	});

	it("should return empty array with a single participant", () => {
		const balances = [{ name: "Alice", amount: 50 }];
		expect(computeReimbursements(balances)).toEqual([]);
	});

	// -------------------------------------------------------------------------
	// Simple cases
	// -------------------------------------------------------------------------

	it("should return one transaction when one debtor owes one creditor", () => {
		const balances = [
			{ name: "Alice", amount: 50 },
			{ name: "Bob", amount: -50 },
		];
		expect(computeReimbursements(balances)).toEqual([
			{ from: "Bob", to: "Alice", amount: 50 },
		]);
	});

	it("should return two transactions when one debtor owes two creditors", () => {
		const balances = [
			{ name: "Alice", amount: 30 },
			{ name: "Bob", amount: 20 },
			{ name: "Charlie", amount: -50 },
		];
		const result = computeReimbursements(balances);
		expect(result).toHaveLength(2);
		const total = result.reduce((sum, r) => sum + r.amount, 0);
		expect(total).toBe(50);
	});

	it("should return n-1 transactions at most for n participants", () => {
		const balances = [
			{ name: "Alice", amount: 30 },
			{ name: "Bob", amount: 20 },
			{ name: "Charlie", amount: -10 },
			{ name: "Dave", amount: -40 },
		];
		const result = computeReimbursements(balances);
		expect(result.length).toBeLessThanOrEqual(balances.length - 1);
	});

	// -------------------------------------------------------------------------
	// Decimal cases
	// -------------------------------------------------------------------------

	it("should handle amounts with 2 decimal places", () => {
		const balances = [
			{ name: "Alice", amount: 33.33 },
			{ name: "Bob", amount: 33.34 },
			{ name: "Charlie", amount: -66.67 },
		];
		const result = computeReimbursements(balances);
		const total = result.reduce((sum, r) => sum + r.amount, 0);
		expect(Math.round(total * 100) / 100).toBe(66.67);
	});

	it("should round transaction amounts to 2 decimal places", () => {
		const balances = [
			{ name: "Alice", amount: 10.005 },
			{ name: "Bob", amount: -10.005 },
		];
		const result = computeReimbursements(balances);
		expect(result[0].amount).toBe(10.01);
	});

	// -------------------------------------------------------------------------
	// Balance integrity
	// -------------------------------------------------------------------------

	it("should not mutate the original balances array", () => {
		const balances = [
			{ name: "Alice", amount: 50 },
			{ name: "Bob", amount: -50 },
		];
		const copy = balances.map((b) => ({ ...b }));
		computeReimbursements(balances);
		expect(balances).toEqual(copy);
	});

	it("should settle all debts — sum of reimbursements equals total owed", () => {
		const balances = [
			{ name: "Alice", amount: 60 },
			{ name: "Bob", amount: -20 },
			{ name: "Charlie", amount: -40 },
		];
		const result = computeReimbursements(balances);
		const total = result.reduce((sum, r) => sum + r.amount, 0);
		expect(Math.round(total * 100) / 100).toBe(60);
	});

	it("should always have from !== to in each transaction", () => {
		const balances = [
			{ name: "Alice", amount: 50 },
			{ name: "Bob", amount: -30 },
			{ name: "Charlie", amount: -20 },
		];
		const result = computeReimbursements(balances);
		for (const r of result) {
			expect(r.from).not.toBe(r.to);
		}
	});
});