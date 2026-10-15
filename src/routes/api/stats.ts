import { createFileRoute } from "@tanstack/react-router";
import { fetchWardStats, fetchSafetyMapData } from "@/server/stats";

export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: async ({ request }) => {
          try {
            const url = new URL(request.url);
            const ward = url.searchParams.get("ward") ?? "Ward 82";
            const type = url.searchParams.get("type");
            if (type === "map") {
              const mapData = await fetchSafetyMapData();
              return Response.json(mapData);
            }
            const stats = await fetchWardStats(ward);
            return Response.json(stats);
          } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
          }
        },
      }),
  },
});
