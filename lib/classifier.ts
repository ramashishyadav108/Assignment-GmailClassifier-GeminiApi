import { GoogleGenerativeAI } from '@google/generative-ai';
import { Email, EmailCategory, ClassificationResult } from '@/types/email';

const CLASSIFICATION_PROMPT = `Classify this email into ONE category. Reply with ONLY the category name.

CATEGORIES:
• Important: Personal/work messages, meetings, deadlines, action items, requests from real people
• Promotional: Sales, discounts, deals, "buy now", limited offers, shopping
• Social: Facebook, Twitter, Instagram, LinkedIn, dating apps, likes, comments, friend requests
• Marketing: Newsletters, blogs, webinars, company updates, educational content
• Spam: Phishing, scams, lottery wins, suspicious, unsolicited, too-good-to-be-true
• General: Receipts, confirmations, password resets, tracking, automated notifications

EMAIL:
From: {from}
Subject: {subject}
Body: {content}

Reply with ONE WORD only (Important/Promotional/Social/Marketing/Spam/General):`;

export async function classifyEmail(email: Email, geminiKey: string): Promise<ClassificationResult> {
  try {
    const genAI = new GoogleGenerativeAI(geminiKey);

    // Use current working Gemini models (Gemini 1.5 was retired April 2025)
    const modelNames = [
      'gemini-2.0-flash',  // Fast, reliable
      'gemini-1.5-pro'     // Fallback (still works for existing keys)
    ];

    let categoryText = '';
    let lastError: Error | null = null;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 50,
            topP: 0.8,
            topK: 40,
          }
        });

        // Prepare email content for analysis - use subject + limited body
        const emailContent = email.body.substring(0, 600); // Reduced for efficiency
        const prompt = CLASSIFICATION_PROMPT
          .replace('{from}', email.from)
          .replace('{subject}', email.subject)
          .replace('{content}', emailContent);

        const result = await model.generateContent(prompt);
        const response = result.response;

        // Check if we got a valid response
        if (!response || !response.text) {
          throw new Error('Empty response from model');
        }

        categoryText = response.text().trim();

        // If response is empty, throw error to try next model
        if (!categoryText) {
          throw new Error('Empty text in response');
        }

        console.log(`✓ Model: ${modelName} | Response: "${categoryText}"`);
        break; // Success! Exit the loop
      } catch (error) {
        lastError = error as Error;
        const errorMessage = error instanceof Error ? error.message : String(error);

        // If rate limited, wait before trying next model
        if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
          console.log(`⚠ Rate limit hit on ${modelName}, waiting 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`✗ ${modelName} failed: ${errorMessage.substring(0, 50)}`);
        continue; // Try next model
      }
    }

    if (!categoryText && lastError) {
      console.log('⚠ All models failed, using rule-based classification');
      // Don't throw - let fallback rules handle it
      categoryText = '';
    }

    // Parse the AI response into a category
    const normalizedText = categoryText.toLowerCase().trim().replace(/[^a-z]/g, '');
    let category: EmailCategory = 'General';

    // Try to match the response to a category
    if (normalizedText.includes('important')) {
      category = 'Important';
    } else if (normalizedText.includes('promotional') || normalizedText.includes('promo')) {
      category = 'Promotional';
    } else if (normalizedText.includes('social')) {
      category = 'Social';
    } else if (normalizedText.includes('marketing')) {
      category = 'Marketing';
    } else if (normalizedText.includes('spam')) {
      category = 'Spam';
    } else if (normalizedText.includes('general')) {
      category = 'General';
    } else {
      // Enhanced rule-based classification when AI fails
      const subject = email.subject.toLowerCase();
      const from = email.from.toLowerCase();
      const body = email.body.toLowerCase().substring(0, 500);

      // PROMOTIONAL indicators
      if (subject.includes('sale') || subject.includes('discount') || subject.includes('% off') ||
          subject.includes('deal') || subject.includes('offer') || subject.includes('coupon') ||
          body.includes('shop now') || body.includes('buy now') || body.includes('limited time') ||
          body.includes('flash sale') || subject.includes('save')) {
        category = 'Promotional';
      }
      // SOCIAL indicators
      else if (from.includes('facebook') || from.includes('twitter') || from.includes('instagram') ||
               from.includes('linkedin') || from.includes('tinder') || from.includes('bumble') ||
               subject.includes('liked your') || subject.includes('commented on') ||
               subject.includes('friend request') || subject.includes('connection request') ||
               subject.includes('tagged you')) {
        category = 'Social';
      }
      // IMPORTANT indicators
      else if (!from.includes('noreply') && !from.includes('no-reply') &&
               (subject.includes('urgent') || subject.includes('action required') ||
                subject.includes('meeting') || subject.includes('deadline') ||
                subject.includes('asap') || subject.includes('important') ||
                subject.includes('review') || subject.includes('approve'))) {
        category = 'Important';
      }
      // MARKETING indicators
      else if ((from.includes('noreply') || from.includes('no-reply')) &&
               (subject.includes('newsletter') || subject.includes('update') ||
                subject.includes('blog') || subject.includes('webinar') ||
                subject.includes('announcement') || body.includes('unsubscribe'))) {
        category = 'Marketing';
      }
      // SPAM indicators
      else if (subject.includes('winner') || subject.includes('congratulations') ||
               subject.includes('claim') || subject.includes('verify your account') ||
               body.includes('click here immediately') || subject.includes('act now')) {
        category = 'Spam';
      }
      // Default to GENERAL
      else {
        category = 'General';
      }
    }

    const fromPreview = email.from.length > 35 ? email.from.substring(0, 35) + '...' : email.from;
    const subjectPreview = email.subject.length > 40 ? email.subject.substring(0, 40) + '...' : email.subject;
    console.log(`📧 "${subjectPreview}" from ${fromPreview} → ${category}`);

    return {
      category,
    };
  } catch (error) {
    console.error('Error classifying email:', error);
    throw error;
  }
}

export async function classifyEmails(emails: Email[], geminiKey: string): Promise<Email[]> {
  console.log(`📨 Starting classification of ${emails.length} emails (sequential processing)...`);

  const classifiedEmails: Email[] = [];

  // Process emails ONE AT A TIME to avoid rate limits
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];

    try {
      console.log(`[${i + 1}/${emails.length}] Classifying...`);

      const result = await classifyEmail(email, geminiKey);

      classifiedEmails.push({
        ...email,
        category: result.category,
      });

      // Add a small delay between requests to avoid rate limiting
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }

    } catch (error) {
      console.error(`❌ Error classifying email ${email.id}:`, error);
      classifiedEmails.push({
        ...email,
        category: 'General' as EmailCategory,
      });
    }
  }

  console.log(`✅ Classification complete: ${classifiedEmails.length}/${emails.length} emails processed`);
  return classifiedEmails;
}
