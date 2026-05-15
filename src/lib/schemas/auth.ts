import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    rememberMe: z.boolean().optional(),
    fullName: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters long" }),
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits long" }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm password must be at least 6 characters long",
      }),
    storeName: z
      .string()
      .min(2, { message: "Store name must be at least 2 characters long" }),
    agreeTerms: z.boolean().refine((value) => value === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  rememberMe: z.boolean().optional(),
});
