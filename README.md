# Email Classifier - AI-Powered Gmail Classification

A modern, responsive web application that uses Google OAuth to fetch emails from Gmail and classifies them into categories using Google Gemini AI via LangChain.js.

## Features

- **Google OAuth Authentication**: Secure login with Google to access Gmail
- **Email Fetching**: Fetch up to 30 emails from your Gmail inbox
- **AI-Powered Classification**: Automatically classify emails into:
  - Important
  - Promotional
  - Social
  - Marketing
  - Spam
  - General
- **Auto-Refresh**: Automatically refetch emails when count changes
- **Local Storage**: Emails and Gemini API key stored locally in browser
- **Responsive UI**: Clean, modern interface optimized for mobile, tablet, and desktop
- **Email Detail View**: Click any email to see full details with colored category badges
- **Smooth Animations**: Hover effects and transitions for better UX

## Tech Stack

- **Frontend**: Next.js 15.0.3, React 18.3.1, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js v5 (beta.29) with Google OAuth
- **Email API**: Gmail API via googleapis
- **AI Classification**: Google Gemini (gemini-1.5-flash) via LangChain.js
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Google Cloud Project with OAuth credentials configured
- A Google Gemini API key (users provide their own during login)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd emailcategory
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. Configure OAuth Consent Screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "Email Classifier"
     - User support email: Your email
     - Developer contact: Your email
   - Add test users (for testing mode):
     - Click "Add Users"
     - Add your email for testing
   - Add scopes:
     - `userinfo.email`
     - `userinfo.profile`
     - `gmail.readonly`

5. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Email Classifier Web Client"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - Add production URL when deploying
   - Click "Create"
   - Copy the Client ID and Client Secret

### 4. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the API key (you'll enter this when logging into the app)

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here
```

Generate a NextAuth secret:
```bash
openssl rand -base64 32
```
Copy the output and use it as `NEXTAUTH_SECRET`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### First Time Setup

1. **Enter Gemini API Key**:
   - Click "Enter Gemini API"
   - Paste your Google Gemini API key
   - Click "Save Key"
   - Your key is stored locally in your browser

2. **Login with Google**:
   - Click "Login with Google"
   - Sign in with your Google account
   - Grant permissions for Gmail access

### Using the Application

1. **Fetch Emails**:
   - Select how many emails to fetch (5-30)
   - Click "Fetch Emails" or the refresh button
   - Emails are automatically loaded from your Gmail inbox

2. **Classify Emails**:
   - After fetching emails, click "Classify Emails"
   - Google Gemini AI will analyze and categorize each email
   - Categories appear as colored badges (Important, Promotional, Social, Marketing, Spam, General)

3. **View Email Details**:
   - Click any email card to view full details
   - See sender, subject, date, body preview, and AI-assigned category
   - Click "Back to Emails" to return to the list

4. **Auto-Refresh**:
   - Change the email count dropdown to automatically refetch emails
   - No need to manually click refresh

5. **Logout**:
   - Click "Logout" button
   - Your session will end
   - Local data (emails and API key) remains until you clear browser storage

## Project Structure

```
emailcategory/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   ├── session/route.ts        # Session endpoint
│   │   │   └── signout/route.ts        # Signout endpoint
│   │   └── emails/
│   │       ├── fetch/route.ts          # Fetch emails from Gmail
│   │       └── classify/route.ts       # Classify emails with Gemini
│   ├── emails/
│   │   ├── page.tsx                    # Email dashboard
│   │   └── [id]/page.tsx               # Email detail view
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Login page
│   └── globals.css                     # Global styles & animations
├── components/
│   └── LoginForm.tsx                   # Login/API key form
├── lib/
│   ├── auth.ts                         # NextAuth configuration
│   ├── gmail.ts                        # Gmail API integration
│   └── classifier.ts                   # Email classification with Gemini
├── types/
│   ├── email.ts                        # Email type definitions
│   └── next-auth.d.ts                  # NextAuth type extensions
├── .env                          # Your environment variables (not in git)
└── package.json                        # Dependencies and scripts
```

## Email Classification Categories

- **Important**: Personal or work-related emails requiring immediate attention
- **Promotional**: Sales, discounts, offers, shopping deals
- **Social**: Social networks, friend updates, event invitations
- **Marketing**: Newsletters, product updates, company announcements
- **Spam**: Unwanted, unsolicited, or suspicious emails
- **General**: Everything else that doesn't fit the above categories

## Data Privacy & Security

- Google Gemini API keys are stored only in your browser's localStorage
- Emails are stored locally and only sent to Google Gemini for classification
- No email data is persisted in any database
- All data is cleared when you clear browser storage
- OAuth tokens are managed securely by NextAuth.js
- No third-party tracking or analytics

## Troubleshooting

### "Failed to fetch emails"
- Ensure you've granted Gmail access permissions during login
- Check that the Gmail API is enabled in Google Cloud Console
- Verify your OAuth credentials are correct in `.env.local`
- Make sure you're logged in with the correct Google account

### "Failed to classify emails"
- Verify your Google Gemini API key is valid
- Get a new key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Check that you have access to the Gemini API (free tier available)
- Ensure the API key has no IP restrictions

### "Unauthorized" errors
- Make sure you're logged in
- Try logging out and logging back in
- Clear browser cookies and try again

### OAuth errors
- Verify redirect URIs are correctly configured in Google Cloud Console
- Ensure your email is added as a test user in OAuth consent screen
- Check that `NEXTAUTH_URL` matches your actual URL
- Confirm Gmail API is enabled in your Google Cloud project
- Verify `.env` file exists and has correct credentials

## Build for Production

```bash
npm run build
npm start
```

For production deployment, update:
- `NEXTAUTH_URL` to your production domain
- Add production redirect URI to Google Cloud Console
- Consider environment-specific API keys

## Development

```bash
# Install dependencies
npm install

# Run development server (opens on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Technologies & Dependencies

### Core Framework
- **Next.js 15.0.3**: React framework with App Router
- **React 18.3.1**: UI library
- **TypeScript**: Type-safe development

### Authentication & APIs
- **NextAuth.js v5.0.0-beta.29**: OAuth authentication
- **Google APIs (googleapis)**: Gmail API integration

### AI & Classification
- **LangChain.js**: Framework for AI applications
- **@langchain/google-genai**: Google Gemini integration
- **@langchain/core**: LangChain core functionality
- **Google Gemini 1.5 Flash**: AI model for email classification

### Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- Custom animations and responsive design

## API Rate Limits

- **Gmail API**: 250 quota units per user per second (fetching 30 emails uses ~30 units)
- **Gemini API**: Free tier includes generous limits
- Avoid excessive fetching to stay within limits

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage support required
- Cookies enabled for OAuth

## Known Issues

- Gemini API integration may require model name adjustments based on API version
- OAuth requires adding test users during development (Google Cloud Console)
- Email body preview is limited to plain text (HTML stripped)

## Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

---

**Note**: This application requires valid Google OAuth credentials and a Gemini API key to function. Users provide their own API keys for security and cost control.

MIT License - feel free to use this project for learning and development purposes.
