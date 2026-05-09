export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, role, topic, message } = await req.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: "contact@learnqhub.com",
        pass: "TMVA#mihanaZoho22",
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
    return NextResponse.json({ success: false }, { status: 500 });
  }
}