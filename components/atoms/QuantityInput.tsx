import React from 'react';
import { Button } from '../ui/button';
import { Icon } from './Icon';

interface QuantityInputProps {
    quantity: number;
    setQuantity: (quantity: number) => void;
    max?: number;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({ quantity, setQuantity, max = 99 }) => {
    const increment = () => setQuantity(Math.min(quantity + 1, max));
    const decrement = () => setQuantity(Math.max(quantity - 1, 1));

    return (
        <div className="flex items-center border rounded-md">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={decrement} 
                className="h-10 w-10 rounded-r-none text-muted-foreground hover:text-primary" 
                aria-label="Decrease quantity"
            >
                <Icon name="minus" className="w-4 h-4" />
            </Button>
            <input 
                type="text" 
                readOnly
                value={quantity} 
                className="w-12 text-center font-semibold bg-transparent focus:outline-none border-y-0 border-x"
                aria-label="Current quantity"
            />
            <Button 
                variant="ghost"
                size="icon"
                onClick={increment} 
                className="h-10 w-10 rounded-l-none text-muted-foreground hover:text-primary"
                aria-label="Increase quantity"
            >
                <Icon name="plus" className="w-4 h-4" />
            </Button>
        </div>
    );
};