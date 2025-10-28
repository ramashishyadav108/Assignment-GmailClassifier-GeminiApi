export type EmailCategory = 'Important' | 'Promotional' | 'Social' | 'Marketing' | 'Spam' | 'General';

export interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
  category?: EmailCategory;
}

export interface ClassificationResult {
  category: EmailCategory;
  confidence?: number;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body?: {
        data?: string;
      };
      parts?: any[];
    }>;
  };
  internalDate: string;
}
