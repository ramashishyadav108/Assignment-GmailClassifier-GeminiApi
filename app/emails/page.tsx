'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Email } from '@/types/email';

export default function EmailsPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [emailCount, setEmailCount] = useState(15);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [error, setError] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if user has Gemini key
    const geminiKey = localStorage.getItem('gemini_api_key');
    setHasApiKey(!!geminiKey);

    if (!geminiKey) {
      setShowApiKeyModal(true);
    }

    // Load emails from localStorage if available
    const savedEmails = localStorage.getItem('emails');
    if (savedEmails) {
      setEmails(JSON.parse(savedEmails));
    }

    // Fetch user info
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.error('Error fetching session:', err));
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      alert('Please enter a valid Gemini API key');
      return;
    }

    localStorage.setItem('gemini_api_key', apiKeyInput.trim());
    setHasApiKey(true);
    setShowApiKeyModal(false);
    setApiKeyInput('');
    alert('Gemini API key saved successfully!');
  };

  const handleChangeApiKey = () => {
    const currentKey = localStorage.getItem('gemini_api_key');
    setApiKeyInput(currentKey || '');
    setShowApiKeyModal(true);
  };

  const fetchEmails = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/emails/fetch?count=${emailCount}`);

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();
      setEmails(data.emails);

      // Save to localStorage
      localStorage.setItem('emails', JSON.stringify(data.emails));
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError('Failed to fetch emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch emails when emailCount changes
  useEffect(() => {
    if (emails.length > 0) {
      fetchEmails();
    }
  }, [emailCount]);

  const classifyEmails = async () => {
    const geminiKey = localStorage.getItem('gemini_api_key');

    if (!geminiKey) {
      alert('Please set your Gemini API key');
      setShowApiKeyModal(true);
      return;
    }

    if (emails.length === 0) {
      alert('Please fetch emails first');
      return;
    }

    setClassifying(true);
    setError('');

    try {
      const response = await fetch('/api/emails/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          geminiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to classify emails');
      }

      const data = await response.json();
      setEmails(data.emails);

      // Save classified emails to localStorage
      localStorage.setItem('emails', JSON.stringify(data.emails));
    } catch (err) {
      console.error('Error classifying emails:', err);
      setError('Failed to classify emails. Please check your Gemini API key.');
    } finally {
      setClassifying(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('emails');
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Important':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'Promotional':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'Social':
        return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'Marketing':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Spam':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const handleEmailClick = (emailId: string) => {
    router.push(`/emails/${emailId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {hasApiKey ? 'Update Gemini API Key' : 'Set Gemini API Key'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter your Gemini API key to classify emails. Your key is stored locally in your browser.
            </p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIza..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 mb-4"
            />
            <div className="flex gap-3">
              {hasApiKey && (
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setApiKeyInput('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200 active:scale-95"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveApiKey}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200 gap-4">
          <div 
            onClick={() => router.push('/emails')}
            className="flex items-center gap-3 sm:gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold text-lg transition-transform hover:scale-105">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                {user?.name || 'Deadpool'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[200px] sm:max-w-none">{user?.email || 'peterparker@marvel.com'}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleChangeApiKey}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 hover:shadow-sm cursor-pointer"
              title={hasApiKey ? 'Change API Key' : 'Set API Key'}
            >
              <span className="hidden sm:inline">{hasApiKey ? 'Change API Key' : 'Set API Key'}</span>
              <span className="sm:hidden">🔑 API Key</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-all duration-200 hover:shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {!hasApiKey && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Please set your Gemini API key to classify emails.
              <button
                onClick={handleChangeApiKey}
                className="ml-2 font-medium underline hover:text-yellow-900 cursor-pointer"
              >
                Click here to set it now
              </button>
            </p>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 w-full">
            <label htmlFor="email-count" className="text-xs sm:text-sm text-gray-700 whitespace-normal sm:whitespace-nowrap">
              Select number of emails to classify
            </label>
            <select
              id="email-count"
              value={emailCount}
              onChange={(e) => setEmailCount(Number(e.target.value))}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors cursor-pointer"
              disabled={loading || classifying}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
              <option value={30}>30</option>
            </select>
          </div>

          <button
            onClick={classifyEmails}
            disabled={classifying || loading || emails.length === 0}
            className="w-full sm:w-auto px-6 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md active:scale-95 cursor-pointer"
          >
            {classifying ? 'Classifying...' : 'Classify'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {emails.length === 0 && !loading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="mb-4">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">No emails fetched yet</p>
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="px-6 py-3 bg-gray-900 text-white rounded-md text-base font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              Fetch Emails
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <button
                onClick={fetchEmails}
                disabled={loading || classifying}
                className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 transition-all duration-200 hover:shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Fetching...' : 'Refresh'}
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-600">Loading emails...</p>
                </div>
              ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailClick(email.id)}
                    className="border border-gray-300 rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-gray-400 transition-all duration-200 cursor-pointer bg-white transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1">
                        {email.from.split('<')[0].trim() || email.from}
                      </h3>
                      {email.category && (
                        <span className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-full border ${getCategoryColor(email.category)} whitespace-nowrap`}>
                          {email.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base mb-2 font-medium">
                      {email.subject}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                      {email.snippet}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
