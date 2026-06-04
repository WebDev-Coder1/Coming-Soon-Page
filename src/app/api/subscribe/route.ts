import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Local storage path for saving waitlist subscribers
const filePath = path.join(process.cwd(), 'waitlist.json');

// In-memory cache to track signups and prevent duplicates in serverless environments
const memoryWaitlist = new Set<string>();

// Helper to read waitlist emails from JSON file
const getWaitlist = (): string[] => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading waitlist file:', error);
    return [];
  }
};

// Helper to append a new email to the JSON file
const saveToWaitlist = (email: string, list: string[]) => {
  try {
    list.push(email);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to waitlist file:', error);
  }
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const waitlist = getWaitlist();

    // 1. Check for duplicates (both in static waitlist.json and in-memory cache)
    if (waitlist.includes(normalizedEmail) || memoryWaitlist.has(normalizedEmail)) {
      return NextResponse.json(
        { error: 'You are already in the waitlist!' },
        { status: 400 }
      );
    }

    // Save before sending to assign the spot number
    saveToWaitlist(normalizedEmail, waitlist);
    memoryWaitlist.add(normalizedEmail);
    
    // On Vercel, the file waitlist might not persist. So we use the max of memory and file lists
    const spotNumber = Math.max(waitlist.length, memoryWaitlist.size);

    // Log the signup to standard output (so it is recorded in Vercel logs)
    console.log(`[WAITLIST SIGNUP] Email: ${normalizedEmail} (Spot #${spotNumber})`);

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error('SMTP credentials missing in environment variables.');
      return NextResponse.json(
        { error: 'Email configuration is missing on the server. Please add EMAIL_USER and EMAIL_PASS environment variables in your Vercel settings.' },
        { status: 500 }
      );
    }

    // 2. Configure SMTP Transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const formattedDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

    // 3. Send Notification Email with Premium HTML styling
    await transporter.sendMail({
      from: `"kaifcoder.in Waitlist" <${emailUser}>`,
      to: 'kaif.webdev@gmail.com',
      subject: `🚀 New Waitlist Lead: ${normalizedEmail}`,
      text: `New subscriber email: ${normalizedEmail} (Status: Active)`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0a13; padding: 40px 20px; text-align: center; color: #fff;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #12111a; border: 1px solid #232230; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            
            <!-- Header Gradient Banner -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.05em; color: #ffffff;">KAIFCODER</h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #e0d7ff; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;">Waitlist Notification</p>
            </div>
            
            <!-- Body Content -->
            <div style="padding: 35px 25px; text-align: left;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700; color: #ffffff; text-align: center;">🎉 New Subscriber Secured!</h2>
              <p style="margin: 0 0 25px 0; font-size: 14px; color: #9e9cb4; line-height: 1.5; text-align: center;">
                A new user has requested early access and registered their interest in your upcoming portfolio:
              </p>
              
              <!-- Subscriber Email Card -->
              <div style="background-color: #1a1825; border: 1px solid #2d2a3f; padding: 18px; border-radius: 10px; text-align: center; margin-bottom: 25px;">
                <span style="display: block; font-size: 11px; color: #6e6b8a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px;">Subscriber Email</span>
                <a href="mailto:${normalizedEmail}" style="font-size: 17px; color: #818cf8; font-weight: 700; text-decoration: none; word-break: break-all;">
                  ${normalizedEmail}
                </a>
              </div>
              
              <!-- Info Details Table -->
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #8e8ba7;">
                <tr style="border-bottom: 1px solid #1f1d2c;">
                  <td style="padding: 10px 0; font-weight: 600; color: #6e6b8a;">Platform Source</td>
                  <td style="padding: 10px 0; text-align: right; color: #e2e8f0; font-weight: 500;">kaifcoder.in</td>
                </tr>
                <tr style="border-bottom: 1px solid #1f1d2c;">
                  <td style="padding: 10px 0; font-weight: 600; color: #6e6b8a;">Timestamp</td>
                  <td style="padding: 10px 0; text-align: right; color: #e2e8f0; font-weight: 500;">${formattedDate} (IST)</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600; color: #6e6b8a;">Status</td>
                  <td style="padding: 10px 0; text-align: right; color: #10b981; font-weight: 700;">Active</td>
                </tr>
              </table>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #0d0c15; padding: 20px; text-align: center; border-top: 1px solid #1b1a26;">
              <p style="margin: 0; font-size: 11px; color: #504e68;">
                &copy; ${new Date().getFullYear()} kaifcoder.in. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Nodemailer subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}
