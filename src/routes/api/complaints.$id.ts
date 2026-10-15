import { createFileRoute } from "@tanstack/react-router";
import { fetchComplaintById, updateComplaintStatus } from "@/server/complaints";

export const Route = createFileRoute("/api/complaints/$id")({
  server: {
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: async ({ params }) => {
          try {
            const complaint = await fetchComplaintById(params.id);
            if (!complaint) {
              return Response.json({ error: "Complaint not found" }, { status: 404 });
            }
            return Response.json(complaint);
          } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
          }
        },
        PATCH: async ({ params, request }) => {
          try {
            const body = await request.json();
            const updated = await updateComplaintStatus({
              id: params.id,
              ...body,
            });
            return Response.json(updated);
          } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 400 });
          }
        },
      }),
  },
});
