import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db, ensureDbInitialized } from "../db/index";
import { users, type User } from "../db/schema";
import { hashPassword, verifyPassword, createToken } from "./crypto";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: "citizen" | "officer" | "admin";
  ward?: string;
  department?: string;
  phone?: string;
};

export async function loginUser(input: LoginInput) {
  await ensureDbInitialized();
  const list = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase().trim()));
  if (list.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = list[0]!;
  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const token = await createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    ward: user.ward ?? undefined,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ward: user.ward,
      department: user.department,
      phone: user.phone,
    },
  };
}

export async function registerUser(input: RegisterInput) {
  await ensureDbInitialized();
  const email = input.email.toLowerCase().trim();
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    throw new Error("A user with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const id = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const newUser = {
    id,
    name: input.name.trim(),
    email,
    passwordHash,
    role: input.role ?? "citizen",
    ward: input.ward ?? "Ward 82",
    department: input.department ?? null,
    phone: input.phone ?? null,
    createdAt: now,
  };

  await db.insert(users).values(newUser);

  const token = await createToken({
    userId: id,
    email,
    name: newUser.name,
    role: newUser.role,
    ward: newUser.ward ?? undefined,
  });

  return {
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      ward: newUser.ward,
      department: newUser.department,
      phone: newUser.phone,
    },
  };
}

export async function getUserProfile(userId: string) {
  await ensureDbInitialized();
  const list = await db.select().from(users).where(eq(users.id, userId));
  if (list.length === 0) return null;
  const u = list[0]!;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    ward: u.ward,
    department: u.department,
    phone: u.phone,
  };
}

export const loginServerFn = createServerFn({ method: "POST" })
  .validator((d: LoginInput) => d)
  .handler(async ({ data }) => {
    return loginUser(data);
  });

export const registerServerFn = createServerFn({ method: "POST" })
  .validator((d: RegisterInput) => d)
  .handler(async ({ data }) => {
    return registerUser(data);
  });

export const getProfileServerFn = createServerFn({ method: "GET" })
  .validator((d: { userId: string }) => d)
  .handler(async ({ data }) => {
    return getUserProfile(data.userId);
  });
