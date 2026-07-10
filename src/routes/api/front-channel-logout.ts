import type { APIEvent } from "@solidjs/start/server";
import { auth } from "@/lib/auth";
import { notifyFrontChannelLogout } from "@/lib/front-channel-logout";

export const POST = async (event: APIEvent) => {
	try {
		const session = await auth.api.getSession({
			headers: event.request.headers,
		});

		if (!session?.session) {
			return new Response(JSON.stringify({ error: "Not authenticated" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		const { userId, id: sessionId } = session.session;

		console.log("[front-channel-logout] Initiating logout notifications:", {
			userId,
			sessionId,
		});

		notifyFrontChannelLogout(userId, sessionId).catch((error) => {
			console.error("[front-channel-logout] Background notification failed:", error);
		});

		return new Response(JSON.stringify({ success: true, message: "Logout notifications initiated" }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("[front-channel-logout] Error:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
