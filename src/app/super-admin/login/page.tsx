'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Navbar } from '@/components/layout/Navbar';
import { useTranslation } from '@/contexts/LanguageContext';

export default function SuperAdminLoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Authenticate User
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (signInError) throw signInError;
            if (!data.user) throw new Error('Failed to login');

            // 2. Verify Super Admin Role
            const { data: roleData, error: roleError } = await supabase
                .from('admin_roles')
                .select('role')
                .eq('user_id', data.user.id)
                .eq('role', 'super_admin')
                .single();

            if (roleError || !roleData) {
                // Not a super admin - sign out immediately
                await supabase.auth.signOut();
                throw new Error(t('superAdmin.login.error'));
            }

            // 3. Redirect to Super Admin Dashboard
            router.push('/super-admin');

        } catch (err: any) {
            console.error('Super Admin Login Error:', err);
            setError(err.message || t('superAdmin.login.loginError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
            <Navbar />

            <div className="pt-16 min-h-screen grid lg:grid-cols-2">
                {/* Left Side - Cinematic Dark Mode View */}
                <div className="hidden lg:block relative bg-gray-100">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: 'url(/assets/super_admin_login_bg.png)',
                        }}
                    ></div>

                </div>

                {/* Right Side - Form */}
                <div className="flex items-center justify-center p-8 lg:p-16">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-primary mb-2 font-loubag uppercase">{t('superAdmin.login.title')}</h1>
                            <p className="text-secondary font-inter">{t('superAdmin.login.subtitle')}</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-inter">
                                {error}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                                    {t('superAdmin.login.email')}
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary"
                                        style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                                    {t('superAdmin.login.password')}
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-[#F34A23] text-primary pr-12"
                                        style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <PrimaryButton
                                    type="submit"
                                    fullWidth
                                    disabled={loading}
                                >
                                    {loading ? t('superAdmin.login.authenticating') : t('superAdmin.login.submit')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
