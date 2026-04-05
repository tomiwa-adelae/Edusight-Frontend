import z from "zod"

export const LoginSchema = z.object({
  email: z.string().email({ error: "Enter a valid email address" }),
  password: z.string().min(2, { message: "Enter your password" }),
})
export type LoginSchemaType = z.infer<typeof LoginSchema>

export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" })
      .max(100),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" })
      .max(100),
    email: z.string().email({ error: "Enter a valid email address" }),
    phoneNumber: z.string().optional(),
    role: z.enum(["STUDENT", "LECTURER", "ADMIN"], {
      message: "Please select a role",
    }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterSchemaType = z.infer<typeof RegisterSchema>
