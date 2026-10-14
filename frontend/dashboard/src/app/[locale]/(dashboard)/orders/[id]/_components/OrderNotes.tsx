'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@findeg/ui';
import { Textarea } from '@findeg/ui';
import { addOrderNoteAction } from '@data/orders/actions';
import { useRouter } from '@i18n/navigation';
import { useToast } from '@hooks/use-toast';
import type { OrderNote } from '@findeg/orders';

interface OrderNotesProps {
  orderId: number;
  notes: OrderNote[];
}

export function OrderNotes({ orderId, notes }: OrderNotesProps) {
  const t = useTranslations('Administration.OrdersDetail');
  const [noteText, setNoteText] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed) return;

    startTransition(async () => {
      try {
        const result = await addOrderNoteAction(orderId, trimmed);
        if (result.success) {
          toast({ title: t('NoteAdded') });
          setNoteText('');
          router.refresh();
        } else {
          toast({
            title: t('NoteFailed'),
            description: result.error,
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: t('NoteFailed'),
          description: t('RequestFailed'),
          variant: 'destructive',
        });
      }
    });
  };

  const sortedNotes = [...(notes || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center space-y-0 gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <CardTitle className="text-sm font-bold uppercase tracking-wider">
          {t('NotesTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddNote} className="space-y-2">
          <Textarea
            placeholder={t('NotesPlaceholder')}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            disabled={isPending}
            rows={3}
            data-testid="order-note-input"
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !noteText.trim()}
              data-testid="order-note-submit"
            >
              <Send className="mr-2 h-3.5 w-3.5" />
              {t('AddNote')}
            </Button>
          </div>
        </form>

        <div className="space-y-3 pt-2 border-t">
          {sortedNotes.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2 text-center">{t('NoNotes')}</p>
          ) : (
            sortedNotes.map((n) => (
              <div
                key={n.id}
                data-testid="order-note-item"
                className="p-3 rounded-lg bg-muted/40 text-sm space-y-1 border border-border/50"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground" data-testid="order-note-author">
                    {n.authorName || 'Staff'}
                  </span>
                  <span data-testid="order-note-date">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p
                  className="text-foreground whitespace-pre-wrap text-xs"
                  data-testid="order-note-text"
                >
                  {n.note}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
