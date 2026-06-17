import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { businessName, area, link, email, notes, page } = await request.json();

    if (!businessName?.trim()) {
      return NextResponse.json({ ok: false, error: "businessName required" }, { status: 400 });
    }

    await resend.emails.send({
      from: "Mallorca Verified <noreply@mallorcaverified.com>",
      to: "hola@mallorcaverified.com",
      ...(email ? { replyTo: email } : {}),
      subject: `Sugerencia: ${businessName}`,
      text: [
        `Negocio sugerido: ${businessName}`,
        `Zona: ${area || "—"}`,
        `Link: ${link || "—"}`,
        `Email contacto: ${email || "—"}`,
        notes ? `\nNotas: ${notes}` : "",
        `\nPágina: ${page || "—"}`,
      ].filter(Boolean).join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[suggest] email error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
