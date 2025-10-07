-- Add wallet_id column to budgets table
ALTER TABLE "budgets" ADD COLUMN "wallet_id" uuid REFERENCES "public"."wallets"("id") ON DELETE cascade;

-- Add allocated_amount column to budgets table
ALTER TABLE "budgets" ADD COLUMN "allocated_amount" numeric(14, 2) NOT NULL DEFAULT '0';

-- Add remaining_amount column to budgets table
ALTER TABLE "budgets" ADD COLUMN "remaining_amount" numeric(14, 2) NOT NULL DEFAULT '0';

-- Copy existing amount values to allocated_amount and remaining_amount
UPDATE "budgets" SET "allocated_amount" = "amount", "remaining_amount" = "amount";

-- Drop the old amount column
ALTER TABLE "budgets" DROP COLUMN "amount";

-- Make wallet_id NOT NULL since it's required
ALTER TABLE "budgets" ALTER COLUMN "wallet_id" SET NOT NULL;