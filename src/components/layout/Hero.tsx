"use client";

/**
 * Hero UI (Client Component)
 *
 * Handles user interactions like smooth scrolling and navigation.
 */

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";

interface HeroUIProps {
  imageUrl?: string;
  titlePart1: string;
  titleLearning: string;
  titlePlay: string;
  subtitle: string;
  shopButtonText: string;
  exploreButtonText: string;
  schoolListButtonText: string;
}

/**
 *
 */
export const HeroUI: React.FC<HeroUIProps> = ({
  imageUrl,
  titlePart1,
  titleLearning,
  titlePlay,
  subtitle,
  shopButtonText,
  exploreButtonText,
  schoolListButtonText,
}) => {
  const router = useRouter();

  /**
   *
   */
  const handleShopClick = () => {
    router.push("/shop");
  };

  /**
   *
   */
  const handleExploreClick = () => {
    document.querySelector("#categories")?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   *
   */
  const handleSchoolListClick = () => {
    router.push("/school-lists");
  };

  return (
    <section className="bg-muted dark:bg-card/50 overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              {titlePart1} <span className="text-primary">{titleLearning}</span> &{" "}
              <span className="text-secondary">{titlePlay}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              {subtitle}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Button size="lg" onClick={handleShopClick}>
                {shopButtonText}
              </Button>
              <Button variant="outline" size="lg" onClick={handleExploreClick}>
                {exploreButtonText}
              </Button>
              <Button variant="ghost" size="lg" onClick={handleSchoolListClick}>
                {schoolListButtonText}
              </Button>
            </div>
          </div>
          {imageUrl && (
            <div className="hidden lg:flex justify-center">
              <div className="relative w-[450px] h-[450px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-3xl opacity-30"></div>
                <Image
                  src={imageUrl}
                  alt="FindEg.com hero image"
                  width={450}
                  height={450}
                  className="relative w-full h-full object-cover rounded-2xl shadow-xl transform rotate-3"
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};
