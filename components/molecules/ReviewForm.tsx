import React, { useState } from 'react';
import { useTranslation } from '../../hooks';
import type { Review } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Icon } from '../atoms/Icon';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ReviewFormProps {
    onSubmit: (review: Omit<Review, 'id' | 'productId' | 'date'>) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
    const { t } = useTranslation();
    const [author, setAuthor] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (author && rating > 0 && comment) {
            onSubmit({ author, rating, comment });
            setAuthor('');
            setRating(0);
            setComment('');
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000); // Reset after 3 seconds
        }
    };

    return (
        <Card className="sticky top-28">
            <CardHeader>
                 <CardTitle>{t('product_write_review')}</CardTitle>
            </CardHeader>
            <CardContent>
                {submitted ? (
                    <div className="text-center p-4 bg-primary/10 text-primary font-medium rounded-md">
                        {t('product_review_success')}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="author">{t('product_review_form_name')}</Label>
                            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                        </div>
                        <div>
                            <Label>{t('product_review_form_rating')}</Label>
                            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                               {[1, 2, 3, 4, 5].map(star => (
                                   <Icon 
                                       key={star}
                                       name="star"
                                       className={`w-6 h-6 cursor-pointer transition-colors ${
                                        (hoverRating || rating) >= star ? 'text-secondary' : 'text-muted'
                                       }`}
                                       onClick={() => setRating(star)}
                                       onMouseEnter={() => setHoverRating(star)}
                                   />
                               ))}
                            </div>
                        </div>
                        <div>
                             <Label htmlFor="comment">{t('product_review_form_comment')}</Label>
                             <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} required />
                        </div>
                        <Button type="submit" className="w-full">{t('product_review_form_submit')}</Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};