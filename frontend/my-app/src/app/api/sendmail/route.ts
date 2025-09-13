import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { to, subject, text, html } = await request.json();

    // For now, we'll use the admin's email as the 'from' address
    const from = 'ashtondsouza192@gmail.com';

    const msg = {
      to: to || 'ashtondsouza192@gmail.com', // Default to admin's email if no recipient specified
      from: {
        email: from,
        name: 'Admin Panel',
      },
      subject: subject || 'No Subject',
      text: text || '',
      html: html || text || '',
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
