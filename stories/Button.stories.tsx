import React from 'react';
import { Button } from '../components/atoms/Button';
// FIX: Use the Icon component instead of a non-existent ShoppingCartIcon export.
import { Icon } from '../components/atoms/Icon';

export default {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    children: {
        control: 'text',
    }
  },
  parameters: {
    layout: 'centered',
  },
};

const Template = (args: any) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  children: 'Primary Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  children: 'Secondary Button',
};

export const Outline = Template.bind({});
Outline.args = {
  variant: 'outline',
  children: 'Outline Button',
};

export const Ghost = Template.bind({});
Ghost.args = {
  variant: 'ghost',
  children: 'Ghost Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'lg',
  children: 'Large Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'sm',
  children: 'Small Button',
};

export const Disabled = Template.bind({});
Disabled.args = {
  children: 'Disabled Button',
  disabled: true,
};

export const WithIcon = (args: any) => (
    <Button {...args}>
        {/* FIX: Use the Icon component with the 'shoppingCart' name. */}
        <Icon name="shoppingCart" className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
        {args.children}
    </Button>
);
WithIcon.args = {
    variant: 'primary',
    children: 'Add to Cart',
};