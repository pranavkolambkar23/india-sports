const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

async function findUserByEmail(supabase, email) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw error;

    const user = data.users.find(
      (item) => item.email && item.email.toLowerCase() === email.toLowerCase()
    );
    if (user) return user;
    if (data.users.length < 1000) return null;
  }

  return null;
}

async function main() {
  loadEnvFile();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  const prisma = new PrismaClient();

  try {
    let action = "created";
    let user;

    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      user = await findUserByEmail(supabase, email);

      if (user) {
        const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
          password,
          email_confirm: true,
        });
        if (error) throw error;
        user = data.user;
        action = "updated existing";
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (error) throw error;
        user = data.user;
      }
    } else {
      const existing = await prisma.$queryRaw`
        select id::text, email
        from auth.users
        where lower(email) = lower(${email})
        limit 1
      `;

      if (existing.length > 0) {
        user = existing[0];
        action = "updated existing";

        await prisma.$executeRaw`
          update auth.users
          set
            encrypted_password = crypt(${password}, gen_salt('bf')),
            email_confirmed_at = coalesce(email_confirmed_at, now()),
            updated_at = now(),
            raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
            raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb),
            aud = 'authenticated',
            role = 'authenticated'
          where id = ${user.id}::uuid
        `;
      } else {
        user = {
          id: crypto.randomUUID(),
          email,
        };

        await prisma.$executeRaw`
          insert into auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
          )
          values (
            '00000000-0000-0000-0000-000000000000',
            ${user.id}::uuid,
            'authenticated',
            'authenticated',
            ${email},
            crypt(${password}, gen_salt('bf')),
            now(),
            jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
            '{}'::jsonb,
            now(),
            now(),
            '',
            '',
            '',
            ''
          )
        `;
      }

      await prisma.$executeRaw`
        insert into auth.identities (
          id,
          provider_id,
          user_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        )
        values (
          ${crypto.randomUUID()}::uuid,
          ${user.id},
          ${user.id}::uuid,
          jsonb_build_object('sub', ${user.id}, 'email', ${email}, 'email_verified', true),
          'email',
          now(),
          now(),
          now()
        )
        on conflict (provider, provider_id) do update
        set
          identity_data = excluded.identity_data,
          updated_at = now()
      `;
    }

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        email,
        name,
        role: "admin",
      },
      create: {
        userId: user.id,
        email,
        name,
        role: "admin",
      },
    });

    console.log(
      JSON.stringify(
        {
          action,
          userId: user.id,
          email,
          role: "admin",
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
