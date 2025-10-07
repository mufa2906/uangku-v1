# Wallet-Budget Mismatch Issue

## Problem Statement
When editing a transaction that is linked to a budget, users cannot change the wallet to one that is different from the budget's source wallet. This creates a poor user experience when users initially select the wrong wallet or budget combination.

## Current Behavior (Limiting)
- When creating/updating a transaction, if a budget is selected, it must be linked to the currently selected wallet
- If a user selects Budget A (linked to Wallet A) and then switches to Wallet B, the system throws a "Budget wallet mismatch" error
- This prevents users from easily correcting mistakes or changing their wallet choice after selecting a budget

## Expected Behavior (User-Friendly)
- Allow users to change either the wallet or budget selection independently
- If a user changes the wallet when a budget is selected, either:
  1. Clear the budget selection and prompt for a new budget matching the new wallet, OR
  2. Automatically find a suitable budget in the new wallet if possible

## Technical Implementation Plan

### For Transaction Creation (POST /api/transactions):
- When changing budget selection, automatically set the wallet to match the budget's wallet
- When changing wallet selection with a budget already selected, show validation error but allow clearing the budget

### For Transaction Update (PUT /api/transactions/[id]):
- Implement logic to handle changing wallet/budget combinations during updates
- If a new wallet is selected that doesn't match the current budget, clear the budget or prompt for a valid budget
- Ensure proper balance adjustments when changing wallet or budget selections

### For UI Considerations:
- When user selects a budget, automatically populate the wallet field with the budget's wallet
- When user selects a wallet after a budget is chosen, show an alert if they don't match and offer to clear the budget
- Consider implementing warning messages in the UI before validation errors occur

## Impact Assessment
This is a UX issue that affects user workflow flexibility. Users should be able to correct their selection without being blocked by strict validation that doesn't account for the editing flow.

## Files to Modify
- `src/components/transactions/TransactionFormSheet.tsx` (UI component)
- `src/app/api/transactions/route.ts` (POST endpoint)
- `src/app/api/transactions/[id]/route.ts` (PUT endpoint)