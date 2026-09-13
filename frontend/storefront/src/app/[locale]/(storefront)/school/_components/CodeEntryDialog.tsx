'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@findeg/ui';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { useToast } from '@hooks/use-toast';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';

interface CodeEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listId: number;
  listTitle: string;
  onSuccess: () => void;
}

/**
 * CodeEntryDialog
 *
 * Handles 6-character code entry for restricted school lists.
 * Implements lockout feedback and API integration.
 */
export function CodeEntryDialog({
  isOpen,
  onClose,
  listId,
  listTitle,
  onSuccess,
}: CodeEntryDialogProps) {
  const t = useTranslations('School.CodeEntry');
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);

  /**
   *
   */
  const handleVerify = async () => {
    if (code.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/school-lists/${listId}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({ title: t('successToast') });
        onSuccess();
        onClose();
      } else {
        setError(result.error || t('wrongCode'));
        if (result.locked) {
          setLockedUntil(result.lockedUntil);
        }
        toast({ variant: 'destructive', title: result.error || t('errorToast') });
      }
    } catch (err) {
      setError(t('connectionError'));
      toast({ variant: 'destructive', title: t('connectionError') });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">{t('title')}</DialogTitle>
          <DialogDescription className="text-base">
            {t('description', { list: listTitle })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(val) => setCode(val.toUpperCase())}
            disabled={isVerifying || !!lockedUntil}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/5 p-3 rounded-md border border-destructive/10 w-full animate-in fade-in zoom-in-95">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {lockedUntil && (
            <div className="text-sm text-muted-foreground italic">
              {t('lockedUntil', { time: new Date(lockedUntil).toLocaleTimeString() })}
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-center gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isVerifying}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || isVerifying || !!lockedUntil}
            className="min-w-[120px]"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('verifying')}
              </>
            ) : (
              <>
                {t('verifyButton')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
