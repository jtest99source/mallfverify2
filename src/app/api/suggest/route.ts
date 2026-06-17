import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { businessName, area, email, page } = await request.json();

    if (!businessName?.trim()) {
      return NextResponse.json({ ok: false, error: "businessName required" }, { status: 400 });
    }

    await resend.emails.send({
      // After verifying mallorcaverified.com on Resend, change to: noreply@mallorcaverified.com
      from: "Mallorca Verified <onboarding@resend.dev>",
      to: "hola@mallorcaverified.com",
      ...(email ? { replyTo: email } : {}),
      subject: `Sugerencia: ${businessName}`,
      text: [
        `Negocio sugerido: ${businessName}`,
        `Zona: ${area || "—"}`,
        `Email contacto: ${email || "—"}`,
        `Página: ${page || "—"}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[suggest] email error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
