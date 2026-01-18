import React from 'react';
import { faqData } from '@/constants';
import { Container } from '@/presentation/components/layout/Container';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/presentation/components/ui/accordion';
import { getTranslation } from '@/lib/i18n-server';
import { ShopContent } from '@/presentation/components/features/shop/ShopContent';

interface ShopTemplateProps {
  language?: 'en' | 'ar';
}

const ShopTemplate: React.FC<ShopTemplateProps> = ({ language = 'en' }) => {
  const { t } = getTranslation(language);
  
  const faqItems = faqData.map(item => ({
      id: item.questionKey,
      title: t(item.questionKey as any),
      content: t(item.answerKey as any)
  }));

  return (
    <>
      <div className="bg-muted">
        <Container className="py-12 lg:py-16">
          <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground">{t('shop_title')}</h1>
          </div>
          
          <ShopContent />
        </Container>
      </div>
      
      <Container className="py-16 lg:py-24">
        <h2 className="text-3xl font-bold text-center text-foreground mb-2">{t('faq_title')}</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('shop_by_category_subtitle')}
        </p>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map(item => (
                <AccordionItem value={item.id} key={item.id}>
                    <AccordionTrigger>{item.title}</AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </>
  );
};

export default ShopTemplate;