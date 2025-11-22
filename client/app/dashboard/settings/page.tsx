'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Globe, Camera, Save } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { Toast } from '@/components/ui/Toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('profile');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Profile state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Language state
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    // Indian languages (22 official languages + English)
    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
        { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
        { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
        { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
        { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
        { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
        { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
        { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
        { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
        { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
        { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
        { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर' },
        { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
        { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
        { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
        { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
        { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
        { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
        { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
        { code: 'bo', name: 'Bodo', nativeName: 'बड़ो' },
    ];

    useEffect(() => {
        // Load user data from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setName(user.name || '');
                setEmail(user.email || '');
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        // Load saved language
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            setSelectedLanguage(savedLang);
        }
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Update user in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            user.name = name;
            localStorage.setItem('user', JSON.stringify(user));
        }

        setToastMessage(t('settings.profileUpdated'));
        setShowToast(true);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setToastMessage(t('settings.passwordMismatch'));
            setShowToast(true);
            return;
        }

        // TODO: Call API to change password
        setToastMessage(t('settings.passwordChanged'));
        setShowToast(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleLanguageChange = (langCode: string) => {
        setSelectedLanguage(langCode);
        localStorage.setItem('language', langCode);
        setToastMessage(t('settings.languageChanged'));
        setShowToast(true);

        // Reload page after 1.5 seconds to apply translations
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhoto(reader.result as string);
                setToastMessage(t('settings.photoUpdated'));
                setShowToast(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const tabs = [
        { id: 'profile', label: t('settings.profile'), icon: User },
        { id: 'password', label: t('settings.password'), icon: Lock },
        { id: 'language', label: t('settings.language'), icon: Globe },
    ];

    return (
        <div className="min-h-full p-8 bg-slate-50">
            <Toast
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">{t('settings.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('settings.subtitle')}</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-200">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${activeTab === tab.id
                                        ? 'text-blue-600'
                                        : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold text-slate-900 mb-6">{t('settings.profileInfo')}</h2>

                            {/* Profile Photo */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                        {profilePhoto ? (
                                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                                        <Camera size={16} className="text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{name}</h3>
                                    <p className="text-sm text-slate-500">{email}</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('settings.fullName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('settings.emailAddress')}
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{t('settings.emailCannotChange')}</p>
                                </div>

                                <NeonButton type="submit" variant="blue" className="mt-6 flex items-center gap-2">
                                    <Save size={18} />
                                    {t('settings.saveChanges')}
                                </NeonButton>
                            </form>
                        </motion.div>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold text-slate-900 mb-6">{t('settings.changePassword')}</h2>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('settings.currentPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('settings.newPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t('settings.confirmPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <NeonButton type="submit" variant="blue" className="mt-6 flex items-center gap-2">
                                    <Lock size={18} />
                                    {t('settings.updatePassword')}
                                </NeonButton>
                            </form>
                        </motion.div>
                    )}

                    {/* Language Tab */}
                    {activeTab === 'language' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold text-slate-900 mb-6">{t('settings.languagePrefs')}</h2>

                            {/* Promotional Message */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-6 mb-6">
                                <div className="flex items-start gap-3">
                                    <Globe className="text-blue-600 mt-1 flex-shrink-0" size={24} />
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">
                                            🌏 {t('settings.languagePromo')}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {t('settings.languageDesc')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Language Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    {t('settings.selectLanguage')}
                                </label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900 font-medium cursor-pointer hover:border-slate-300 transition-all"
                                >
                                    {languages.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name} ({lang.nativeName})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-2">
                                    {t('settings.translationNote')}
                                </p>
                            </div>

                            {/* Current Selection Display */}
                            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-600">
                                    <span className="font-medium">{t('settings.currentlySelected')}</span>{' '}
                                    {languages.find(l => l.code === selectedLanguage)?.name}
                                    ({languages.find(l => l.code === selectedLanguage)?.nativeName})
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
