import React from 'react';
import { Badge } from '../components/atoms/Badge';

export default {
  title: 'Atoms/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
    children: {
        control: 'text',
    }
  },
  parameters: {
    layout: 'centered',
  },
};

const Template = (args: any) => <Badge {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  children: 'NEW',
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  children: 'SALE',
};

export const CustomText = Template.bind({});
CustomText.args = {
  variant: 'primary',
  children: 'Featured',
};
