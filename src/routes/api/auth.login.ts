import { createFileRoute } from "@tanstack/react-router";
import { loginUser } from "@/server/auth";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: ({ createHandlers }) =>
      createHandlers({
        POST: async ({ request }) => {
          try {
            const body = await request.json();
            const result = await loginUser(body);
            return Response.json(result);
          } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 401 });
          }
        },
      }),
  },
});
