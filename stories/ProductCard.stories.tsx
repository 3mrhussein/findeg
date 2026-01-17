import React from 'react';
import { ProductCard } from '../components/molecules/ProductCard';
import { CartProvider, I18nProvider } from '../contexts';
import { products } from '../constants';

export default {
  title: 'Molecules/ProductCard',
  component: ProductCard,
  decorators: [
    (Story: any) => (
      <I18nProvider>
        <CartProvider>
          <div className="w-72">
            <Story />
          </div>
        </CartProvider>
      </I18nProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

const Template = (args: any) => <ProductCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  product: products[0],
  navigateTo: (page: string, id?: number) => console.log(`Navigating to ${page} with id ${id}`),
};

export const NewItem = Template.bind({});
NewItem.args = {
  product: products.find(p => p.isNew) || products[0],
  navigateTo: (page: string, id?: number) => console.log(`Navigating to ${page} with id ${id}`),
};

export const NonNewItem = Template.bind({});
NonNewItem.args = {
    product: products[1],
    navigateTo: (page: string, id?: number) => console.log(`Navigating to ${page} with id ${id}`),
};
