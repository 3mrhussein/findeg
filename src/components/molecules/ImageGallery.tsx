'use client';

import React, { useState } from 'react';

interface ImageGalleryProps {
    images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
    const [mainImage, setMainImage] = useState(images[0]);

    return (
        <div className="flex flex-col gap-4">
            <div className="aspect-square w-full bg-card border border-border rounded-lg overflow-hidden">
                <img src={mainImage} alt="Main product" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-5 gap-4">
                {images.map((img, index) => (
                    <div 
                        key={index} 
                        className={`aspect-square w-full bg-card border rounded-md overflow-hidden cursor-pointer transition-all ${mainImage === img ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
                        onClick={() => setMainImage(img)}
                    >
                        <img src={img} alt={`Product thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        </div>
    );
};
