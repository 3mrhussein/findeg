CREATE TABLE "sales"."guest_access_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."guest_access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"consumed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "sales"."guest_access_codes" ADD CONSTRAINT "guest_access_codes_request_id_guest_access_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "sales"."guest_access_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."guest_access_requests" ADD CONSTRAINT "guest_access_requests_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_guest_access_codes_request_hash" ON "sales"."guest_access_codes" USING btree ("request_id","code_hash");--> statement-breakpoint
CREATE INDEX "idx_guest_access_requests_order" ON "sales"."guest_access_requests" USING btree ("order_id","created_at");