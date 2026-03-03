import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type LanguageState = 'tr' | 'en';

interface LanguageContextType {
    language: LanguageState;
    toggleLanguage: () => void;
    setLanguage: (lang: LanguageState) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<LanguageState>('tr');

    useEffect(() => {
        const storedLang = localStorage.getItem('language') as LanguageState | null;
        if (storedLang && (storedLang === 'tr' || storedLang === 'en')) {
            setLanguageState(storedLang);
        }
    }, []);

    const setLanguage = (lang: LanguageState) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const toggleLanguage = () => {
        setLanguage(language === 'tr' ? 'en' : 'tr');
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
