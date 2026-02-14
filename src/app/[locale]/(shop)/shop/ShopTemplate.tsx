import { useTranslations } from "next-intl";
// ...removed import for T, use translation key directly
import { faqData } from "@/lib/constants";
import { Container } from "@/components/layout/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ShopContent } from "./ShopContent";

interface ShopTemplateProps {
  language?: "en" | "ar";
}

/**
 *
 */
const ShopTemplate: React.FC<ShopTemplateProps> = () => {
  const t = useTranslations();

  const faqItems = faqData.map((item) => ({
    id: item.questionKey,
    title: t(item.questionKey as any),
    content: t(item.answerKey as any),
  }));

  return (
    <>
      <div className="bg-muted">
        <Container className="py-12 lg:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground">{t("Pages.Shop.Title")}</h1>
          </div>

          <ShopContent />
        </Container>
      </div>

      <Container className="py-16 lg:py-24">
        <h2 className="text-3xl font-bold text-center text-foreground mb-2">
          {t("Pages.Shop.FaqTitle")}
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {/* Using a generic subtitle as fallback if specific one is missing in the migrated dictionary */}
          {t("Pages.Home.Categories.Subtitle")}
        </p>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
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
