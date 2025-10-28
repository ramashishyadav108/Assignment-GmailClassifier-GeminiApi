import { google } from 'googleapis';
import { Email, GmailMessage } from '@/types/email';

export async function fetchEmails(accessToken: string, maxResults: number = 15): Promise<Email[]> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    // Fetch list of messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'in:inbox',
    });

    const messages = response.data.messages || [];

    // Fetch full details for each message
    const emailPromises = messages.map(async (message) => {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full',
      });

      return parseEmail(details.data as GmailMessage);
    });

    const emails = await Promise.all(emailPromises);
    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw new Error('Failed to fetch emails from Gmail');
  }
}

function parseEmail(message: GmailMessage): Email {
  const headers = message.payload.headers;

  const getHeader = (name: string): string => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  };

  const subject = getHeader('Subject');
  const from = getHeader('From');
  const date = getHeader('Date');

  // Extract email body
  let body = '';

  // Try to get plain text body
  if (message.payload.body?.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  } else if (message.payload.parts) {
    // Multi-part message
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        break;
      }
    }

    // If no plain text found, try HTML
    if (!body) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          // Strip HTML tags for better classification
          body = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          break;
        }
      }
    }
  }

  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from,
    date,
    snippet: message.snippet,
    body: body || message.snippet,
  };
}
