/* <----- Types for auth pages ----- /> */

import { z } from "zod";

/* <----- Login ----- /> */
export const loginSchema = z.object({
    phone: z
        .string()
        .min(10, { message: "Phone number must be at least 10 digits" })
        .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number" }),
})

export type LoginField = z.infer<typeof loginSchema>


/* <----- Verify OTP ----- /> */
export const verifyOtpSchema = z.object({
    phone: z.string(),
    otp: z
        .string()
        .min(6, { message: "OTP must be at least 6 digits" })
        .regex(/^[0-9]+$/, { message: "OTP must contain only numbers" }),
})

export type VerifyOtpField = z.infer<typeof verifyOtpSchema>
