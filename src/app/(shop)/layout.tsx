import React, { Suspense } from 'react';
import { Header } from '@/components/organisms/Header';
import { AnnouncementBar } from '@/components/organisms/AnnouncementBar';
import { Chatbot } from '@/components/organisms/Chatbot';
import { ShopClientLayout } from '@/components/layout/ShopClientLayout';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </main>
      <ShopClientLayout />
      <Chatbot />
    </>
  );
}
