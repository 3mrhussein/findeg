import React, { Suspense } from 'react';
import { Header } from '@/presentation/components/client/organisms/Header';
import { AnnouncementBar } from '@/presentation/components/client/organisms/AnnouncementBar';
import { Chatbot } from '@/presentation/components/client/organisms/Chatbot';
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
