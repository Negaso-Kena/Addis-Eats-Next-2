import { z } from "zod";
import { DELIVERY_AREAS } from "./delivery";

const AREA_VALUES = DELIVERY_AREAS.map((a) => a.value);

export const orderItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  quantity: z.coerce.number().int().positive(),
});

// Same rules as Day 35's checkout/validate.js — carried over, not reinvented.
export const orderSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+251|0)[97]\d{8}$/, "Enter a valid Ethiopian phone number (e.g. 0912 345 678)."),
  area: z.enum(AREA_VALUES, {
    errorMap: () => ({ message: "Please select a delivery area." }),
  }),
  note: z.string().trim().max(200).optional().default(""),
  items: z.array(orderItemSchema).min(1, "Your cart is empty."),
});