'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation type
type Translations = {
    [key: string]: {
        [key: string]: string;
    };
};

// Language context type
type LanguageContextType = {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations for English, Hindi, Marathi, and Tamil
const translations: Translations = {
    en: {
        // Dashboard
        'dashboard.welcome': 'Welcome',
        'dashboard.summary': "Here's your daily health summary",
        'dashboard.healthScore': 'Health Score',
        'dashboard.vitals': 'Vitals',
        'dashboard.heartRate': 'Heart Rate',
        'dashboard.bloodPressure': 'Blood Pressure',
        'dashboard.temperature': 'Temperature',
        'dashboard.oxygenLevel': 'Oxygen Level',
        'dashboard.diseaseRisk': 'Disease Risk Analysis',
        'dashboard.viewAll': 'View All',
        'dashboard.viewDetailedReport': 'View Detailed Report',
        'dashboard.bpm': 'bpm',
        'dashboard.normal': 'Normal',
        'dashboard.elevated': 'Elevated',

        // Navigation
        'nav.overview': 'Overview',
        'nav.addReport': 'Add Report',
        'nav.actionPlan': 'Action Plan',
        'nav.contactDoctors': 'Contact Doctors',
        'nav.communityChallenges': 'Community Challenges',
        'nav.connectDevices': 'Connect Devices',
        'nav.settings': 'Settings',
        'nav.signOut': 'Sign Out',

        // Settings
        'settings.title': 'Settings',
        'settings.subtitle': 'Manage your account preferences',
        'settings.profile': 'Profile',
        'settings.password': 'Password',
        'settings.language': 'Language',
        'settings.profileInfo': 'Profile Information',
        'settings.fullName': 'Full Name',
        'settings.emailAddress': 'Email Address',
        'settings.emailCannotChange': 'Email cannot be changed',
        'settings.saveChanges': 'Save Changes',
        'settings.changePassword': 'Change Password',
        'settings.currentPassword': 'Current Password',
        'settings.newPassword': 'New Password',
        'settings.confirmPassword': 'Confirm New Password',
        'settings.updatePassword': 'Update Password',
        'settings.languagePrefs': 'Language Preferences',
        'settings.languagePromo': 'Your favorite health companion, MediGuard, now available in 23 languages!',
        'settings.languageDesc': 'Choose your preferred language and experience MediGuard in your native tongue. We support English and all 22 official languages of India.',
        'settings.selectLanguage': 'Select Language',
        'settings.translationNote': 'The entire application will be translated to your selected language.',
        'settings.currentlySelected': 'Currently selected:',
        'settings.profileUpdated': 'Profile updated successfully!',
        'settings.passwordChanged': 'Password changed successfully!',
        'settings.passwordMismatch': 'Passwords do not match!',
        'settings.languageChanged': 'Language changed successfully! Page will reload.',
        'settings.photoUpdated': 'Profile photo updated!',
    },
    hi: {
        // Dashboard
        'dashboard.welcome': 'स्वागत है',
        'dashboard.summary': 'यहाँ आपका दैनिक स्वास्थ्य सारांश है',
        'dashboard.healthScore': 'स्वास्थ्य स्कोर',
        'dashboard.vitals': 'महत्वपूर्ण संकेत',
        'dashboard.heartRate': 'हृदय गति',
        'dashboard.bloodPressure': 'रक्तचाप',
        'dashboard.temperature': 'तापमान',
        'dashboard.oxygenLevel': 'ऑक्सीजन स्तर',
        'dashboard.diseaseRisk': 'रोग जोखिम विश्लेषण',
        'dashboard.viewAll': 'सभी देखें',
        'dashboard.viewDetailedReport': 'विस्तृत रिपोर्ट देखें',
        'dashboard.bpm': 'बीपीएम',
        'dashboard.normal': 'सामान्य',
        'dashboard.elevated': 'उच्च',

        // Navigation
        'nav.overview': 'अवलोकन',
        'nav.addReport': 'रिपोर्ट जोड़ें',
        'nav.actionPlan': 'कार्य योजना',
        'nav.contactDoctors': 'डॉक्टरों से संपर्क करें',
        'nav.communityChallenges': 'सामुदायिक चुनौतियाँ',
        'nav.connectDevices': 'उपकरण कनेक्ट करें',
        'nav.settings': 'सेटिंग्स',
        'nav.signOut': 'साइन आउट',

        // Settings
        'settings.title': 'सेटिंग्स',
        'settings.subtitle': 'अपनी खाता प्राथमिकताएं प्रबंधित करें',
        'settings.profile': 'प्रोफ़ाइल',
        'settings.password': 'पासवर्ड',
        'settings.language': 'भाषा',
        'settings.profileInfo': 'प्रोफ़ाइल जानकारी',
        'settings.fullName': 'पूरा नाम',
        'settings.emailAddress': 'ईमेल पता',
        'settings.emailCannotChange': 'ईमेल बदला नहीं जा सकता',
        'settings.saveChanges': 'परिवर्तन सहेजें',
        'settings.changePassword': 'पासवर्ड बदलें',
        'settings.currentPassword': 'वर्तमान पासवर्ड',
        'settings.newPassword': 'नया पासवर्ड',
        'settings.confirmPassword': 'नया पासवर्ड की पुष्टि करें',
        'settings.updatePassword': 'पासवर्ड अपडेट करें',
        'settings.languagePrefs': 'भाषा प्राथमिकताएं',
        'settings.languagePromo': 'आपका पसंदीदा स्वास्थ्य साथी, मेडीगार्ड, अब 23 भाषाओं में उपलब्ध है!',
        'settings.languageDesc': 'अपनी पसंदीदा भाषा चुनें और मेडीगार्ड को अपनी मातृभाषा में अनुभव करें। हम अंग्रेजी और भारत की सभी 22 आधिकारिक भाषाओं का समर्थन करते हैं।',
        'settings.selectLanguage': 'भाषा चुनें',
        'settings.translationNote': 'संपूर्ण एप्लिकेशन आपकी चयनित भाषा में अनुवादित हो जाएगा।',
        'settings.currentlySelected': 'वर्तमान में चयनित:',
        'settings.profileUpdated': 'प्रोफ़ाइल सफलतापूर्वक अपडेट किया गया!',
        'settings.passwordChanged': 'पासवर्ड सफलतापूर्वक बदला गया!',
        'settings.passwordMismatch': 'पासवर्ड मेल नहीं खाते!',
        'settings.languageChanged': 'भाषा सफलतापूर्वक बदली गई! पेज फिर से लोड होगा।',
        'settings.photoUpdated': 'प्रोफ़ाइल फ़ोटो अपडेट किया गया!',
    },
    mr: {
        // Dashboard
        'dashboard.welcome': 'स्वागत आहे',
        'dashboard.summary': 'हा तुमचा दैनिक आरोग्य सारांश आहे',
        'dashboard.healthScore': 'आरोग्य स्कोअर',
        'dashboard.vitals': 'महत्त्वाचे संकेत',
        'dashboard.heartRate': 'हृदय गती',
        'dashboard.bloodPressure': 'रक्तदाब',
        'dashboard.temperature': 'तापमान',
        'dashboard.oxygenLevel': 'ऑक्सिजन पातळी',
        'dashboard.diseaseRisk': 'रोग जोखीम विश्लेषण',
        'dashboard.viewAll': 'सर्व पहा',
        'dashboard.viewDetailedReport': 'तपशीलवार अहवाल पहा',
        'dashboard.bpm': 'बीपीएम',
        'dashboard.normal': 'सामान्य',
        'dashboard.elevated': 'उच्च',

        // Navigation
        'nav.overview': 'विहंगावलोकन',
        'nav.addReport': 'अहवाल जोडा',
        'nav.actionPlan': 'कृती योजना',
        'nav.contactDoctors': 'डॉक्टरांशी संपर्क साधा',
        'nav.communityChallenges': 'समुदाय आव्हाने',
        'nav.connectDevices': 'उपकरणे कनेक्ट करा',
        'nav.settings': 'सेटिंग्ज',
        'nav.signOut': 'साइन आउट',

        // Settings
        'settings.title': 'सेटिंग्ज',
        'settings.subtitle': 'तुमच्या खात्याच्या प्राधान्यक्रम व्यवस्थापित करा',
        'settings.profile': 'प्रोफाइल',
        'settings.password': 'पासवर्ड',
        'settings.language': 'भाषा',
        'settings.profileInfo': 'प्रोफाइल माहिती',
        'settings.fullName': 'पूर्ण नाव',
        'settings.emailAddress': 'ईमेल पत्ता',
        'settings.emailCannotChange': 'ईमेल बदलता येत नाही',
        'settings.saveChanges': 'बदल जतन करा',
        'settings.changePassword': 'पासवर्ड बदला',
        'settings.currentPassword': 'सध्याचा पासवर्ड',
        'settings.newPassword': 'नवीन पासवर्ड',
        'settings.confirmPassword': 'नवीन पासवर्डची पुष्टी करा',
        'settings.updatePassword': 'पासवर्ड अपडेट करा',
        'settings.languagePrefs': 'भाषा प्राधान्ये',
        'settings.languagePromo': 'तुमचा आवडता आरोग्य साथी, मेडीगार्ड, आता 23 भाषांमध्ये उपलब्ध आहे!',
        'settings.languageDesc': 'तुमची पसंतीची भाषा निवडा आणि मेडीगार्डचा तुमच्या मातृभाषेत अनुभव घ्या. आम्ही इंग्रजी आणि भारताच्या सर्व 22 अधिकृत भाषांना समर्थन देतो।',
        'settings.selectLanguage': 'भाषा निवडा',
        'settings.translationNote': 'संपूर्ण अॅप्लिकेशन तुमच्या निवडलेल्या भाषेत अनुवादित केले जाईल।',
        'settings.currentlySelected': 'सध्या निवडलेले:',
        'settings.profileUpdated': 'प्रोफाइल यशस्वीरित्या अपडेट केले!',
        'settings.passwordChanged': 'पासवर्ड यशस्वीरित्या बदलला!',
        'settings.passwordMismatch': 'पासवर्ड जुळत नाहीत!',
        'settings.languageChanged': 'भाषा यशस्वीरित्या बदलली! पृष्ठ पुन्हा लोड होईल।',
        'settings.photoUpdated': 'प्रोफाइल फोटो अपडेट केला!',
    },
    ta: {
        // Dashboard
        'dashboard.welcome': 'வரவேற்கிறோம்',
        'dashboard.summary': 'இதோ உங்கள் தினசரி சுகாதார சுருக்கம்',
        'dashboard.healthScore': 'சுகாதார மதிப்பெண்',
        'dashboard.vitals': 'முக்கிய அறிகுறிகள்',
        'dashboard.heartRate': 'இதய துடிப்பு',
        'dashboard.bloodPressure': 'இரத்த அழுத்தம்',
        'dashboard.temperature': 'வெப்பநிலை',
        'dashboard.oxygenLevel': 'ஆக்ஸிஜன் அளவு',
        'dashboard.diseaseRisk': 'நோய் ஆபத்து பகுப்பாய்வு',
        'dashboard.viewAll': 'அனைத்தையும் பார்க்க',
        'dashboard.viewDetailedReport': 'விரிவான அறிக்கையைப் பார்க்க',
        'dashboard.bpm': 'பிபிஎம்',
        'dashboard.normal': 'சாதாரண',
        'dashboard.elevated': 'உயர்ந்த',

        // Navigation
        'nav.overview': 'கண்ணோட்டம்',
        'nav.addReport': 'அறிக்கை சேர்க்க',
        'nav.actionPlan': 'செயல் திட்டம்',
        'nav.contactDoctors': 'மருத்துவர்களை தொடர்பு கொள்ள',
        'nav.communityChallenges': 'சமூக சவால்கள்',
        'nav.connectDevices': 'சாதனங்களை இணைக்க',
        'nav.settings': 'அமைப்புகள்',
        'nav.signOut': 'வெளியேறு',

        // Settings
        'settings.title': 'அமைப்புகள்',
        'settings.subtitle': 'உங்கள் கணக்கு விருப்பங்களை நிர்வகிக்கவும்',
        'settings.profile': 'சுயவிவரம்',
        'settings.password': 'கடவுச்சொல்',
        'settings.language': 'மொழி',
        'settings.profileInfo': 'சுயவிவர தகவல்',
        'settings.fullName': 'முழு பெயர்',
        'settings.emailAddress': 'மின்னஞ்சல் முகவரி',
        'settings.emailCannotChange': 'மின்னஞ்சலை மாற்ற முடியாது',
        'settings.saveChanges': 'மாற்றங்களைச் சேமி',
        'settings.changePassword': 'கடவுச்சொல்லை மாற்று',
        'settings.currentPassword': 'தற்போதைய கடவுச்சொல்',
        'settings.newPassword': 'புதிய கடவுச்சொல்',
        'settings.confirmPassword': 'புதிய கடவுச்சொல்லை உறுதிப்படுத்து',
        'settings.updatePassword': 'கடவுச்சொல்லைப் புதுப்பி',
        'settings.languagePrefs': 'மொழி விருப்பங்கள்',
        'settings.languagePromo': 'உங்கள் விருப்பமான சுகாதார துணை, மெடிகார்ட், இப்போது 23 மொழிகளில் கிடைக்கிறது!',
        'settings.languageDesc': 'உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுத்து, மெடிகார்டை உங்கள் தாய்மொழியில் அனுபவிக்கவும். நாங்கள் ஆங்கிலம் மற்றும் இந்தியாவின் அனைத்து 22 அதிகாரப்பூர்வ மொழிகளையும் ஆதரிக்கிறோம்.',
        'settings.selectLanguage': 'மொழியைத் தேர்ந்தெடுக்கவும்',
        'settings.translationNote': 'முழு பயன்பாடும் உங்கள் தேர்ந்தெடுத்த மொழியில் மொழிபெயர்க்கப்படும்.',
        'settings.currentlySelected': 'தற்போது தேர்ந்தெடுக்கப்பட்டது:',
        'settings.profileUpdated': 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!',
        'settings.passwordChanged': 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!',
        'settings.passwordMismatch': 'கடவுச்சொற்கள் பொருந்தவில்லை!',
        'settings.languageChanged': 'மொழி வெற்றிகரமாக மாற்றப்பட்டது! பக்கம் மீண்டும் ஏற்றப்படும்.',
        'settings.photoUpdated': 'சுயவிவர புகைப்படம் புதுப்பிக்கப்பட்டது!',
    },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState('en');

    useEffect(() => {
        // Load saved language from localStorage
        const savedLang = localStorage.getItem('language');
        if (savedLang && translations[savedLang]) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: string) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        const langTranslations = translations[language] || translations['en'];
        return langTranslations[key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
