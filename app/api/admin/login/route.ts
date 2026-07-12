import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAdminSession } from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const users = await prisma.$queryRaw<
      Array<{ id: string; email: string; role: string | null }>
    >`
      select u.id::text, u.email, p.role
      from auth.users u
      left join public."Profile" p on p."userId" = u.id::text
      where lower(u.email) = ${email}
        and u.encrypted_password = crypt(${password}, u.encrypted_password)
      limit 1
    `;

    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin role required." }, { status: 403 });
    }

    const token = createAdminSession(user.id, user.email);

    return NextResponse.json({
      token,
      user: {
        userId: user.id,
        email: user.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json(
      { error: "Admin login failed. Check server logs for details." },
      { status: 500 }
    );
  }
}
