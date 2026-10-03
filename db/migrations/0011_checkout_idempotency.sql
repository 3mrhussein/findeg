CREATE TABLE "sales"."checkout_idempotency" (
	"id" serial PRIMARY KEY NOT NULL,
	"scope" varchar(255) NOT NULL,
	"key" varchar(255) NOT NULL,
	"fingerprint" varchar(64) NOT NULL,
	"order_id" integer,
	"order_reference" text,
	"response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sales"."checkout_idempotency" ADD CONSTRAINT "checkout_idempotency_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_checkout_idempotency_scope_key" ON "sales"."checkout_idempotency" USING btree ("scope","key");