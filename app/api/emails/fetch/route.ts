import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchEmails } from '@/lib/gmail';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const maxResults = parseInt(searchParams.get('count') || '15', 10);

    const emails = await fetchEmails(session.accessToken, maxResults);

    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Error in fetch emails API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
