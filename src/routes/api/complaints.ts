import { createFileRoute } from "@tanstack/react-router";
import { fetchComplaints, createComplaint } from "@/server/complaints";

export const Route = createFileRoute("/api/complaints")({
  server: {
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: async ({ request }) => {
          try {
            const url = new URL(request.url);
            const ward = url.searchParams.get("ward") ?? undefined;
            const category = url.searchParams.get("category") ?? undefined;
            const status = url.searchParams.get("status") ?? undefined;
            const search = url.searchParams.get("search") ?? undefined;
            const safetyOnly = url.searchParams.get("safety") === "true";
            const data = await fetchComplaints({ ward, category, status, search, safetyOnly });
            return Response.json(data);
          } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
          }
        },
        POST: async ({ request }) => {
          try {
            const body = await request.json();
            const created = await createComplaint(body);
            return Response.json(created, { status: 201 });
          } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 400 });
          }
        },
      }),
  },
});
