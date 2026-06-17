import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { businessName, contactName, email, website, message, page } = await request.json();

    await resend.emails.send({
      from: "Mallorca Verified <noreply@mallorcaverified.com>",
      to: "hola@mallorcaverified.com",
      ...(email ? { replyTo: email } : {}),
      subject: `Lead negocio: ${businessName || "(sin nombre)"}`,
      text: [
        `Negocio: ${businessName || "—"}`,
        contactName ? `Contacto: ${contactName}` : "",
        `Email: ${email || "—"}`,
        website ? `Web: ${website}` : "",
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
