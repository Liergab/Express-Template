import { z } from "zod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const addressSchema = z
  .object({
    street: z.string().trim().optional(),
    barangay: z.string().trim().optional(),
    city: z.string().trim().optional(),
    municipality: z.string().trim().optional(),
    province: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
  })
  .optional();

export const ValidationSchemas = {
  idParam: z.object({
    id: z
      .string()
      .regex(objectIdRegex, "ID must be a valid 24-character ObjectId"),
  }),

  createUser: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    address: addressSchema,
  }),

  login: z.object({
    email: z.string().trim().email(),
    password: z.string().min(1, "Password is required"),
  }),

  updateUser: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      email: z.string().trim().email().optional(),
      password: z.string().min(8).optional(),
      address: addressSchema,
      isVerified: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required for update",
    }),

  getQueryParams: z.object({
    select: z.union([z.string(), z.array(z.string())]).optional(),
  }),

  getQueriesParams: z.object({
    filter: z.string().optional(),
    include: z.record(z.any()).optional(),
    select: z.union([z.string(), z.array(z.string())]).optional(),
    sort: z.union([z.string(), z.record(z.any())]).optional(),
    queryArray: z
      .union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])
      .optional(),
    queryArrayType: z
      .union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])
      .optional(),
    page: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      .optional(),
    limit: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      .optional(),
  }),

  searchQuery: z.object({
    search: z.string().trim().min(1).max(100),
  }),
};

export type IdParamType = z.infer<typeof ValidationSchemas.idParam>;
export type CreateUserDTO = z.infer<typeof ValidationSchemas.createUser>;
export type LoginDTO = z.infer<typeof ValidationSchemas.login>;
export type UpdateUserDTO = z.infer<typeof ValidationSchemas.updateUser>;
export type GetUserQueryDTO = z.infer<typeof ValidationSchemas.getQueryParams>;
export type GetUsersQueryDTO = z.infer<typeof ValidationSchemas.getQueriesParams>;
export type SearchUsersQueryDTO = z.infer<typeof ValidationSchemas.searchQuery>;
