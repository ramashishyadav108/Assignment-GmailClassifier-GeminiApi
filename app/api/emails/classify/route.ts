import { NextRequest, NextResponse } from 'next/server';
import { classifyEmails } from '@/lib/classifier';
import { Email } from '@/types/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails, geminiKey } = body;

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Invalid emails data' },
        { status: 400 }
      );
    }

    if (!geminiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is required' },
        { status: 400 }
      );
    }

    const classifiedEmails = await classifyEmails(emails as Email[], geminiKey);

    return NextResponse.json({ emails: classifiedEmails });
  } catch (error) {
    console.error('Error in classify emails API:', error);
    return NextResponse.json(
      { error: 'Failed to classify emails' },
      { status: 500 }
    );
  }
}
