"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeCallbackUrl } from "@/lib/safe-callback";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Podaj imię (min. 2 znaki)"),
  email: z.string().email("Nieprawidłowy e-mail"),
  password: z.string().min(6, "Hasło musi mieć min. 6 znaków"),
});

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy e-mail"),
  password: z.string().min(1, "Podaj hasło"),
});

export type FormState = {
  error?: string;
  success?: string;
};

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Błędne dane" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Konto z tym e-mailem już istnieje" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: "USER",
    },
  });

  const redirectTo = safeCallbackUrl(formData.get("callbackUrl"), "/");

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Konto utworzone, ale logowanie nie powiodło się" };
    }
    throw error;
  }

  return {};
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Błędne dane" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  const callback = safeCallbackUrl(formData.get("callbackUrl"), "");
  const redirectTo =
    callback || (existing?.role === "ADMIN" ? "/admin" : "/");

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Nieprawidłowy e-mail lub hasło" };
    }
    throw error;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
