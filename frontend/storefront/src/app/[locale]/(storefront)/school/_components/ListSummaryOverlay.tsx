'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@findeg/ui';
import { Button } from '@findeg/ui';
import { useTranslations } from 'next-intl';
import { ShoppingCart, CheckCircle, Package, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@findeg/ui';

interface ListSummaryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  list: any;
  items?: any[];
}

/**
 *
 */
export function ListSummaryOverlay({ isOpen, onClose, list, items = [] }: ListSummaryOverlayProps) {
  const t = useTranslations('School.ParentExperience.Summary');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col border-none shadow-2xl"
      >
        <div className="p-8 bg-primary/5 space-y-2 border-b">
          <SheetHeader>
            <SheetTitle className="text-3xl font-black leading-tight italic">
              {t('Title')}
            </SheetTitle>
            <SheetDescription className="text-base text-slate-600 font-medium">
              {list.schoolName} &middot; {list.grade}
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 p-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {t('ItemsInKit')}
              </h3>
              {/* List items summary will go here */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded border flex items-center justify-center p-1">
                      <img
                        src="https://placehold.co/50x50"
                        alt="item"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-900">Premium Colored Pencils</p>
                      <p className="text-xs text-muted-foreground">
                        Faber-Castell &middot; 24 Shades
                      </p>
                    </div>
                    <div className="text-sm font-bold">120 EGP</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <div className="flex justify-between text-slate-600">
                <span>{t('Subtotal')}</span>
                <span className="font-medium">450 EGP</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('OptionalItemsSelected')}</span>
                <span className="font-medium">2 Items</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg text-slate-900">{t('Total')}</span>
                <div className="text-right">
                  <span className="block text-3xl font-black text-primary leading-none">
                    450 <span className="text-sm">EGP</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {t('TaxIncluded')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-8 pb-12 bg-white border-t space-y-4">
          <Button
            className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 gap-3 animate-in zoom-in-95 duration-300"
            size="lg"
            onClick={() => {}}
          >
            <ShoppingCart className="w-6 h-6" />
            {t('AddToCart')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            {t('Satisfaction')}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
