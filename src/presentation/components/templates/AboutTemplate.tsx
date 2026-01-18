import React from 'react';
import Image from 'next/image';
import { getTranslation } from '@/lib/i18n-server';
import { Container } from '@/presentation/components/layout/Container';
import { BrandShowcase } from '@/presentation/components/features/shop/BrandShowcase';
import { Button } from '@/presentation/components/ui/button';
import { Icon } from '@/presentation/components/shared/Icon';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Card, CardContent } from '@/presentation/components/ui/card';

interface AboutTemplateProps {
  language?: 'en' | 'ar';
}

const AboutTemplate: React.FC<AboutTemplateProps> = ({ language = 'en' }) => {
    const { t } = getTranslation(language);

    const values = [
        { key: 'quality', title: t('about_value_quality'), text: t('about_value_quality_text') },
        { key: 'creativity', title: t('about_value_creativity'), text: t('about_value_creativity_text') },
        { key: 'learning', title: t('about_value_learning'), text: t('about_value_learning_text') },
    ];
    
    const contactInfo = [
        { iconName: 'mail', text: t('contact_info_email') },
        { iconName: 'phone', text: t('contact_info_phone') },
        { iconName: 'location', text: t('contact_info_address') },
    ] as const;

    return (
        <>
            {/* Hero Section */}
            <div className="bg-muted">
                <Container className="text-center py-16 lg:py-24">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary">{t('about_hero_title')}</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">{t('about_hero_subtitle')}</p>
                </Container>
            </div>

            {/* Story Section */}
            <Container className="py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-6">{t('about_story_title')}</h2>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>{t('about_story_p1')}</p>
                            <p>{t('about_story_p2')}</p>
                        </div>
                    </div>
                    <div className="rounded-lg overflow-hidden shadow-xl">
                        <Image 
                            src="https://picsum.photos/seed/aboutus/800/600" 
                            alt="Team working" 
                            width={800}
                            height={600}
                            className="w-full h-full object-cover" 
                        />
                    </div>
                </div>
            </Container>

            {/* Mission & Values Section */}
            <div className="bg-muted">
                <Container className="py-16 lg:py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-primary/10 p-8 rounded-lg">
                            <h3 className="text-2xl font-bold text-primary mb-4">{t('about_mission_title')}</h3>
                            <p className="text-muted-foreground">{t('about_mission_text')}</p>
                        </div>
                        <div className="p-8">
                             <h3 className="text-2xl font-bold text-foreground mb-4">{t('about_values_title')}</h3>
                             <div className="space-y-4">
                                {values.map(value => (
                                    <div key={value.key}>
                                        <h4 className="font-semibold text-foreground">{value.title}</h4>
                                        <p className="text-muted-foreground text-sm">{value.text}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </Container>
            </div>
            
            {/* Brand Showcase */}
            <BrandShowcase />
            
            {/* Contact Section */}
            <div className="bg-background border-t border-border">
                <Container className="py-16 lg:py-24">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">{t('contact_title')}</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t('contact_subtitle')}</p>
                    </div>
                    <Card className="mt-12 max-w-4xl mx-auto">
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-8">
                                    <h3 className="text-xl font-bold">{t('contact_info_title')}</h3>
                                    {contactInfo.map(({ iconName, text }) => (
                                        <div key={text} className="flex items-start gap-4">
                                            <Icon name={iconName} className="w-6 h-6 text-primary mt-1" />
                                            <p className="text-muted-foreground">{text}</p>
                                        </div>
                                    ))}
                                </div>
                                <form className="space-y-6">
                                    <h3 className="text-xl font-bold">{t('contact_form_title')}</h3>
                                    <div>
                                        <Label htmlFor="contact_name" className="sr-only">{t('contact_form_name')}</Label>
                                        <Input type="text" id="contact_name" placeholder={t('contact_form_name')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_email" className="sr-only">{t('contact_form_email')}</Label>
                                        <Input type="email" id="contact_email" placeholder={t('contact_form_email')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_subject" className="sr-only">{t('contact_form_subject')}</Label>
                                        <Input type="text" id="contact_subject" placeholder={t('contact_form_subject')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_message" className="sr-only">{t('contact_form_message')}</Label>
                                        <Textarea id="contact_message" placeholder={t('contact_form_message')} rows={4}></Textarea>
                                    </div>
                                    <Button size="lg" className="w-full">{t('contact_form_send')}</Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </Container>
            </div>
        </>
    );
};

export default AboutTemplate;