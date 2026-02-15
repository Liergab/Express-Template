import { z } from "zod";

export const ValidationSchemas = {
  idParam: z.object({
    id: z.string().min(1, "ID is required"),
  }),

  getQueryParams: z.object({
    select: z.union([z.string(), z.array(z.string())]).optional(),
  }),

  getQueriesParams: z.object({
    filter: z.string().optional(), // Simple filters: "field:value,field2:value2" or "nested.field:value"
    include: z.record(z.any()).optional(), // Include relations
    select: z.union([z.string(), z.array(z.string())]).optional(),
    sort: z.string().optional(),
    page: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      .optional(),
    limit: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
      .optional(),
  }),
};

export type IdParamType = z.infer<typeof ValidationSchemas.idParam>;
export type GetClientParamsType = z.infer<
  typeof ValidationSchemas.getQueryParams
>;
export type GetClientsParamsType = z.infer<
  typeof ValidationSchemas.getQueriesParams
>;
