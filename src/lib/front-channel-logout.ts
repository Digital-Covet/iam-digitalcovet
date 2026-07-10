import { createHmac, randomUUID } from "node:crypto";
import { prisma } from "@/db";

const FRONT_CHANNEL_LOGOUT_PATH = "/api/auth/front-channel-logout";

interface LogoutNotification {
	sub: string;
	sid?: string;
	iss: string;
	events: Record<string, unknown>;
}

function createLogoutToken(payload: LogoutNotification, secret: string): string {
	const header = {
		alg: "HS256",
		typ: "JWT",
	};

	const now = Math.floor(Date.now() / 1000);
	const tokenPayload = {
		...payload,
		iat: now,
		jti: randomUUID(),
	};

	const headerBase64 = Buffer.from(JSON.stringify(header)).toString("base64url");
	const payloadBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");

	const signatureInput = `${headerBase64}.${payloadBase64}`;

	const signature = createHmac("sha256", secret)
		.update(signatureInput)
		.digest("base64url");

	return `${headerBase64}.${payloadBase64}.${signature}`;
}

export async function notifyFrontChannelLogout(
	userId: string,
	sessionId?: string,
): Promise<void> {
	const baseURL = process.env.BETTER_AUTH_URL || "https://iam.digitalcovet.com";
	const secret = process.env.BETTER_AUTH_SECRET || "";

	const clients = await prisma.oauthClient.findMany({
		where: {
			enableEndSession: true,
			postLogoutRedirectUris: {
				isNot: null,
			},
		},
		select: {
			clientId: true,
			postLogoutRedirectUris: true,
		},
	});

	if (clients.length === 0) {
		console.log("[front-channel-logout] No clients to notify");
		return;
	}

	const notification: LogoutNotification = {
		sub: userId,
		sid: sessionId,
		iss: `${baseURL}/api/auth`,
		events: {
			"http://schemas.openid.net/event/backchannel-logout": {},
		},
	};

	const logoutToken = createLogoutToken(notification, secret);

	const notifyPromises = clients.map(async (client) => {
		if (!client.postLogoutRedirectUris || client.postLogoutRedirectUris.length === 0) {
			return;
		}

		for (const redirectUri of client.postLogoutRedirectUris) {
			try {
				const logoutUrl = new URL(redirectUri);
				logoutUrl.pathname = FRONT_CHANNEL_LOGOUT_PATH;
				logoutUrl.searchParams.set("logout_token", logoutToken);

				console.log(`[front-channel-logout] Notifying ${client.clientId}:`, logoutUrl.toString());

				const response = await fetch(logoutUrl.toString(), {
					method: "GET",
					signal: AbortSignal.timeout(5000),
				});

				console.log(`[front-channel-logout] ${client.clientId} response:`, response.status);
			} catch (error) {
				console.error(`[front-channel-logout] Failed to notify ${client.clientId}:`, error);
			}
		}
	});

	await Promise.allSettled(notifyPromises);
}
