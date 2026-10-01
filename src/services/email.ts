import { SendMailClient } from "zeptomail";

interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  text: string;
  html?: string;
  fromName?: string;
}

interface ZeptoMailSentEntry {
  email_id?: string;
}

interface ZeptoMailResponse {
  data?: ZeptoMailSentEntry[];
  message?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function messageOf(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  const record = asRecord(value);
  const message = record?.message;
  return typeof message === "string" && message.length > 0
    ? message
    : undefined;
}
function createClient(): SendMailClient {
  const url = process.env.ZEPTOMAIL_URL;
  const token = process.env.ZEPTOMAIL_TOKEN;

  if (!url || !token) {
    throw new Error(
      "[ZeptoMail] Configuration missing: ZEPTOMAIL_URL or ZEPTOMAIL_TOKEN",
    );
  }

  const cleanToken = token.replace(/^(Zoho-enczapikey\s+)/i, "");
  const authToken = `Zoho-enczapikey ${cleanToken}`;
  return new SendMailClient({ url, token: authToken });
}

export async function sendEmail({
  to,
  toName,
  subject,
  text,
  html,
  fromName = "Digital Covet",
}: SendEmailOptions): Promise<void> {
  const senderAddress = process.env.ZEPTOMAIL_SENDER_ADDRESS;
  if (!senderAddress)
    throw new Error("[ZeptoMail] ZEPTOMAIL_SENDER_ADDRESS is not set.");

  const client = createClient();

  try {
    const rawResponse: unknown = await client.sendMail({
      from: { address: senderAddress, name: fromName },
      to: [
        {
          email_address: {
            address: to,
            name: toName ?? to.split("@")[0],
          },
        },
      ],
      subject,
      textbody: text,
      htmlbody: html ?? text,
    });
    const response = rawResponse as ZeptoMailResponse;

    if (response?.data && response.data.length > 0) {
      console.log(
        `✅ [ZeptoMail] Sent to <${to}>. ID: ${response.data[0].email_id}`,
      );
    } else {
      console.error(
        "❌ [ZeptoMail] Rejected Payload:",
        JSON.stringify(response, null, 2),
      );
      throw new Error(
        response.message ||
          JSON.stringify(response) ||
          "ZeptoMail rejected the email request.",
      );
    }
  } catch (error: unknown) {
    // ---------------------------------------------------------
    // 1. LOG THE ENTIRE ERROR OBJECT
    // ---------------------------------------------------------
    // This helps us see what properties the error actually has
    console.error(
      "🚨 [ZeptoMail] Raw Error Object:",
      JSON.stringify(error, null, 2),
    );

    let finalMessage = "Failed to send email via ZeptoMail.";
    const errorRecord = asRecord(error);

    // ---------------------------------------------------------
    // 2. EXTRACT MESSAGE DEFENSIVELY
    // ---------------------------------------------------------

    // Case A: Standard Error object
    if (error instanceof Error && error.message) {
      finalMessage = error.message;
    }
    // Case B: SDK/Library throws a plain object with 'error' property
    else if (errorRecord?.error) {
      finalMessage =
        typeof errorRecord.error === "string"
          ? errorRecord.error
          : JSON.stringify(errorRecord.error);
    }
    // Case C: SDK/Library throws a plain object with 'message' property (but not instanceof Error)
    else if (messageOf(error)) {
      finalMessage = messageOf(error) ?? finalMessage;
    }
    // Case D: Fallback to stringifying the whole object if it looks useful
    else if (error && typeof error === "object") {
      finalMessage = `ZeptoMail Error: ${JSON.stringify(error)}`;
    }

    // ---------------------------------------------------------
    // 3. CHECK FOR HTTP RESPONSE DETAILS (Axios/Request style)
    // ---------------------------------------------------------
    const responseRecord = asRecord(errorRecord?.response);
    if (responseRecord) {
      const status = responseRecord.status;
      const data = responseRecord.data;
      console.error("🚨 [ZeptoMail] Response Status:", status);

      if (data) {
        const dataMessage = messageOf(data);
        const apiMsg =
          typeof data === "string"
            ? data
            : (dataMessage ?? JSON.stringify(data));
        finalMessage += ` (Status ${String(status)}): ${apiMsg}`;
      }
    }

    // ---------------------------------------------------------
    // 4. THROW STANDARDIZED ERROR
    // ---------------------------------------------------------
    throw new Error(finalMessage);
  }
}
