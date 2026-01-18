'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
    images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
    const [mainImage, setMainImage] = useState(images[0]);

    return (
        <div className="flex flex-col gap-4">
            <div className="aspect-square w-full bg-card border border-border rounded-lg overflow-hidden relative">
                <Image
                    src={mainImage} 
                    alt="Main product" 
                    fill 
                    className="object-cover" 
                />
            </div>
            <div className="grid grid-cols-5 gap-4">
                {images.map((img, index) => (
                    <div 
                        key={index} 
                        className={`aspect-square w-full bg-card border rounded-md overflow-hidden cursor-pointer transition-all relative ${mainImage === img ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
                        onClick={() => setMainImage(img)}
                    >
                        <Image 
                            src={img} 
                            alt={`Product thumbnail ${index + 1}`} 
                            fill 
                            className="object-cover" 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
