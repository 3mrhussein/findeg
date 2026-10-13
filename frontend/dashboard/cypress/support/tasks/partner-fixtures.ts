import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import type {
  BusinessPartnerStatus,
  PartnerMembershipStatus,
  SupplyListStatus,
} from '@findeg/domain';

function readDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envFile = readFileSync(path.resolve(process.cwd(), '../../.env'), 'utf8');
  const line = envFile.split('\n').find((l) => l.startsWith('DATABASE_URL='));
  if (!line) throw new Error('DATABASE_URL is not set');
  return line.slice('DATABASE_URL='.length).trim();
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

function assertLocalDatabase(url: string): void {
  const host = new URL(url).hostname;
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(
      `Refusing to run partner fixture tasks against non-local database host "${host}"`,
    );
  }
}

async function withSql<T>(fn: (sql: postgres.Sql) => Promise<T>): Promise<T> {
  const url = readDatabaseUrl();
  assertLocalDatabase(url);
  const sql = postgres(url, { max: 1 });
  try {
    return await fn(sql);
  } finally {
    await sql.end();
  }
}

export interface CreatedTestPartner {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  status: string;
}

export interface CreatePartnerOptions {
  code?: string;
  nameEn?: string;
  nameAr?: string;
  status?: BusinessPartnerStatus;
  profile?: {
    governorate: string;
    area: string;
    schoolType: string;
    academicSystem: string;
    logoUrl?: string | null;
  };
}

export interface AddPartnerMemberOptions {
  partnerId: number;
  email?: string;
  roles?: string[];
  status?: PartnerMembershipStatus;
}

export interface AddPartnerInvitationOptions {
  partnerId: number;
  email?: string;
  roles?: string[];
  expiresInDays?: number; // negative for expired
}

export const partnerFixtureTasks = {
  createTestPartner(options: CreatePartnerOptions = {}): Promise<CreatedTestPartner> {
    return withSql(async (sql) => {
      const tag = randomBytes(4).toString('hex');
      const code = options.code ?? `partner-${tag}`;
      const nameEn = options.nameEn ?? `Partner ${tag}`;
      const nameAr = options.nameAr ?? `شريك ${tag}`;
      const status = options.status ?? 'onboarding';

      const [partner] = await sql<CreatedTestPartner[]>`
        insert into identity.business_partners (code, name_en, name_ar, status)
        values (${code}, ${nameEn}, ${nameAr}, ${status})
        returning id, code, name_en as "nameEn", name_ar as "nameAr", status
      `;

      if (options.profile) {
        await sql`
          insert into school_engine.partner_school_profiles
            (business_partner_id, governorate, area, school_type, academic_system, logo_url)
          values (
            ${partner.id},
            ${options.profile.governorate},
            ${options.profile.area},
            ${options.profile.schoolType},
            ${options.profile.academicSystem},
            ${options.profile.logoUrl ?? null}
          )
        `;
      }

      return partner;
    });
  },

  addTestPartnerMember(options: AddPartnerMemberOptions): Promise<{ id: number; email: string }> {
    return withSql(async (sql) => {
      const tag = randomBytes(4).toString('hex');
      const email = options.email ?? `member-${tag}@findeg.test`;
      const roles = options.roles ?? ['partner-administrator'];
      const status = options.status ?? 'active';

      let [user] = await sql<
        { id: number }[]
      >`select id from identity.users where email = ${email}`;
      if (!user) {
        [user] = await sql<{ id: number }[]>`
          insert into identity.users (email, portal_role)
          values (${email}, 'customer')
          returning id
        `;
      }

      // Partner memberships require an invitation_id in schema
      const [invitation] = await sql<{ id: number }[]>`
        insert into identity.partner_invitations
          (business_partner_id, email, roles, status, invited_by_user_id, expires_at)
        values (
          ${options.partnerId},
          ${email},
          ${roles},
          'accepted',
          ${user.id},
          now() + interval '7 days'
        )
        returning id
      `;

      const [member] = await sql<{ id: number }[]>`
        insert into identity.partner_memberships
          (business_partner_id, user_id, invitation_id, roles, status)
        values (
          ${options.partnerId},
          ${user.id},
          ${invitation.id},
          ${roles},
          ${status}
        )
        returning id
      `;

      return { id: member.id, email };
    });
  },

  addTestPartnerInvitation(
    options: AddPartnerInvitationOptions,
  ): Promise<{ id: number; email: string }> {
    return withSql(async (sql) => {
      const tag = randomBytes(4).toString('hex');
      const email = options.email ?? `invite-${tag}@findeg.test`;
      const roles = options.roles ?? ['partner-administrator'];
      const days = options.expiresInDays ?? 7;

      const [adminUser] = await sql<{ id: number }[]>`select id from identity.users limit 1`;

      const [invitation] = await sql<{ id: number }[]>`
        insert into identity.partner_invitations
          (business_partner_id, email, roles, status, invited_by_user_id, expires_at)
        values (
          ${options.partnerId},
          ${email},
          ${roles},
          'pending',
          ${adminUser.id},
          now() + (${days} || ' days')::interval
        )
        returning id
      `;

      const digest = randomBytes(32).toString('hex');
      await sql`
        insert into identity.partner_invitation_tokens (invitation_id, token_digest)
        values (${invitation.id}, ${digest})
      `;

      return { id: invitation.id, email };
    });
  },

  createTestPartnerSales(options: {
    partnerId: number;
    amount?: string;
  }): Promise<{ orderId: number; listId: number }> {
    return withSql(async (sql) => {
      const tag = randomBytes(4).toString('hex');
      const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      const reference = `FE-${code}`;

      const publicCode = randomBytes(16).toString('hex');

      // Insert school supply list
      const [list] = await sql<{ id: number; publicCode: string; publishedAt: string }[]>`
        insert into school_engine.school_supply_lists
          (business_partner_id, grade, academic_year, localized_title, status, public_code, published_at)
        values (
          ${options.partnerId},
          'Grade 1',
          '2026/2027',
          ${sql.json({ en: 'Grade 1 Supply List', ar: 'قائمة الصف الأول' })},
          'published',
          ${publicCode},
          now()
        )
        returning id, public_code as "publicCode", published_at as "publishedAt"
      `;

      // Get or create product and variant
      let [variant] = await sql<{ id: number; productId: number }[]>`
        select id, product_id as "productId" from catalog.product_variants limit 1
      `;

      // Insert attributed order
      const [order] = await sql<{ id: number }[]>`
        insert into sales.orders
          (order_reference, guest_email, business_partner_id, school_supply_list_id,
           school_supply_list_public_code, school_supply_list_published_at,
           status, payment_status, subtotal, total_amount, currency,
           shipping_address_snapshot)
        values (
          ${reference},
          ${`sales-${tag}@example.test`},
          ${options.partnerId},
          ${list.id},
          ${list.publicCode},
          ${list.publishedAt},
          'delivered',
          'paid',
          ${options.amount ?? '250.00'},
          ${options.amount ?? '250.00'},
          'EGP',
          ${sql.json({ fullName: 'Partner Customer', phone: '01012345678', city: 'Cairo', area: 'Maadi' })}
        )
        returning id
      `;

      if (variant) {
        await sql`
          insert into sales.order_items
            (order_id, product_id, variant_id, quantity, unit_price, line_total, product_name_snapshot)
          values (
            ${order.id},
            ${variant.productId},
            ${variant.id},
            2,
            '125.00',
            '250.00',
            'Colored Pencils'
          )
        `;
      }

      return { orderId: order.id, listId: list.id };
    });
  },

  setTestPartnerStatus(options: {
    partnerId: number;
    status: BusinessPartnerStatus;
  }): Promise<{ success: boolean }> {
    return withSql(async (sql) => {
      await sql`
        update identity.business_partners
        set status = ${options.status}
        where id = ${options.partnerId}
      `;
      return { success: true };
    });
  },

  createTestSupplyList(options: {
    partnerId: number;
    grade?: string;
    academicYear?: string;
    status?: SupplyListStatus;
    titleEn?: string;
    titleAr?: string;
  }): Promise<{ id: number }> {
    return withSql(async (sql) => {
      const tag = randomBytes(4).toString('hex');
      const grade = options.grade ?? 'Grade 1';
      const academicYear = options.academicYear ?? '2026-2027';
      const status = options.status ?? 'draft';
      const titleEn = options.titleEn ?? `Supply List ${tag}`;
      const titleAr = options.titleAr ?? `قائمة مستلزمات ${tag}`;

      const [row] = await sql<{ id: number }[]>`
        insert into school_engine.school_supply_lists
          (business_partner_id, grade, academic_year, status, localized_title, public_code, published_at)
        values (
          ${options.partnerId},
          ${grade},
          ${academicYear},
          ${status},
          ${sql.json({ en: titleEn, ar: titleAr })},
          ${status === 'published' ? randomBytes(16).toString('hex') : null},
          ${status === 'published' ? sql`now()` : null}
        )
        returning id
      `;
      return { id: row.id };
    });
  },

  addTestSupplyListItem(options: {
    listId: number;
    labelEn?: string;
    labelAr?: string;
    quantity?: number;
    required?: boolean;
    exactItem?: boolean;
    variantId?: number | null;
    specification?: { categoryId: number; attributes: Record<string, string> } | null;
  }): Promise<{ id: number }> {
    return withSql(async (sql) => {
      const tag = randomBytes(4).toString('hex');
      const labelEn = options.labelEn ?? `Item ${tag}`;
      const labelAr = options.labelAr ?? `بند ${tag}`;
      const quantity = options.quantity ?? 1;
      const required = options.required ?? true;
      const exactItem = options.exactItem ?? true;
      const variantId = options.variantId ?? null;
      const specification = options.specification ? sql.json(options.specification) : null;

      const [row] = await sql<{ id: number }[]>`
        insert into school_engine.school_supply_list_items
          (list_id, localized_label, quantity, required, exact_item, variant_id, specification)
        values (
          ${options.listId},
          ${sql.json({ en: labelEn, ar: labelAr })},
          ${quantity},
          ${required},
          ${exactItem},
          ${variantId},
          ${specification}
        )
        returning id
      `;
      return { id: row.id };
    });
  },
};
