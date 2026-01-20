import React from 'react';
import Image from 'next/image';
import { brandLogos } from '@/lib/constants';

interface ScrollingLogoCloudProps {
    direction?: 'left' | 'right';
    logos?: { name: string; logoUrl: string; }[];
}

export const ScrollingLogoCloud: React.FC<ScrollingLogoCloudProps> = ({
    direction = 'left',
    logos = brandLogos
}) => {
    if (!logos || logos.length === 0) {
        return null;
    }
    // Duplicate logos for seamless scroll effect
    const extendedLogos = [...logos, ...logos];
    const animationClass = direction === 'left' ? 'animate-scroll-x' : 'animate-scroll-x-reverse';

    return (
        <div
            className="group relative overflow-hidden whitespace-nowrap [mask-image:_linear-gradient(to_right,_transparent_0,_black_128px,_black_calc(100%-128px),_transparent_100%)]"
        >
            <div className={`inline-block ${animationClass} group-hover:[animation-play-state:paused]`}>
                {extendedLogos.map((brand, index) => (
                    <div key={`${brand.name}-${index}`} className="inline-flex items-center justify-center w-48 mx-8 align-middle">
                        <Image
                            className="max-h-10 w-auto"
                            src={brand.logoUrl}
                            alt={brand.name}
                            width={120}
                            height={40}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};