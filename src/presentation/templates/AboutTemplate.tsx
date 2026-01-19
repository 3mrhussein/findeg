import { useTranslations } from 'next-intl';
import { T } from '@/i18n/content';
import Image from 'next/image';
import { Container } from '@/presentation/shared/layout/Container';
import { BrandShowcase } from '@/presentation/features/shop/components/BrandShowcase';
import { Button } from '@/presentation/shared/ui/button';
import { Icon } from '@/presentation/shared/components/Icon';
import { Input } from '@/presentation/shared/ui/input';
import { Label } from '@/presentation/shared/ui/label';
import { Textarea } from '@/presentation/shared/ui/textarea';
import { Card, CardContent } from '@/presentation/shared/ui/card';

interface AboutTemplateProps {
  language?: 'en' | 'ar';
}

const AboutTemplate: React.FC<AboutTemplateProps> = () => {
    const t = useTranslations();

    const values = [
        { key: 'quality', title: t(T.PAGES.ABOUT.VALUE_QUALITY), text: t(T.PAGES.ABOUT.VALUE_QUALITY_TEXT) },
        { key: 'creativity', title: t(T.PAGES.ABOUT.VALUE_CREATIVITY), text: t(T.PAGES.ABOUT.VALUE_CREATIVITY_TEXT) },
        { key: 'learning', title: t(T.PAGES.ABOUT.VALUE_LEARNING), text: t(T.PAGES.ABOUT.VALUE_LEARNING_TEXT) },
    ];
    
    const contactInfo = [
        { iconName: 'mail', text: t(T.PAGES.CONTACT.INFO_EMAIL) },
        { iconName: 'phone', text: t(T.PAGES.CONTACT.INFO_PHONE) },
        { iconName: 'location', text: t(T.PAGES.CONTACT.INFO_ADDRESS) },
    ] as const;

    return (
        <>
            {/* Hero Section */}
            <div className="bg-muted">
                <Container className="text-center py-16 lg:py-24">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary">{t(T.PAGES.ABOUT.HERO_TITLE)}</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">{t(T.PAGES.ABOUT.HERO_SUBTITLE)}</p>
                </Container>
            </div>

            {/* Story Section */}
            <Container className="py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-6">{t(T.PAGES.ABOUT.STORY_TITLE)}</h2>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>{t(T.PAGES.ABOUT.STORY_P1)}</p>
                            <p>{t(T.PAGES.ABOUT.STORY_P2)}</p>
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
                            <h3 className="text-2xl font-bold text-primary mb-4">{t(T.PAGES.ABOUT.MISSION_TITLE)}</h3>
                            <p className="text-muted-foreground">{t(T.PAGES.ABOUT.MISSION_TEXT)}</p>
                        </div>
                        <div className="p-8">
                             <h3 className="text-2xl font-bold text-foreground mb-4">{t(T.PAGES.ABOUT.VALUES_TITLE)}</h3>
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
                        <h2 className="text-3xl font-bold">{t(T.PAGES.CONTACT.TITLE)}</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t(T.PAGES.CONTACT.SUBTITLE)}</p>
                    </div>
                    <Card className="mt-12 max-w-4xl mx-auto">
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-8">
                                    <h3 className="text-xl font-bold">{t(T.PAGES.CONTACT.INFO_TITLE)}</h3>
                                    {contactInfo.map(({ iconName, text }) => (
                                        <div key={text} className="flex items-start gap-4">
                                            <Icon name={iconName} className="w-6 h-6 text-primary mt-1" />
                                            <p className="text-muted-foreground">{text}</p>
                                        </div>
                                    ))}
                                </div>
                                <form className="space-y-6">
                                    <h3 className="text-xl font-bold">{t(T.PAGES.CONTACT.FORM_TITLE)}</h3>
                                    <div>
                                        <Label htmlFor="contact_name" className="sr-only">{t(T.PAGES.CONTACT.FORM_NAME)}</Label>
                                        <Input type="text" id="contact_name" placeholder={t(T.PAGES.CONTACT.FORM_NAME)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_email" className="sr-only">{t(T.PAGES.CONTACT.FORM_EMAIL)}</Label>
                                        <Input type="email" id="contact_email" placeholder={t(T.PAGES.CONTACT.FORM_EMAIL)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_subject" className="sr-only">{t(T.PAGES.CONTACT.FORM_SUBJECT)}</Label>
                                        <Input type="text" id="contact_subject" placeholder={t(T.PAGES.CONTACT.FORM_SUBJECT)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_message" className="sr-only">{t(T.PAGES.CONTACT.FORM_MESSAGE)}</Label>
                                        <Textarea id="contact_message" placeholder={t(T.PAGES.CONTACT.FORM_MESSAGE)} rows={4}></Textarea>
                                    </div>
                                    <Button size="lg" className="w-full">{t(T.PAGES.CONTACT.FORM_SEND)}</Button>
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