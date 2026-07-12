import crypto from "crypto";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export type AdminSessionPayload = {
  userId: string;
  email: string;
  role: "admin";
  exp: number;
};

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.DATABASE_URL ||
    "india-sports-local-admin-secret"
  );
}

function encode(value: AdminSessionPayload) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createAdminSession(userId: string, email: string) {
  const payload = encode({
    userId,
    email,
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(token: string): AdminSessionPayload | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (signature.length !== expected.length) return null;

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  ) {
    return null;
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!parsed || parsed.role !== "admin" || parsed.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return parsed;
}
