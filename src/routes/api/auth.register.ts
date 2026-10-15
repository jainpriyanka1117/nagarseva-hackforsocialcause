import { createFileRoute } from "@tanstack/react-router";
import { registerUser } from "@/server/auth";

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: ({ createHandlers }) =>
      createHandlers({
        POST: async ({ request }) => {
          try {
            const body = await request.json();
            const result = await registerUser(body);
            return Response.json(result, { status: 201 });
          } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 400 });
          }
        },
      }),
  },
});
