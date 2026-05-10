'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Loader2, FileText, User, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@findeg/ui';
import { Button } from '@findeg/ui';
import { Input } from '@findeg/ui';
import { Textarea } from '@findeg/ui';
import { Label } from '@findeg/ui';
import { useToast } from '@hooks/use-toast';

interface AccessRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listId: number;
  schoolName: string;
  listTitle: string;
  onSuccess: () => void;
}

/**
 * AccessRequestDialog
 *
 * Form for parents to request access to private school lists.
 * Collects child's name and an optional note.
 */
export function AccessRequestDialog({
  isOpen,
  onClose,
  listId,
  schoolName,
  listTitle,
  onSuccess,
}: AccessRequestDialogProps) {
  const t = useTranslations('School.AccessRequest');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [childName, setChildName] = useState('');
  const [note, setNote] = useState('');

  /**
   *
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/v1/school-lists/${listId}/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName, note }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({ title: t('successToast') });
        onSuccess?.();
        onClose();
      } else {
        toast({ variant: 'destructive', title: result.error || t('errorToast') });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: t('connectionError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">{t('title')}</DialogTitle>
          <DialogDescription className="text-base">
            {t('description', { school: schoolName, list: listTitle })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="childName" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              {t('childNameLabel')}
            </Label>
            <Input
              id="childName"
              placeholder={t('childNamePlaceholder')}
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              required
              disabled={isSubmitting}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              {t('noteLabel')}
            </Label>
            <Textarea
              id="note"
              placeholder={t('notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground italic">{t('noteHint')}</p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!childName.trim() || isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('sending')}
                </>
              ) : (
                <>
                  {t('submitButton')}
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
