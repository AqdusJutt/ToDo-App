'use server';

import { Resend } from 'resend';

export async function sendContactEmail(formData: FormData) {
  const fullName = formData.get('fullName')?.toString();
  const email = formData.get('email')?.toString();
  const message = formData.get('message')?.toString();

  if (!fullName || !email || !message) {
    return { success: false, error: 'Please fill out all fields.' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is missing. Set it in your .env.local file.');
    return { success: false, error: 'Email service not configured.' };
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: 'aqdussiddique@gmail.com',
      subject: `New message from ${fullName} via Contact Form`,
      replyTo: email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send message.' };
  }
}
