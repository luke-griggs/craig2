import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'SMS tool error: message text is required.' },
        { status: 400 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const defaultTo = process.env.MY_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        { success: false, error: 'SMS tool error: Twilio credentials are missing from the environment.' },
        { status: 500 }
      );
    }

    const destination = defaultTo;
    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'SMS tool error: destination number is not provided or configured.' },
        { status: 500 }
      );
    }

    try {
      const client = twilio(accountSid, authToken);
      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: destination,
      });

      const sidValue = result.sid || '';
      const sidSuffix = sidValue.slice(-6) || 'unknown';

      return NextResponse.json({
        success: true,
        message: `SMS sent successfully (${sidSuffix})`,
      });
    } catch (exc) {
      return NextResponse.json(
        { success: false, error: `SMS tool error: ${exc}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in SMS route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
