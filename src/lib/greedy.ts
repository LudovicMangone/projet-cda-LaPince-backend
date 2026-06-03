// Represents the net financial situation of a participant
// amount > 0 : creditor (should receive money)
// amount < 0 : debtor (should pay money)
type Balance = {
	name: string;
	amount: number;
};

// Represents a single reimbursement transaction between two participants
// Exported because balance.service.ts will use it to type the response
export type Reimbursement = {
	from: string; // debtor name (pays)
	to: string; // creditor name (receives)
	amount: number;
};

// Takes an array of net balances and returns the minimum number of transactions
// to settle all debts (greedy algorithm — guaranteed max n-1 transactions)
export function computeReimbursements(balances: Balance[]): Reimbursement[] {
	const reimbursements: Reimbursement[] = [];

	// Work on a shallow copy to avoid mutating the original array
	// Filter out participants already at zero (nothing to settle)
	// 0.01 threshold instead of === 0 to absorb floating point precision errors
	const state = balances
		.map((b) => ({ ...b }))
		.filter((b) => Math.abs(b.amount) >= 0.01);

	// Keep looping as long as there are at least one creditor and one debtor
	while (state.length >= 2) {
		// Sort descending each iteration:
		// → highest creditor at index 0
		// → highest debtor at last index (most negative value)
		state.sort((a, b) => b.amount - a.amount);

		const creditor = state[0];
		const debtor = state[state.length - 1];

		// The debtor pays the minimum of:
		// - what the creditor expects to receive
		// - what the debtor owes
		// This ensures we never overpay either side
		// Math.round * 100 / 100 : round to 2 decimal places to avoid floating point errors
		const amount =
			Math.round(Math.min(creditor.amount, Math.abs(debtor.amount)) * 100) /
			100;

		// Record the transaction
		reimbursements.push({
			from: debtor.name,
			to: creditor.name,
			amount,
		});

		// Update balances after the transaction
		// creditor receives → their balance decreases toward 0
		// debtor pays → their balance increases toward 0
		creditor.amount = Math.round((creditor.amount - amount) * 100) / 100;
		debtor.amount = Math.round((debtor.amount + amount) * 100) / 100;

		// Remove settled participants (balance back to zero)
		// splice(0, 1) removes the first element (creditor)
		// splice(length - 1, 1) removes the last element (debtor)
		if (Math.abs(creditor.amount) < 0.01) state.splice(0, 1);
		if (Math.abs(debtor.amount) < 0.01) state.splice(state.length - 1, 1);
	}

	// Return the minimal list of transactions to settle all debts
	return reimbursements;
}
