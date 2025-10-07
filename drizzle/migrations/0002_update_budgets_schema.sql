-- Add wallet_id column to budgets table
ALTER TABLE "budgets" ADD COLUMN "wallet_id" uuid REFERENCES "public"."wallets"("id") ON DELETE cascade;
--> statement-breakpoint

-- Add allocated_amount column to budgets table
ALTER TABLE "budgets" ADD COLUMN "allocated_amount" numeric(14, 2) NOT NULL DEFAULT '0';
--> statement-breakpoint

-- Add remaining_amount column to budgets table
ALTER TABLE "budgets" ADD COLUMN "remaining_amount" numeric(14, 2) NOT NULL DEFAULT '0';
--> statement-breakpoint

-- Copy existing amount values to allocated_amount and remaining_amount
UPDATE "budgets" SET "allocated_amount" = "amount", "remaining_amount" = "amount";
--> statement-breakpoint

-- Drop the old amount column
ALTER TABLE "budgets" DROP COLUMN "amount";
--> statement-breakpoint

-- Make wallet_id NOT NULL since it's required
ALTER TABLE "budgets" ALTER COLUMN "wallet_id" SET NOT NULL;
--> statement-breakpoint

-- Update any existing budgets to have proper wallet_id references
-- This assumes budgets previously existed without wallet associations
-- In a real migration, you might need to handle this differently based on your data