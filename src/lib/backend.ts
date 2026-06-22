import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

const SESSION_COOKIE = "neevai_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const MASTER_USER_ID = "master@neevai.local";
const MASTER_PASSWORD = "NeevAI@2026";

type UserRole = "master_admin" | "operator";

type UserRecord = {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt?: string;
};

type SessionRecord = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

type PilotRequest = {
  id: string;
  email: string;
  organisation: string;
  message: string;
  status: "new" | "reviewing" | "accepted";
  createdAt: string;
};

type AppDatabase = {
  version: 1;
  users: UserRecord[];
  sessions: SessionRecord[];
  pilotRequests: PilotRequest[];
  operations: Array<{
    id: string;
    name: string;
    status: "Healthy" | "Review" | "Attention";
    detail: string;
  }>;
  auditLog: Array<{
    id: string;
    actor: string;
    action: string;
    createdAt: string;
  }>;
};

type PublicUser = {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
};

type LoginInput = {
  userId: string;
  password: string;
};

type PilotRequestInput = {
  email: string;
  organisation?: string;
  message?: string;
};

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
});

async function getServerTools() {
  const [{ mkdir, readFile, writeFile }, path, crypto] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
    import("node:crypto"),
  ]);

  return { mkdir, readFile, writeFile, path, crypto };
}

async function getDatabasePath() {
  const { mkdir, path } = await getServerTools();
  const dataDir = path.join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });
  return path.join(dataDir, "neevai-db.json");
}

async function hashPassword(password: string, salt: string) {
  const { crypto } = await getServerTools();
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey.toString("hex"));
    });
  });
}

async function createUser(userId: string, password: string, name: string, role: UserRole) {
  const { crypto } = await getServerTools();
  const salt = crypto.randomBytes(16).toString("hex");
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    userId,
    name,
    role,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: now,
  } satisfies UserRecord;
}

async function createSeedDatabase(): Promise<AppDatabase> {
  const master = await createUser(
    MASTER_USER_ID,
    MASTER_PASSWORD,
    "NeevAI Master Admin",
    "master_admin",
  );

  return {
    version: 1,
    users: [master],
    sessions: [],
    pilotRequests: [
      {
        id: "req-bihar-health",
        email: "district.health@bihar.gov.in",
        organisation: "Bihar District Health Office",
        message: "Interested in an anemia and TB screening pilot for 80 ASHA workers.",
        status: "reviewing",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      },
      {
        id: "req-rural-care",
        email: "programs@ruralcare.org",
        organisation: "Rural Care Foundation",
        message: "Need offline cough-risk workflow for villages with poor connectivity.",
        status: "new",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
    ],
    operations: [
      {
        id: "op-tb-referral",
        name: "Bihar TB referral model",
        status: "Healthy",
        detail: "92% sync completion",
      },
      {
        id: "op-cough-classifier",
        name: "Jharkhand cough classifier",
        status: "Review",
        detail: "18 cases awaiting audit",
      },
      {
        id: "op-device-fleet",
        name: "ASHA worker device fleet",
        status: "Healthy",
        detail: "97% battery-ready",
      },
    ],
    auditLog: [
      {
        id: "audit-seed",
        actor: "system",
        action: "Seeded master admin and demo operations database.",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

async function readDatabase(): Promise<AppDatabase> {
  const { readFile, writeFile } = await getServerTools();
  const dbPath = await getDatabasePath();

  try {
    const raw = await readFile(dbPath, "utf8");
    const parsed = JSON.parse(raw) as AppDatabase;

    if (!parsed.users.some((user) => user.userId === MASTER_USER_ID)) {
      parsed.users.unshift(
        await createUser(MASTER_USER_ID, MASTER_PASSWORD, "NeevAI Master Admin", "master_admin"),
      );
      await writeDatabase(parsed);
    }

    return parsed;
  } catch {
    const seeded = await createSeedDatabase();
    await writeFile(dbPath, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

async function writeDatabase(database: AppDatabase) {
  const { writeFile } = await getServerTools();
  const dbPath = await getDatabasePath();
  await writeFile(dbPath, JSON.stringify(database, null, 2));
}

async function appendAudit(database: AppDatabase, actor: string, action: string) {
  const { crypto } = await getServerTools();
  database.auditLog.unshift({
    id: crypto.randomUUID(),
    actor,
    action,
    createdAt: new Date().toISOString(),
  });
  database.auditLog = database.auditLog.slice(0, 20);
}

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    userId: user.userId,
    name: user.name,
    role: user.role,
  };
}

async function getCurrentUserFromDatabase(database: AppDatabase) {
  const sessionId = getCookie(SESSION_COOKIE);
  if (!sessionId) return null;

  const now = Date.now();
  const session = database.sessions.find((item) => item.id === sessionId);
  if (!session || new Date(session.expiresAt).getTime() <= now) {
    database.sessions = database.sessions.filter((item) => item.id !== sessionId);
    await writeDatabase(database);
    deleteCookie(SESSION_COOKIE, { path: "/" });
    return null;
  }

  const user = database.users.find((item) => item.id === session.userId);
  return user ? toPublicUser(user) : null;
}

export const getSessionStatus = createServerFn({ method: "GET" }).handler(async () => {
  const database = await readDatabase();
  const user = await getCurrentUserFromDatabase(database);
  return { user };
});

export const login = createServerFn({ method: "POST" })
  .validator((input: LoginInput) => ({
    userId: String(input.userId ?? "")
      .trim()
      .toLowerCase(),
    password: String(input.password ?? ""),
  }))
  .handler(async ({ data }) => {
    const database = await readDatabase();
    const user = database.users.find((item) => item.userId.toLowerCase() === data.userId);

    if (!user) {
      return { ok: false, message: "Invalid user ID or password.", user: null };
    }

    const hash = await hashPassword(data.password, user.salt);
    if (hash !== user.passwordHash) {
      return { ok: false, message: "Invalid user ID or password.", user: null };
    }

    const { crypto } = await getServerTools();
    const now = new Date();
    const session: SessionRecord = {
      id: crypto.randomBytes(32).toString("hex"),
      userId: user.id,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
    };

    database.sessions = [
      session,
      ...database.sessions.filter((item) => new Date(item.expiresAt).getTime() > now.getTime()),
    ].slice(0, 50);
    user.lastLoginAt = now.toISOString();
    await appendAudit(database, user.userId, "Signed in to master console.");
    await writeDatabase(database);

    setCookie(SESSION_COOKIE, session.id, getCookieOptions());

    return { ok: true, message: "Signed in.", user: toPublicUser(user) };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const database = await readDatabase();
  const sessionId = getCookie(SESSION_COOKIE);

  if (sessionId) {
    database.sessions = database.sessions.filter((item) => item.id !== sessionId);
    await appendAudit(database, "master", "Signed out of master console.");
    await writeDatabase(database);
  }

  deleteCookie(SESSION_COOKIE, { path: "/" });
  return { ok: true };
});

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const database = await readDatabase();
  const user = await getCurrentUserFromDatabase(database);

  if (!user) {
    return { authenticated: false, user: null, dashboard: null };
  }

  const newRequests = database.pilotRequests.filter((request) => request.status === "new").length;
  const metrics = [
    { label: "Pilot workers", value: "2,300+" },
    { label: "Active villages", value: "14" },
    { label: "Sync queue", value: "128" },
    { label: "New requests", value: String(newRequests) },
  ];

  return {
    authenticated: true,
    user,
    dashboard: {
      metrics,
      operations: database.operations,
      pilotRequests: database.pilotRequests.slice(0, 8),
      auditLog: database.auditLog.slice(0, 8),
      users: database.users.map(toPublicUser),
    },
  };
});

export const submitPilotRequest = createServerFn({ method: "POST" })
  .validator((input: PilotRequestInput) => ({
    email: String(input.email ?? "")
      .trim()
      .toLowerCase(),
    organisation: String(input.organisation ?? "").trim(),
    message: String(input.message ?? "").trim(),
  }))
  .handler(async ({ data }) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { ok: false, message: "Please enter a valid email address." };
    }

    const { crypto } = await getServerTools();
    const database = await readDatabase();
    database.pilotRequests.unshift({
      id: crypto.randomUUID(),
      email: data.email,
      organisation: data.organisation || "Unknown organisation",
      message: data.message || "Pilot request submitted from NeevAI landing page.",
      status: "new",
      createdAt: new Date().toISOString(),
    });
    await appendAudit(database, "public", `New pilot request from ${data.email}.`);
    await writeDatabase(database);

    return { ok: true, message: "Request received. The NeevAI team will reach out soon." };
  });
