# Transaction-Budget Double Deduction Issue

## Problem Statement
When creating a transaction that links to both a wallet and a budget, the system is deducting the amount from both the wallet and the budget, effectively charging the user twice for the same transaction.

## Current Behavior (Buggy)
- When creating a transaction that links to both a wallet and a budget
- The transaction amount is deducted from both the wallet balance AND the budget remaining amount
- This results in a double deduction, which is incorrect

## Expected Behavior (Correct)
The system is actually designed correctly - when you spend money from a budget:
- Wallet balance decreases (actual money spent)
- Budget remaining amount decreases (allocated money used up)

However, the issue is in the flow:
1. Budgets are created by allocating money from a wallet (wallet balance decreases)
2. When transactions are made using that budget, money is deducted again from the wallet
3. This results in double-charging the user

## Corrected Understanding
- Budgets contain money that has already been allocated from wallets
- When making a transaction against a budget, we should only deduct from the budget
- The wallet has already been reduced when the budget was initially funded

## Implementation Plan

### Changes needed:

1. In transaction creation (POST /api/transactions):
   - If transaction is linked to a budget, only update the budget (not the wallet) 
   - If transaction is not linked to a budget, only update the wallet

2. In transaction updates (PUT /api/transactions/[id]):
   - Apply the same logic based on whether the transaction is linked to a budget

3. In transaction deletion (DELETE /api/transactions/[id]):
   - Revert based on whether the transaction was linked to a budget

## Code Locations to Modify

1. `src/app/api/transactions/route.ts` - POST handler
2. `src/app/api/transactions/[id]/route.ts` - PUT handler  
3. `src/app/api/transactions/[id]/route.ts` - DELETE handler

## Updated Implementation Logic

### For Transaction Creation (POST):
```
if (linked to budget) {
  update only budget balance
} else {
  update only wallet balance
}
```

### For Transaction Updates (PUT):
```
if (old transaction linked to budget) {
  revert budget balance
} else {
  revert wallet balance
}

if (new transaction linked to budget) {
  update budget balance
} else {
  update wallet balance
}
```

### For Transaction Deletion (DELETE):
```
if (transaction linked to budget) {
  update budget balance (refund)
} else {
  update wallet balance (refund)
}
```

This approach ensures that money is only tracked once, either against a budget or against a wallet, but not both simultaneously.