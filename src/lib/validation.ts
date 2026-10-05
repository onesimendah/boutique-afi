import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(60),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Le panier est vide")
    .max(50),
});

export const updateOrderSchema = z.object({
  status: z.literal("CANCELLED"),
});
