import { z } from "zod"

// Schema untuk registrasi
export const registerSchema = z
  .object({
    email: z.string().email({ message: "Format email tidak valid" }),
    password: z
      .string()
      .min(8, { message: "Password minimal 8 karakter" })
      .regex(/[A-Z]/, { message: "Password harus mengandung minimal 1 huruf besar" })
      .regex(/[0-9]/, { message: "Password harus mengandung minimal 1 angka" }),
    repassword: z.string(),
  })
  .refine((data) => data.password === data.repassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["repassword"],
  })

// Schema untuk login
export const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(1, { message: "Password tidak boleh kosong" }),
})

// Schema untuk forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
})

// Schema untuk reset password
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Token tidak valid" }),
    password: z
      .string()
      .min(8, { message: "Password minimal 8 karakter" })
      .regex(/[A-Z]/, { message: "Password harus mengandung minimal 1 huruf besar" })
      .regex(/[0-9]/, { message: "Password harus mengandung minimal 1 angka" }),
    repassword: z.string(),
  })
  .refine((data) => data.password === data.repassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["repassword"],
  })
