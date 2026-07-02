-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "role" VARCHAR(20) NOT NULL DEFAULT 'INVESTOR',
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "email_verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date_of_birth" DATE,
    "nationality" VARCHAR(100),
    "tax_id" VARCHAR(50),
    "address_line1" VARCHAR(255),
    "address_line2" VARCHAR(255),
    "city" VARCHAR(100),
    "country" VARCHAR(100) DEFAULT 'Mozambique',
    "postal_code" VARCHAR(20),
    "kyc_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "kyc_reviewed_by" UUID,
    "kyc_reviewed_at" TIMESTAMPTZ(6),
    "kyc_rejection_reason" TEXT,
    "aml_status" VARCHAR(20) DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "document_type" VARCHAR(50) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "status" VARCHAR(20) DEFAULT 'UPLOADED',
    "uploaded_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "issuer" VARCHAR(200) NOT NULL DEFAULT 'Republic of Mozambique',
    "isin" VARCHAR(20),
    "country" VARCHAR(100) DEFAULT 'Mozambique',
    "currency" VARCHAR(10) NOT NULL DEFAULT 'MZN',
    "coupon_rate" DECIMAL(5,2) NOT NULL,
    "yield_rate" DECIMAL(5,2),
    "coupon_frequency" VARCHAR(20) DEFAULT 'SEMI_ANNUAL',
    "face_value" DECIMAL(18,2) NOT NULL DEFAULT 1000,
    "min_investment" DECIMAL(18,2) NOT NULL,
    "max_investment" DECIMAL(18,2),
    "total_issuance" DECIMAL(18,2),
    "issue_date" DATE,
    "maturity_date" DATE NOT NULL,
    "auction_date" DATE,
    "subscription_deadline" TIMESTAMPTZ(6),
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bonds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_number" VARCHAR(20) NOT NULL,
    "investor_id" UUID NOT NULL,
    "bond_id" UUID NOT NULL,
    "requested_amount" DECIMAL(18,2) NOT NULL,
    "allocated_amount" DECIMAL(18,2),
    "units_allocated" DECIMAL(18,2),
    "price_per_unit" DECIMAL(18,2),
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
    "rejection_reason" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "investor_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'MZN',
    "payment_method" VARCHAR(50),
    "receipt_file_path" VARCHAR(500),
    "receipt_file_name" VARCHAR(255),
    "reference_number" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "verified_by" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bond_id" UUID NOT NULL,
    "total_government_allocation" DECIMAL(18,2) NOT NULL,
    "total_investor_demand" DECIMAL(18,2) NOT NULL,
    "allocation_ratio" DECIMAL(8,6),
    "status" VARCHAR(20) DEFAULT 'PENDING',
    "allocated_by" UUID NOT NULL,
    "allocated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_holdings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "investor_id" UUID NOT NULL,
    "bond_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "face_value_held" DECIMAL(18,2) NOT NULL,
    "purchase_price" DECIMAL(18,2) NOT NULL,
    "units_held" DECIMAL(18,2) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'ACTIVE',
    "acquired_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "holding_id" UUID NOT NULL,
    "investor_id" UUID NOT NULL,
    "bond_id" UUID NOT NULL,
    "payment_date" DATE NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'SCHEDULED',
    "paid_at" TIMESTAMPTZ(6),

    CONSTRAINT "coupon_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(50),
    "resource_id" UUID,
    "details" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50),
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "investor_profiles_user_id_key" ON "investor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_investor_profiles_user" ON "investor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_investor_profiles_kyc" ON "investor_profiles"("kyc_status");

-- CreateIndex
CREATE INDEX "idx_documents_user" ON "documents"("user_id");

-- CreateIndex
CREATE INDEX "idx_bonds_status" ON "bonds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "idx_orders_investor" ON "orders"("investor_id");

-- CreateIndex
CREATE INDEX "idx_orders_bond" ON "orders"("bond_id");

-- CreateIndex
CREATE INDEX "idx_orders_status" ON "orders"("status");

-- CreateIndex
CREATE INDEX "idx_payments_order" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "idx_payments_investor" ON "payments"("investor_id");

-- CreateIndex
CREATE INDEX "idx_portfolio_investor" ON "portfolio_holdings"("investor_id");

-- CreateIndex
CREATE INDEX "idx_portfolio_bond" ON "portfolio_holdings"("bond_id");

-- CreateIndex
CREATE INDEX "idx_coupon_holding" ON "coupon_payments"("holding_id");

-- CreateIndex
CREATE INDEX "idx_activity_user" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_activity_created" ON "activity_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_refresh_token" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "investor_profiles" ADD CONSTRAINT "investor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonds" ADD CONSTRAINT "bonds_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_bond_id_fkey" FOREIGN KEY ("bond_id") REFERENCES "bonds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_bond_id_fkey" FOREIGN KEY ("bond_id") REFERENCES "bonds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_allocated_by_fkey" FOREIGN KEY ("allocated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_bond_id_fkey" FOREIGN KEY ("bond_id") REFERENCES "bonds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_payments" ADD CONSTRAINT "coupon_payments_holding_id_fkey" FOREIGN KEY ("holding_id") REFERENCES "portfolio_holdings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_payments" ADD CONSTRAINT "coupon_payments_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_payments" ADD CONSTRAINT "coupon_payments_bond_id_fkey" FOREIGN KEY ("bond_id") REFERENCES "bonds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

