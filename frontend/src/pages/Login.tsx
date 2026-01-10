import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [step, setStep] = useState<'login' | 'changePassword'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, changePassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.requires_password_change) {
        setStep('changePassword');
        setOldPassword(password);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 1) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      if (step === 'login') {
        handleLogin(e as any);
      } else {
        handleChangePassword(e as any);
      }
    }
  };

  return (
    <section className="bg-background min-h-screen">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        {/* Logo */}
        <a href="/" className="flex items-center mb-6 text-2xl font-semibold text-white">
          <img src="/bookshelf.svg" alt="Bookstore" className="w-8 h-8 mr-2" />
          Bookstore
        </a>

        <div className="w-full rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 bg-neutral-900 border-gray-800">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {/* Login Form */}
            {step === 'login' && (
              <>
                <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl text-center">
                  Authorize Admin Access
                </h1>

                {error && (
                  <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
                  <div>
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-white">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-neutral-800 border border-gray-800 text-white rounded-lg focus:border-white block w-full p-2.5 placeholder-gray-400 outline-none"
                      placeholder="Enter your username"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-neutral-800 border border-gray-800 text-white rounded-lg focus:border-white block w-full p-2.5 placeholder-gray-400 outline-none"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-black bg-white hover:bg-black hover:text-white disabled:bg-gray-400 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center transition duration-200"
                    onFocus={(e) => {
                      e.currentTarget.style.outline = '3px solid white';
                      e.currentTarget.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>
              </>
            )}

            {/* Change Password Form */}
            {step === 'changePassword' && (
              <>
                <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                  Change Password
                </h1>
                <p className="text-sm font-light text-gray-400">
                  This is your first login. Please set a new password to continue.
                </p>

                {error && (
                  <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <form className="space-y-4 md:space-y-6" onSubmit={handleChangePassword}>
                  <div>
                    <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-white">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-neutral-800 border border-gray-800 text-white rounded-lg focus:border-white block w-full p-2.5 placeholder-gray-400 outline-none"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-white">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-neutral-800 border border-gray-800 text-white rounded-lg focus:border-white block w-full p-2.5 placeholder-gray-400 outline-none"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-black bg-white hover:bg-black hover:text-white disabled:bg-gray-400 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center transition duration-200"
                    onFocus={(e) => {
                      e.currentTarget.style.outline = '3px solid white';
                      e.currentTarget.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
