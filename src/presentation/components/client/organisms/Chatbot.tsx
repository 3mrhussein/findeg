'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/presentation/hooks';
import { Button } from '@/presentation/components/ui/button';
import { Icon } from '@/presentation/components/server/atoms/Icon';
import { Input } from '@/presentation/components/ui/input';

interface ChatbotUIProps {
    title: string;
    placeholder: string;
    sendLabel: string;
    greeting: string;
}

export const ChatbotUI: React.FC<ChatbotUIProps> = ({ title, placeholder, sendLabel, greeting }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    size="icon"
                    shape="circle"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-200"
                    aria-label={title}
                >
                    {isOpen ? <Icon name="x" className="w-8 h-8"/> : <Icon name="chat" className="w-8 h-8" />}
                </Button>
            </div>
            
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm bg-card rounded-lg shadow-2xl border origin-bottom-right animate-fade-in-up">
                     <style>{`
                        @keyframes fade-in-up {
                            from { opacity: 0; transform: scale(0.9) translateY(10px); }
                            to { opacity: 1; transform: scale(1) translateY(0); }
                        }
                        .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
                    `}</style>
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 bg-muted/50 border-b">
                        <h3 className="font-bold text-lg">{title}</h3>
                        <Button variant="ghost" size="icon" shape="circle" onClick={() => setIsOpen(false)} aria-label="Close chat">
                            <Icon name="x" className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="p-4 h-80 overflow-y-auto">
                        <div className="flex justify-start mb-4">
                            <div className="bg-muted rounded-lg p-3 max-w-xs">
                                <p className="text-sm">{greeting}</p>
                            </div>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                        <form className="relative">
                            <Input 
                                type="text" 
                                placeholder={placeholder}
                                className="rounded-full ltr:pr-12 rtl:pl-12"
                            />
                            <Button size="icon" shape="circle" type="submit" className="absolute top-1/2 -translate-y-1/2 ltr:right-1 rtl:left-1 h-8 w-8 rounded-full" aria-label={sendLabel}>
                                <Icon name="send" className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export const Chatbot: React.FC = () => {
    const { t } = useTranslation() as { t: (key: string) => string };

    return (
        <ChatbotUI
            title={t('chatbot_title')}
            placeholder={t('chatbot_placeholder')}
            sendLabel={t('chatbot_send')}
            greeting={t('chatbot_greeting')}
        />
    );
};