export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { LRUCache } from 'lru-cache';

const tokenCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60,
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  
  const tokenCount = (tokenCache.get(ip) as number) || 0;
  if (tokenCount >= 3) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Try again in a minute." }, 
      { status: 429 }
    );
  }
  tokenCache.set(ip, tokenCount + 1);

  try {
    const { firstName, lastName, email, role, topic, message } = await req.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: "contact@learnqhub.com",
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"LearnQHub Web" <contact@learnqhub.com>',
      to: "contact@learnqhub.com",
      replyTo: email,
      subject: `New Inquiry: ${topic}`,
      html: `
        <h2>Mesaj nou de pe site</h2>
        <p><strong>De la:</strong> ${firstName} ${lastName} (${email})</p>
        <p><strong>Rol:</strong> ${role}</p>
        <p><strong>Subiect:</strong> ${topic}</p>
        <p><strong>Mesaj:</strong> ${message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mail error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}