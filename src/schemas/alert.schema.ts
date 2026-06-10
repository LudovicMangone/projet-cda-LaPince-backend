import { z } from "zod";

export const updateAlertSchema = z.object({
	status: z.enum(["read", "unread", "resolved"]),
});

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;