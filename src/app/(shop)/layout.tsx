import React, { Suspense } from 'react';
import { Header } from '@/presentation/components/layout/Header';
import { AnnouncementBar } from '@/presentation/components/layout/AnnouncementBar';
import { Chatbot } from '@/presentation/components/shared/Chatbot';
import { ShopClientLayout } from '@/presentation/components/layout/ShopClientLayout';

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
