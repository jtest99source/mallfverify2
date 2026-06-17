import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { businessName, email, message, page } = await request.json();

    await resend.emails.send({
      // After verifying mallorcaverified.com on Resend, change to: noreply@mallorcaverified.com
      from: "Mallorca Verified <onboarding@resend.dev>",
      to: "hola@mallorcaverified.com",
      ...(email ? { replyTo: email } : {}),
      subject: `Lead negocio: ${businessName || "(sin nombre)"}`,
      text: [
        `Negocio: ${businessName || "—"}`,
        `Email contacto: ${email || "—"}`,
        `Página: ${page || "—"}`,
        message ? `\nMensaje: ${message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lead] email error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
