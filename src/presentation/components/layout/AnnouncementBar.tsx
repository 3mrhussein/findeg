'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@/presentation/components/shared/Icon';
import { useTranslation } from '@/presentation/hooks';

interface AnnouncementBarUIProps {
    isVisible: boolean;
    onClose: () => void;
    text: string;
    closeLabel: string;
}

export const AnnouncementBarUI: React.FC<AnnouncementBarUIProps> = ({ isVisible, onClose, text, closeLabel }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="bg-primary text-white text-sm font-medium">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-center py-2">
                    <p>{text}</p>
                    <button 
                        onClick={onClose} 
                        aria-label={closeLabel}
                        className="absolute ltr:right-0 rtl:left-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <Icon name="x" className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AnnouncementBar: React.FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        try {
            const dismissed = localStorage.getItem('announcementDismissed');
            if (dismissed !== 'true') {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsVisible(true);
            }
        } catch (error) {
            console.error("Could not read from localStorage:", error);
            setIsVisible(true); // Show if localStorage is not available
        }
    }, []);

    const handleClose = () => {
        try {
            localStorage.setItem('announcementDismissed', 'true');
        } catch (error) {
            console.error("Could not write to localStorage:", error);
        }
        setIsVisible(false);
    };

    return (
        <AnnouncementBarUI
            isVisible={isVisible}
            onClose={handleClose}
            text={t('announcement_bar_text')}
            closeLabel={t('announcement_bar_close')}
        />
    );
};