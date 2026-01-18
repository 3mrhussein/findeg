import React, { Suspense } from 'react';
import { Header } from '@/presentation/shared/layout/Header';
import { AnnouncementBar } from '@/presentation/shared/layout/AnnouncementBar';
import { Chatbot } from '@/presentation/shared/components/Chatbot';
import { ShopClientLayout } from '@/presentation/shared/layout/ShopClientLayout';

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
