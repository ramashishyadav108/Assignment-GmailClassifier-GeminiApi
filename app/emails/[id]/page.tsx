'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Email } from '@/types/email';

export default function EmailDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [email, setEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const savedEmails = localStorage.getItem('emails');
    if (savedEmails) {
      const emailList: Email[] = JSON.parse(savedEmails);
      setEmails(emailList);
      const foundEmail = emailList.find(e => e.id === params.id);
      setEmail(foundEmail || null);
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
  }, [params.id]);

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

  const handleLogout = async () => {
    localStorage.removeItem('emails');
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Email not found</p>
          <button
            onClick={() => router.push('/emails')}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
          >
            Back to Emails
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              onClick={() => router.push('/emails')}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold transition-transform hover:scale-105">
                {user?.name?.charAt(0) || 'P'}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {user?.name || 'Peter Parker'}
                </h1>
                <p className="text-xs text-gray-600 truncate">{user?.email || 'peterparker@marvel.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-all duration-200 hover:shadow-md active:scale-95 flex items-center gap-1 sm:gap-2 cursor-pointer"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* URL Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2">
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto">
        {/* Left Sidebar - Email List */}
        <div className="w-full lg:w-[380px] bg-white border-r border-gray-300 h-64 lg:h-screen overflow-y-auto">
          <div className="p-3 sm:p-4">
            {emails.map((e) => (
              <div
                key={e.id}
                onClick={() => handleEmailClick(e.id)}
                className={`mb-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  e.id === email.id 
                    ? 'border-gray-400 bg-gray-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {e.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {e.from.split('<')[0].trim() || e.from}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">{e.from.match(/<(.+)>/)?.[1] || e.from}</p>
                    </div>
                  </div>
                  {e.id === email.id && (
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-gray-900 rounded text-white text-xs font-bold flex-shrink-0">
                      ▽
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 mb-1">
                  {e.subject}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {e.snippet}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Email Detail */}
        <div className="flex-1 bg-white p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          <div className="max-w-3xl">
            {/* Email Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {email.from.split('<')[0].trim() || email.from}
                </h2>
                {email.category && (
                  <span className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border ${getCategoryColor(email.category)}`}>
                    {email.category}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                {email.from.match(/<(.+)>/)?.[1] || email.from}
              </p>
            </div>

            {/* Email Subject */}
            <div className="mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                {email.subject}
              </h3>
            </div>

            {/* Email Body */}
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {email.body || email.snippet}
            </div>

            {/* Email Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-900 mb-1">Best</p>
              <p className="text-sm text-gray-900 mb-1">Support</p>
              <p className="text-sm text-gray-900">Marvel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
