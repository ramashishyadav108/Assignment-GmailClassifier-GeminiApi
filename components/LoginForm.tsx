'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginForm() {
  const [geminiKey, setGeminiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signIn('google', { callbackUrl: '/emails' });
    } catch (error) {
      console.error('Error during Google login:', error);
      setError('Failed to login with Google');
    }
  };

  const handleGeminiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey.trim()) {
      setError('Please enter a valid Gemini API key');
      return;
    }

    // Store in localStorage
    localStorage.setItem('gemini_api_key', geminiKey);
    setError('');
    alert('Gemini API key saved successfully! You can now login with Google.');
    setShowKeyInput(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md space-y-8 p-6 sm:p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-900 rounded-full">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Email Classifier
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Classify your emails using AI
          </p>
        </div>

        <div className="mt-8 space-y-4 sm:space-y-6">
          {!showKeyInput ? (
            <>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md active:scale-95 cursor-pointer"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Login with Google
              </button>

              <button
                onClick={() => setShowKeyInput(true)}
                className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg text-sm sm:text-base font-medium text-gray-900 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Enter Gemini API
              </button>
            </>
          ) : (
            <form onSubmit={handleGeminiKeySubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="gemini-key"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gemini API Key
                </label>
                <input
                  id="gemini-key"
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowKeyInput(false);
                    setError('');
                    setGeminiKey('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-gray-800 transition-all duration-200 hover:shadow-md active:scale-95 cursor-pointer"
                >
                  Save Key
                </button>
              </div>
            </form>
          )}

          {error && !showKeyInput && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </div>

        <div className="mt-6 text-center text-xs sm:text-sm text-gray-600">
          <p>Your Gemini key is stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
}
