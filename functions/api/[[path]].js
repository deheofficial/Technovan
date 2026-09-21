import { neon } from '@neondatabase/serverless';
import { hash, compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `c${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

function normalizeUser(row) {
  if (!row) return null;
  const { password, ...safe } = row;
  return safe;
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function getSql(env) {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured in Pages project secrets.');
  }
  return neon(env.DATABASE_URL);
}

function getJwtSecret(env) {
  const secret = env.JWT_SECRET || 'change-me-in-production';
  return new TextEncoder().encode(secret);
}

function mapChangeRequest(row) {
  return {
    ...row,
    project: row.project_id || row.projectId ? { id: row.project_id || row.projectId, title: row.project_title, status: row.project_status } : null,
    requestedBy: row.requester_id ? { id: row.requester_id, firstName: row.requester_first_name, lastName: row.requester_last_name, email: row.requester_email } : null,
    preparedBy: row.prepared_id ? { id: row.prepared_id, firstName: row.prepared_first_name, lastName: row.prepared_last_name, email: row.prepared_email } : null,
    approvedBy: row.approved_id ? { id: row.approved_id, firstName: row.approved_first_name, lastName: row.approved_last_name, email: row.approved_email } : null,
  };
}

async function signToken(env, user) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret(env));
}

async function getAuthUser(request, env, sql) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(env));
    const userId = String(payload.id || '');
    if (!userId) return null;

    const rows = await sql`
      SELECT id, email, "firstName", "lastName", phone, company, role, avatar, "isActive", "emailVerified", "createdAt", "updatedAt"
      FROM "User"
      WHERE id = ${userId}
      LIMIT 1
    `;

    return rows[0] || null;
  } catch {
    return null;
  }
}

async function requireAuth(request, env, sql) {
  const user = await getAuthUser(request, env, sql);
  if (!user) {
    return { error: json({ error: 'Unauthorized' }, 401) };
  }
  return { user };
}

async function requireAdmin(request, env, sql) {
  const auth = await requireAuth(request, env, sql);
  if (auth.error) return auth;
  if (auth.user.role !== 'ADMIN') {
    return { error: json({ error: 'Forbidden' }, 403) };
  }
  return auth;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  let sql;
  try {
    sql = getSql(env);
  } catch (error) {
    return json({ error: error.message }, 500);
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '');
  const method = request.method.toUpperCase();

  try {
    if (!path || path === 'health') {
      return json({ status: 'OK', timestamp: nowIso(), runtime: 'cloudflare-pages-functions' });
    }

    if (method === 'GET' && path === 'services') {
      const rows = await sql`
        SELECT id, title, description, icon, "order", "isActive", "createdAt", "updatedAt"
        FROM "Service"
        WHERE "isActive" = true
        ORDER BY "order" ASC
      `;
      return json(rows);
    }

    if (method === 'GET' && path === 'pricing') {
      const rows = await sql`
        SELECT id, name, price, currency, description, features, "isActive", "order", "createdAt", "updatedAt"
        FROM "Pricing"
        WHERE "isActive" = true
        ORDER BY "order" ASC
      `;
      return json(rows);
    }

    if (method === 'GET' && path === 'portfolio') {
      const rows = await sql`
        SELECT id, title, description, image, link, category, "isActive", "order", "createdAt", "updatedAt"
        FROM "Portfolio"
        WHERE "isActive" = true
        ORDER BY "order" ASC
      `;
      return json(rows);
    }

    if (method === 'GET' && path === 'blog') {
      const rows = await sql`
        SELECT id, title, content, excerpt, image, slug, published, "createdAt", "updatedAt"
        FROM "BlogPost"
        WHERE published = true
        ORDER BY "createdAt" DESC
      `;
      return json(rows);
    }

    if (method === 'GET' && path.startsWith('blog/')) {
      const slug = decodeURIComponent(path.slice('blog/'.length));
      const rows = await sql`
        SELECT id, title, content, excerpt, image, slug, published, "createdAt", "updatedAt"
        FROM "BlogPost"
        WHERE slug = ${slug} AND published = true
        LIMIT 1
      `;
      if (!rows[0]) return json({ error: 'Blog post not found' }, 404);
      return json(rows[0]);
    }

    if (method === 'POST' && path === 'contact') {
      const body = await parseBody(request);
      const { name, email, phone, message } = body;

      if (!name || !email || !message) {
        return json({ error: 'Missing required fields' }, 400);
      }

      const id = makeId();
      const rows = await sql`
        INSERT INTO "Inquiry" (id, name, email, phone, message, "isRead", responded)
        VALUES (${id}, ${name}, ${email}, ${phone || null}, ${message}, false, false)
        RETURNING id, name, email, phone, message, "isRead", responded, "createdAt", "updatedAt"
      `;

      return json({ message: 'Message sent successfully', inquiry: rows[0] }, 201);
    }

    if (method === 'POST' && path === 'auth/register') {
      const body = await parseBody(request);
      const { email, password, firstName, lastName } = body;

      if (!email || !password || !firstName || !lastName) {
        return json({ error: 'Missing required fields' }, 400);
      }

      const existing = await sql`SELECT id FROM "User" WHERE email = ${email} LIMIT 1`;
      if (existing[0]) {
        return json({ error: 'Email already registered' }, 400);
      }

      const userId = makeId();
      const hashedPassword = await hash(password, 10);

      const rows = await sql`
        INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "isActive", "emailVerified")
        VALUES (${userId}, ${email}, ${hashedPassword}, ${firstName}, ${lastName}, 'CUSTOMER'::"UserRole", true, false)
        RETURNING id, email, "firstName", "lastName", phone, company, role, avatar, "isActive", "emailVerified", "createdAt", "updatedAt"
      `;

      const user = rows[0];
      const token = await signToken(env, user);
      return json({ user: normalizeUser(user), token }, 201);
    }

    if (method === 'POST' && path === 'auth/login') {
      const body = await parseBody(request);
      const { email, password } = body;

      if (!email || !password) {
        return json({ error: 'Email and password are required' }, 400);
      }

      const rows = await sql`
        SELECT id, email, password, "firstName", "lastName", phone, company, role, avatar, "isActive", "emailVerified", "createdAt", "updatedAt"
        FROM "User"
        WHERE email = ${email}
        LIMIT 1
      `;

      const user = rows[0];
      if (!user) return json({ error: 'Invalid email or password' }, 401);

      const valid = await compare(password, user.password);
      if (!valid) return json({ error: 'Invalid email or password' }, 401);

      const token = await signToken(env, user);
      return json({ user: normalizeUser(user), token });
    }

    if (method === 'GET' && path === 'auth/profile') {
      const auth = await requireAuth(request, env, sql);
      if (auth.error) return auth.error;
      return json(auth.user);
    }

    if (method === 'GET' && path === 'projects') {
      const auth = await requireAuth(request, env, sql);
      if (auth.error) return auth.error;

      const rows = await sql`
        SELECT p.id, p.title, p.description, p.status, p."pricingId", p."userId", p.budget, p.deadline, p.files, p.notes, p."createdAt", p."updatedAt",
               pr.id AS pricing_id, pr.name AS pricing_name, pr.price AS pricing_price, pr.currency AS pricing_currency
        FROM "Project" p
        JOIN "Pricing" pr ON pr.id = p."pricingId"
        WHERE p."userId" = ${auth.user.id}
        ORDER BY p."createdAt" DESC
      `;

      const mapped = rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        pricingId: row.pricingId,
        userId: row.userId,
        budget: row.budget,
        deadline: row.deadline,
        files: row.files,
        notes: row.notes,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        pricing: {
          id: row.pricing_id,
          name: row.pricing_name,
          price: row.pricing_price,
          currency: row.pricing_currency,
        },
      }));

      return json(mapped);
    }

    if (method === 'POST' && path === 'projects') {
      const auth = await requireAuth(request, env, sql);
      if (auth.error) return auth.error;

      const body = await parseBody(request);
      const { title, description, pricingId, budget, deadline } = body;

      if (!title || !description || !pricingId) {
        return json({ error: 'Title, description and pricingId are required' }, 400);
      }

      const projectId = makeId();
      const rows = await sql`
        INSERT INTO "Project" (id, title, description, status, "pricingId", "userId", budget, deadline, files, notes, "createdAt", "updatedAt")
        VALUES (
          ${projectId},
          ${title},
          ${description},
          'PENDING'::"ProjectStatus",
          ${pricingId},
          ${auth.user.id},
          ${budget === undefined || budget === '' ? null : Number(budget)},
          ${deadline ? new Date(deadline).toISOString() : null},
          ${[]},
          ${null},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING id, title, description, status, "pricingId", "userId", budget, deadline, files, notes, "createdAt", "updatedAt"
      `;

      return json(rows[0], 201);
    }

    if (method === 'GET' && path === 'payments') {
      const auth = await requireAuth(request, env, sql);
      if (auth.error) return auth.error;

      const rows = await sql`
        SELECT id, amount, currency, status, method, "transactionId", "projectId", "userId", "invoiceUrl", description, "createdAt", "updatedAt"
        FROM "Payment"
        WHERE "userId" = ${auth.user.id}
        ORDER BY "createdAt" DESC
      `;

      return json(rows);
    }

    if (method === 'GET' && path === 'change-requests/users/options') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;
      const rows = await sql`
        SELECT id, "firstName", "lastName", email, role
        FROM "User"
        WHERE "isActive" = true
        ORDER BY "firstName", "lastName"
      `;
      return json(rows);
    }

    if (method === 'GET' && path === 'change-requests') {
      const auth = await requireAuth(request, env, sql);
      if (auth.error) return auth.error;
      const rows = auth.user.role === 'ADMIN' || auth.user.role === 'SUPPORT'
        ? await sql`
        SELECT cr.*, p.title AS project_title, p.status AS project_status,
          u.id AS requester_id, u."firstName" AS requester_first_name, u."lastName" AS requester_last_name,
          u.email AS requester_email, pb.id AS prepared_id, pb."firstName" AS prepared_first_name,
          pb."lastName" AS prepared_last_name, pb.email AS prepared_email,
          ab.id AS approved_id, ab."firstName" AS approved_first_name,
          ab."lastName" AS approved_last_name, ab.email AS approved_email
        FROM "ChangeRequest" cr
        LEFT JOIN "Project" p ON p.id = cr."projectId"
        LEFT JOIN "User" u ON u.id = cr."requestedById"
        LEFT JOIN "User" pb ON pb.id = cr."preparedById"
        LEFT JOIN "User" ab ON ab.id = cr."approvedById"
        ORDER BY cr."createdAt" DESC
      `
        : await sql`
        SELECT cr.*, p.title AS project_title, p.status AS project_status,
          u.id AS requester_id, u."firstName" AS requester_first_name, u."lastName" AS requester_last_name,
          u.email AS requester_email, pb.id AS prepared_id, pb."firstName" AS prepared_first_name,
          pb."lastName" AS prepared_last_name, pb.email AS prepared_email,
          ab.id AS approved_id, ab."firstName" AS approved_first_name,
          ab."lastName" AS approved_last_name, ab.email AS approved_email
        FROM "ChangeRequest" cr
        LEFT JOIN "Project" p ON p.id = cr."projectId"
        LEFT JOIN "User" u ON u.id = cr."requestedById"
        LEFT JOIN "User" pb ON pb.id = cr."preparedById"
        LEFT JOIN "User" ab ON ab.id = cr."approvedById"
        WHERE cr."requestedById" = ${auth.user.id}
        ORDER BY cr."createdAt" DESC
      `;
      return json(rows.map(mapChangeRequest));
    }

    if (method === 'POST' && path === 'change-requests') {
      const auth = await requireAuth(request, env, sql);
      if (auth.error) return auth.error;
      const body = await parseBody(request);
      const required = ['title', 'systemModule', 'description', 'currentBehaviour', 'proposedChange', 'businessJustification'];
      if (required.some((key) => !String(body[key] || '').trim())) return json({ error: 'All Change Request fields are required' }, 400);
      const year = new Date().getFullYear();
      const count = await sql`SELECT COUNT(*)::int AS count FROM "ChangeRequest" WHERE "crNumber" LIKE ${`CR-${year}-%`}`;
      const crNumber = `CR-${year}-${String((count[0]?.count || 0) + 1).padStart(4, '0')}`;
      const id = makeId();
      const status = body.action === 'submit' ? 'SUBMITTED' : 'DRAFT';
      const rows = await sql`
        INSERT INTO "ChangeRequest" (id, "crNumber", title, description, "requestType", "systemModule", priority, status, "currentBehaviour", "proposedChange", "businessJustification", "requestedById", "projectId", "requesterName", "requesterEmail", "preparedByName", "approvedByName", "submittedAt", "createdAt", "updatedAt")
        VALUES (${id}, ${crNumber}, ${body.title}, ${body.description}, ${(body.requestType || 'CHANGE_REQUEST')}::"ChangeRequestType", ${(body.systemModule)}, ${(body.priority || 'MEDIUM')}::"ChangeRequestPriority", ${status}::"ChangeRequestStatus", ${body.currentBehaviour}, ${body.proposedChange}, ${body.businessJustification}, ${auth.user.id}, ${body.projectId || null}, ${body.requesterName || null}, ${body.requesterEmail || null}, ${body.preparedByName || null}, ${body.approvedByName || null}, ${body.action === 'submit' ? new Date().toISOString() : null}, NOW(), NOW())
        RETURNING *
      `;
      await sql`INSERT INTO "ChangeRequestStatusHistory" (id, "changeRequestId", "toStatus", "changedById", comments, "createdAt") VALUES (${makeId()}, ${id}, ${status}::"ChangeRequestStatus", ${auth.user.id}, 'Request created', NOW())`;
      return json(rows[0], 201);
    }

    if (path.startsWith('change-requests/') && method === 'PATCH' && !path.endsWith('/transition')) {
      const auth = await requireAuth(request, env, sql);
      if (auth.error) return auth.error;
      const id = decodeURIComponent(path.slice('change-requests/'.length));
      const body = await parseBody(request);
      const rows = await sql`
        UPDATE "ChangeRequest" SET title=${body.title}, "requestType"=${body.requestType}::"ChangeRequestType", "systemModule"=${body.systemModule}, priority=${body.priority}::"ChangeRequestPriority", description=${body.description}, "currentBehaviour"=${body.currentBehaviour}, "proposedChange"=${body.proposedChange}, "businessJustification"=${body.businessJustification}, "projectId"=${body.projectId || null}, "requesterName"=${body.requesterName || null}, "requesterEmail"=${body.requesterEmail || null}, "preparedByName"=${body.preparedByName || null}, "approvedByName"=${body.approvedByName || null}, "updatedAt"=NOW()
        WHERE id=${id} RETURNING *
      `;
      if (!rows[0]) return json({ error: 'Change Request not found' }, 404);
      return json(rows[0]);
    }

    if (path.match(/^change-requests\/[^/]+\/transition$/) && method === 'PATCH') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;
      const id = decodeURIComponent(path.split('/')[1]);
      const body = await parseBody(request);
      const current = await sql`SELECT status FROM "ChangeRequest" WHERE id=${id}`;
      if (!current[0]) return json({ error: 'Change Request not found' }, 404);
      const rows = await sql`UPDATE "ChangeRequest" SET status=${body.status}::"ChangeRequestStatus", "submittedAt"=CASE WHEN ${body.status}='SUBMITTED' THEN COALESCE("submittedAt", NOW()) ELSE "submittedAt" END, "closedAt"=CASE WHEN ${body.status}='CLOSED' THEN NOW() ELSE "closedAt" END, "updatedAt"=NOW() WHERE id=${id} RETURNING *`;
      await sql`INSERT INTO "ChangeRequestStatusHistory" (id, "changeRequestId", "fromStatus", "toStatus", "changedById", comments, "createdAt") VALUES (${makeId()}, ${id}, ${current[0].status}::"ChangeRequestStatus", ${body.status}::"ChangeRequestStatus", ${auth.user.id}, ${body.comments || null}, NOW())`;
      return json(rows[0]);
    }

    if (method === 'GET' && path === 'quotation/templates') {
      const ownerKey = url.searchParams.get('ownerKey');
      if (!ownerKey) return json({ error: 'ownerKey is required' }, 400);

      const rows = await sql`
        SELECT id, "ownerKey", name, data, "createdAt", "updatedAt"
        FROM "QuotationTemplate"
        WHERE "ownerKey" = ${ownerKey}
        ORDER BY "updatedAt" DESC
      `;
      return json(rows);
    }

    if (method === 'POST' && path === 'quotation/templates') {
      const body = await parseBody(request);
      const { ownerKey, name, data } = body;
      if (!ownerKey || !name || !data) {
        return json({ error: 'ownerKey, name and data are required' }, 400);
      }

      const id = makeId();
      const rows = await sql`
        INSERT INTO "QuotationTemplate" (id, "ownerKey", name, data, "createdAt", "updatedAt")
        VALUES (${id}, ${ownerKey}, ${name}, ${JSON.stringify(data)}, NOW(), NOW())
        ON CONFLICT ("ownerKey", name)
        DO UPDATE SET data = EXCLUDED.data, "updatedAt" = NOW()
        RETURNING id, "ownerKey", name, data, "createdAt", "updatedAt"
      `;
      return json(rows[0], 201);
    }

    if (method === 'DELETE' && path.startsWith('quotation/templates/')) {
      const id = decodeURIComponent(path.slice('quotation/templates/'.length));
      const ownerKey = url.searchParams.get('ownerKey');
      if (!ownerKey) return json({ error: 'ownerKey is required' }, 400);

      const rows = await sql`
        DELETE FROM "QuotationTemplate"
        WHERE id = ${id} AND "ownerKey" = ${ownerKey}
        RETURNING id
      `;

      if (!rows[0]) return json({ error: 'Template not found' }, 404);
      return json({ success: true });
    }

    if (path === 'admin' && method === 'GET') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const [
        totalUsers,
        totalProjects,
        activeProjects,
        payments,
        recentProjects,
        recentInquiries,
      ] = await Promise.all([
        sql`SELECT COUNT(*)::int AS count FROM "User"`,
        sql`SELECT COUNT(*)::int AS count FROM "Project"`,
        sql`SELECT COUNT(*)::int AS count FROM "Project" WHERE status IN ('IN_PROGRESS'::"ProjectStatus", 'APPROVED'::"ProjectStatus")`,
        sql`SELECT COALESCE(SUM(amount), 0)::float8 AS total FROM "Payment" WHERE status = 'COMPLETED'::"PaymentStatus"`,
        sql`
          SELECT p.id, p.title, p.description, p.status, p."pricingId", p."userId", p.budget, p.deadline, p.files, p.notes, p."createdAt", p."updatedAt",
                 u.id AS user_id, u.email AS user_email, u."firstName" AS user_first_name, u."lastName" AS user_last_name, u.role AS user_role,
                 pr.id AS pricing_id, pr.name AS pricing_name, pr.price AS pricing_price, pr.currency AS pricing_currency
          FROM "Project" p
          LEFT JOIN "User" u ON u.id = p."userId"
          LEFT JOIN "Pricing" pr ON pr.id = p."pricingId"
          ORDER BY p."createdAt" DESC
          LIMIT 5
        `,
        sql`
          SELECT id, name, email, phone, message, "isRead", responded, "createdAt", "updatedAt"
          FROM "Inquiry"
          WHERE "isRead" = false
          ORDER BY "createdAt" DESC
          LIMIT 5
        `,
      ]);

      const mappedRecentProjects = recentProjects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        pricingId: p.pricingId,
        userId: p.userId,
        budget: p.budget,
        deadline: p.deadline,
        files: p.files,
        notes: p.notes,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        user: p.user_id
          ? {
              id: p.user_id,
              email: p.user_email,
              firstName: p.user_first_name,
              lastName: p.user_last_name,
              role: p.user_role,
            }
          : null,
        pricing: p.pricing_id
          ? {
              id: p.pricing_id,
              name: p.pricing_name,
              price: p.pricing_price,
              currency: p.pricing_currency,
            }
          : null,
      }));

      return json({
        stats: {
          totalUsers: totalUsers[0]?.count || 0,
          totalProjects: totalProjects[0]?.count || 0,
          activeProjects: activeProjects[0]?.count || 0,
          totalRevenue: payments[0]?.total || 0,
        },
        recentProjects: mappedRecentProjects,
        recentInquiries,
      });
    }

    if (path === 'admin/services' && method === 'POST') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const body = await parseBody(request);
      const { title, description, icon, order, isActive } = body;
      if (!title) return json({ error: 'Title is required' }, 400);

      const id = makeId();
      const rows = await sql`
        INSERT INTO "Service" (id, title, description, icon, "order", "isActive")
        VALUES (
          ${id},
          ${title},
          ${description || ''},
          ${icon || '⚙️'},
          ${Number(order || 0)},
          ${isActive !== false}
        )
        RETURNING id, title, description, icon, "order", "isActive", "createdAt", "updatedAt"
      `;
      return json(rows[0], 201);
    }

    if (path.startsWith('admin/services/') && method === 'PUT') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const id = decodeURIComponent(path.slice('admin/services/'.length));
      const body = await parseBody(request);

      const rows = await sql`
        UPDATE "Service"
        SET
          title = COALESCE(${typeof body.title === 'string' ? body.title : null}, title),
          description = COALESCE(${typeof body.description === 'string' ? body.description : null}, description),
          icon = COALESCE(${typeof body.icon === 'string' ? body.icon : null}, icon),
          "order" = COALESCE(${body.order === undefined ? null : Number(body.order)}, "order"),
          "isActive" = COALESCE(${typeof body.isActive === 'boolean' ? body.isActive : null}, "isActive"),
          "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING id, title, description, icon, "order", "isActive", "createdAt", "updatedAt"
      `;

      if (!rows[0]) return json({ error: 'Service not found' }, 404);
      return json(rows[0]);
    }

    if (path.startsWith('admin/services/') && method === 'DELETE') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const id = decodeURIComponent(path.slice('admin/services/'.length));
      const rows = await sql`DELETE FROM "Service" WHERE id = ${id} RETURNING id`;
      if (!rows[0]) return json({ error: 'Service not found' }, 404);
      return json({ message: 'Service deleted' });
    }

    if (path === 'admin/pricing' && method === 'POST') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const body = await parseBody(request);
      const { name, price, currency, description, features, order, isActive } = body;
      if (!name || price === undefined) {
        return json({ error: 'Name and price are required' }, 400);
      }

      const id = makeId();
      const rows = await sql`
        INSERT INTO "Pricing" (id, name, price, currency, description, features, "order", "isActive")
        VALUES (
          ${id},
          ${name},
          ${Number(price)},
          ${currency || 'RM'},
          ${description || ''},
          ${Array.isArray(features) ? features : []},
          ${Number(order || 0)},
          ${isActive !== false}
        )
        RETURNING id, name, price, currency, description, features, "order", "isActive", "createdAt", "updatedAt"
      `;
      return json(rows[0], 201);
    }

    if (path.startsWith('admin/pricing/') && method === 'PUT') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const id = decodeURIComponent(path.slice('admin/pricing/'.length));
      const body = await parseBody(request);

      const rows = await sql`
        UPDATE "Pricing"
        SET
          name = COALESCE(${typeof body.name === 'string' ? body.name : null}, name),
          price = COALESCE(${body.price === undefined ? null : Number(body.price)}, price),
          currency = COALESCE(${typeof body.currency === 'string' ? body.currency : null}, currency),
          description = COALESCE(${typeof body.description === 'string' ? body.description : null}, description),
          features = COALESCE(${Array.isArray(body.features) ? body.features : null}, features),
          "order" = COALESCE(${body.order === undefined ? null : Number(body.order)}, "order"),
          "isActive" = COALESCE(${typeof body.isActive === 'boolean' ? body.isActive : null}, "isActive"),
          "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING id, name, price, currency, description, features, "order", "isActive", "createdAt", "updatedAt"
      `;

      if (!rows[0]) return json({ error: 'Pricing plan not found' }, 404);
      return json(rows[0]);
    }

    if (path.startsWith('admin/pricing/') && method === 'DELETE') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const id = decodeURIComponent(path.slice('admin/pricing/'.length));
      const rows = await sql`DELETE FROM "Pricing" WHERE id = ${id} RETURNING id`;
      if (!rows[0]) return json({ error: 'Pricing plan not found' }, 404);
      return json({ message: 'Pricing plan deleted' });
    }

    if (path === 'admin/projects' && method === 'GET') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const rows = await sql`
        SELECT p.id, p.title, p.description, p.status, p."pricingId", p."userId", p.budget, p.deadline, p.files, p.notes, p."createdAt", p."updatedAt",
               u.id AS user_id, u.email AS user_email, u."firstName" AS user_first_name, u."lastName" AS user_last_name, u.role AS user_role,
               pr.id AS pricing_id, pr.name AS pricing_name, pr.price AS pricing_price, pr.currency AS pricing_currency,
               pr.description AS pricing_description, pr.features AS pricing_features, pr."isActive" AS pricing_is_active, pr."order" AS pricing_order,
               pr."createdAt" AS pricing_created_at, pr."updatedAt" AS pricing_updated_at
        FROM "Project" p
        LEFT JOIN "User" u ON u.id = p."userId"
        LEFT JOIN "Pricing" pr ON pr.id = p."pricingId"
        ORDER BY p."createdAt" DESC
      `;

      const mapped = rows.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        pricingId: p.pricingId,
        userId: p.userId,
        budget: p.budget,
        deadline: p.deadline,
        files: p.files,
        notes: p.notes,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        user: p.user_id
          ? {
              id: p.user_id,
              email: p.user_email,
              firstName: p.user_first_name,
              lastName: p.user_last_name,
              role: p.user_role,
            }
          : null,
        pricing: p.pricing_id
          ? {
              id: p.pricing_id,
              name: p.pricing_name,
              price: p.pricing_price,
              currency: p.pricing_currency,
              description: p.pricing_description,
              features: p.pricing_features,
              isActive: p.pricing_is_active,
              order: p.pricing_order,
              createdAt: p.pricing_created_at,
              updatedAt: p.pricing_updated_at,
            }
          : null,
      }));

      return json(mapped);
    }

    if (path.startsWith('admin/projects/') && method === 'PUT') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const id = decodeURIComponent(path.slice('admin/projects/'.length));
      const body = await parseBody(request);
      const status = body.status;
      const allowedStatuses = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

      if (status !== undefined && !allowedStatuses.includes(status)) {
        return json({ error: 'Invalid project status' }, 400);
      }

      const rows = await sql`
        UPDATE "Project"
        SET
          status = COALESCE(${status || null}::"ProjectStatus", status),
          notes = COALESCE(${typeof body.notes === 'string' ? body.notes : null}, notes),
          "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING id, title, description, status, "pricingId", "userId", budget, deadline, files, notes, "createdAt", "updatedAt"
      `;

      if (!rows[0]) return json({ error: 'Project not found' }, 404);
      return json(rows[0]);
    }

    if (path === 'admin/inquiries' && method === 'GET') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const rows = await sql`
        SELECT id, name, email, phone, message, "isRead", responded, "createdAt", "updatedAt"
        FROM "Inquiry"
        ORDER BY "createdAt" DESC
      `;
      return json(rows);
    }

    if (path.startsWith('admin/inquiries/') && method === 'PUT') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const id = decodeURIComponent(path.slice('admin/inquiries/'.length));
      const body = await parseBody(request);

      const rows = await sql`
        UPDATE "Inquiry"
        SET
          "isRead" = true,
          responded = COALESCE(${body.responded === true ? true : null}, responded),
          "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING id, name, email, phone, message, "isRead", responded, "createdAt", "updatedAt"
      `;

      if (!rows[0]) return json({ error: 'Inquiry not found' }, 404);
      return json(rows[0]);
    }

    if (path === 'admin/blog' && method === 'GET') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const rows = await sql`
        SELECT id, title, content, excerpt, image, slug, published, "createdAt", "updatedAt"
        FROM "BlogPost"
        ORDER BY "createdAt" DESC
      `;
      return json(rows);
    }

    if (path === 'admin/blog' && method === 'POST') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const body = await parseBody(request);
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : null;
      const image = typeof body.image === 'string' ? body.image.trim() : null;
      const requestedSlug = typeof body.slug === 'string' ? body.slug.trim() : '';
      const published = typeof body.published === 'boolean' ? body.published : true;

      if (!title || !content) {
        return json({ error: 'Title and content are required' }, 400);
      }

      const baseSlug = (requestedSlug || title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') || 'post';

      let slug = baseSlug;
      let suffix = 1;
      while (true) {
        const existing = await sql`SELECT id FROM "BlogPost" WHERE slug = ${slug} LIMIT 1`;
        if (!existing[0]) break;
        slug = `${baseSlug}-${suffix++}`;
      }

      const id = makeId();
      const rows = await sql`
        INSERT INTO "BlogPost" (id, title, content, excerpt, image, slug, published)
        VALUES (${id}, ${title}, ${content}, ${excerpt}, ${image}, ${slug}, ${published})
        RETURNING id, title, content, excerpt, image, slug, published, "createdAt", "updatedAt"
      `;
      return json(rows[0], 201);
    }

    if (path.startsWith('admin/blog/') && method === 'PUT') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const id = decodeURIComponent(path.slice('admin/blog/'.length));
      const body = await parseBody(request);

      const existingRows = await sql`SELECT id, title FROM "BlogPost" WHERE id = ${id} LIMIT 1`;
      const existing = existingRows[0];
      if (!existing) return json({ error: 'Blog post not found' }, 404);

      const newTitle = typeof body.title === 'string' ? body.title.trim() : null;
      const requestedSlug = typeof body.slug === 'string' ? body.slug.trim() : null;
      let slug = null;

      if (requestedSlug !== null || newTitle !== null) {
        const rawSlug = (requestedSlug || newTitle || existing.title)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-') || 'post';

        let candidate = rawSlug;
        let suffix = 1;
        while (true) {
          const used = await sql`
            SELECT id
            FROM "BlogPost"
            WHERE slug = ${candidate} AND id <> ${id}
            LIMIT 1
          `;
          if (!used[0]) {
            slug = candidate;
            break;
          }
          candidate = `${rawSlug}-${suffix++}`;
        }
      }

      const rows = await sql`
        UPDATE "BlogPost"
        SET
          title = COALESCE(${newTitle}, title),
          content = COALESCE(${typeof body.content === 'string' ? body.content.trim() : null}, content),
          excerpt = COALESCE(${typeof body.excerpt === 'string' ? body.excerpt.trim() : null}, excerpt),
          image = COALESCE(${typeof body.image === 'string' ? body.image.trim() : null}, image),
          slug = COALESCE(${slug}, slug),
          published = COALESCE(${typeof body.published === 'boolean' ? body.published : null}, published),
          "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING id, title, content, excerpt, image, slug, published, "createdAt", "updatedAt"
      `;

      return json(rows[0]);
    }

    if (path.startsWith('admin/blog/') && method === 'DELETE') {
      const auth = await requireAdmin(request, env, sql);
      if (auth.error) return auth.error;

      const id = decodeURIComponent(path.slice('admin/blog/'.length));
      const rows = await sql`DELETE FROM "BlogPost" WHERE id = ${id} RETURNING id`;
      if (!rows[0]) return json({ error: 'Blog post not found' }, 404);
      return json({ message: 'Blog post deleted' });
    }

    return json({ error: 'API route not found', path: `/${path}` }, 404);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}
