import React from 'react';
import type { Product, Category, NavigationItem, Order, Review } from './types';
import { Icon } from './components/atoms/Icon';

export const products: Product[] = [
  {
    id: 1,
    name: 'Creative Gel Pen Set',
    price: 9.99,
    strikePrice: 12.99,
    description: 'A vibrant set of 24 gel pens, perfect for journaling and art.',
    longDescription: 'A vibrant set of 24 gel pens, perfect for journaling, note-taking, and adding a splash of color to your art projects. Quick-drying ink prevents smudging. Comes in a durable, travel-friendly case.',
    imageUrl: 'https://picsum.photos/seed/pens/400/400',
    images: ['https://picsum.photos/seed/pens/600/600', 'https://picsum.photos/seed/pens2/600/600', 'https://picsum.photos/seed/pens3/600/600', 'https://picsum.photos/seed/pens4/600/600'],
    category: 'Stationary',
    isNew: true,
    variants: {
      color: {
        name: "Color",
        options: [
          { value: 'Multi-color', stock: 10 },
          { value: 'Black', stock: 5 },
          { value: 'Blue', stock: 8 },
        ]
      }
    }
  },
  {
    id: 2,
    name: 'Wooden Building Blocks',
    price: 29.99,
    description: 'Classic set of 100 wooden blocks in various shapes and colors.',
    longDescription: 'Classic set of 100 wooden blocks in various shapes and colors. Encourages creativity, fine motor skills, and spatial reasoning. Made from child-safe, non-toxic materials and sanded smooth to the touch.',
    imageUrl: 'https://picsum.photos/seed/blocks/400/400',
    images: ['https://picsum.photos/seed/blocks/600/600', 'https://picsum.photos/seed/blocks2/600/600'],
    category: 'Toys',
  },
  {
    id: 3,
    name: 'Ergonomic School Backpack',
    price: 45.00,
    description: 'A durable and comfortable backpack designed for students.',
    longDescription: 'A durable and comfortable backpack designed for students. Features multiple compartments, padded shoulder straps, and a water-resistant finish to protect books and electronics. Available in multiple sizes to fit all ages.',
    imageUrl: 'https://picsum.photos/seed/backpack/400/400',
    images: ['https://picsum.photos/seed/backpack/600/600', 'https://picsum.photos/seed/backpack2/600/600', 'https://picsum.photos/seed/backpack3/600/600'],
    category: 'School Items',
     variants: {
      color: {
        name: "Color",
        options: [
          { value: 'Red', stock: 8 },
          { value: 'Green', stock: 0 },
          { value: 'Blue', stock: 12 },
        ]
      },
      size: {
        name: "Size",
        options: [
          { value: 'S', stock: 10 },
          { value: 'M', stock: 15 },
          { value: 'L', stock: 5 },
        ]
      }
    }
  },
  {
    id: 4,
    name: 'Watercolor Paint Set',
    price: 15.50,
    strikePrice: 19.50,
    description: 'This 36-color watercolor set is perfect for artists of all levels.',
    longDescription: 'This 36-color watercolor set is perfect for artists of all levels. Includes a high-quality brush and a portable case for painting on the go. The pigments are vibrant and blend beautifully on paper.',
    imageUrl: 'https://picsum.photos/seed/paint/400/400',
    images: ['https://picsum.photos/seed/paint/600/600', 'https://picsum.photos/seed/paint2/600/600'],
    category: 'Stationary',
  },
  {
    id: 5,
    name: 'Dinosaur Fossil Dig Kit',
    price: 24.99,
    description: 'Unearth a T-Rex skeleton with this fun and educational kit.',
    longDescription: 'Become a paleontologist! Unearth a realistic T-Rex skeleton with this fun and educational dig kit. Includes a plaster block with embedded bones, digging tools, and a guide book.',
    imageUrl: 'https://picsum.photos/seed/dino/400/400',
    images: ['https://picsum.photos/seed/dino/600/600', 'https://picsum.photos/seed/dino2/600/600'],
    category: 'Toys',
    isNew: true,
  },
  {
    id: 6,
    name: 'Insulated Lunch Box',
    price: 18.00,
    description: 'Keep meals fresh with this stylish and durable lunch box.',
    longDescription: 'Keep meals fresh with this stylish and durable lunch box. Features an insulated interior, a zippered front pocket for utensils, and an easy-to-clean lining. Perfect for school or picnics.',
    imageUrl: 'https://picsum.photos/seed/lunchbox/400/400',
    images: ['https://picsum.photos/seed/lunchbox/600/600'],
    category: 'School Items',
  },
  {
    id: 7,
    name: 'Premium Leather Notebook',
    price: 22.00,
    description: 'A stylish leather-bound notebook for your best ideas.',
    longDescription: 'Keep your thoughts organized in this elegant A5 leather-bound notebook. Featuring 200 pages of high-quality, acid-free paper, it\'s perfect for journaling, sketching, or meeting notes. Includes a ribbon bookmark and an elastic closure.',
    imageUrl: 'https://picsum.photos/seed/notebook/400/400',
    images: ['https://picsum.photos/seed/notebook/600/600', 'https://picsum.photos/seed/notebook2/600/600'],
    category: 'Stationary',
    isNew: true,
    variants: {
      color: {
        name: "Color",
        options: [
          { value: 'Black', stock: 15 },
          { value: 'Brown', stock: 10 },
          { value: 'Navy', stock: 5 },
        ]
      }
    }
  },
  {
    id: 8,
    name: 'DIY Robot Building Kit',
    price: 35.99,
    strikePrice: 42.00,
    description: 'Build and program your own solar-powered robot.',
    longDescription: 'An engaging STEM toy that teaches kids about robotics and solar energy. This kit includes all the parts needed to build 12 different types of robots. No batteries required, it runs on the power of the sun!',
    imageUrl: 'https://picsum.photos/seed/robotkit/400/400',
    images: ['https://picsum.photos/seed/robotkit/600/600', 'https://picsum.photos/seed/robotkit2/600/600'],
    category: 'Toys',
  },
  {
    id: 9,
    name: 'Artist\'s Sketchpad (A4)',
    price: 12.50,
    description: 'High-quality, heavyweight paper for serious artists.',
    longDescription: 'This A4 sketchpad contains 50 sheets of 150gsm, acid-free paper, perfect for pencil, charcoal, and ink drawings. The spiral binding allows the pad to lay flat for easy use.',
    imageUrl: 'https://picsum.photos/seed/sketchpad/400/400',
    images: ['https://picsum.photos/seed/sketchpad/600/600'],
    category: 'Stationary',
  },
  {
    id: 10,
    name: 'Plush Teddy Bear',
    price: 19.99,
    description: 'A soft and cuddly companion for children.',
    longDescription: 'This classic teddy bear is irresistibly soft and huggable. Made from high-quality, child-safe materials, it\'s the perfect friend for bedtime stories and adventures. Stands 12 inches tall.',
    imageUrl: 'https://picsum.photos/seed/teddybear/400/400',
    images: ['https://picsum.photos/seed/teddybear/600/600', 'https://picsum.photos/seed/teddybear2/600/600'],
    category: 'Toys',
    variants: {
      size: {
        name: "Size",
        options: [
          { value: 'Small', stock: 20 },
          { value: 'Medium', stock: 15 },
          { value: 'Large', stock: 10 },
        ]
      }
    }
  },
  {
    id: 11,
    name: 'Set of 12 Graphite Pencils',
    price: 7.99,
    description: 'A complete set of graphite pencils for drawing and writing.',
    longDescription: 'This set includes 12 pre-sharpened graphite pencils ranging from 6B (soft) to 4H (hard). Ideal for students, artists, and professionals for sketching, shading, and technical drawing. Comes in a protective tin case.',
    imageUrl: 'https://picsum.photos/seed/pencils/400/400',
    images: ['https://picsum.photos/seed/pencils/600/600', 'https://picsum.photos/seed/pencils2/600/600'],
    category: 'School Items',
    isNew: true,
  },
  {
    id: 12,
    name: 'Kids\' Play Tent',
    price: 49.99,
    description: 'An easy-to-assemble play tent for indoor adventures.',
    longDescription: 'Spark your child\'s imagination with this delightful play tent. Perfect for creating a cozy reading nook or a secret hideout. Made from durable polyester and features a roll-up door and mesh windows. Folds away for easy storage.',
    imageUrl: 'https://picsum.photos/seed/playtent/400/400',
    images: ['https://picsum.photos/seed/playtent/600/600', 'https://picsum.photos/seed/playtent2/600/600'],
    category: 'Toys',
    variants: {
      color: {
        name: "Color",
        options: [
          { value: 'Pink', stock: 7 },
          { value: 'Blue', stock: 7 },
          { value: 'Starry Night', stock: 5 },
        ]
      }
    }
  }
];

export const categories: Category[] = [
  {
    name: 'Stationary',
    description: 'Pens, notebooks, and creative supplies.',
    imageUrl: 'https://picsum.photos/seed/stationarycat/600/400',
  },
  {
    name: 'Kids Toys',
    description: 'Educational and fun toys for all ages.',
    imageUrl: 'https://picsum.photos/seed/toyscat/600/400',
  },
  {
    name: 'School Items',
    description: 'Backpacks, lunchboxes, and essentials.',
    imageUrl: 'https://picsum.photos/seed/schoolcat/600/400',
  },
];

export const orders: Order[] = [
    { id: 'ORD001', customerName: 'Jane Doe', date: '2024-07-28', total: 45.00, status: 'Shipped', items: [{ productId: 3, productName: 'Ergonomic School Backpack', quantity: 1, price: 45.00 }] },
    { id: 'ORD002', customerName: 'John Smith', date: '2024-07-27', total: 34.98, status: 'Processing', items: [{ productId: 1, productName: 'Creative Gel Pen Set', quantity: 1, price: 9.99 }, { productId: 5, productName: 'Dinosaur Fossil Dig Kit', quantity: 1, price: 24.99 }] },
    { id: 'ORD003', customerName: 'Alice Johnson', date: '2024-07-27', total: 15.50, status: 'Delivered', items: [{ productId: 4, productName: 'Watercolor Paint Set', quantity: 1, price: 15.50 }] },
    { id: 'ORD004', customerName: 'Bob Brown', date: '2024-07-26', total: 29.99, status: 'Delivered', items: [{ productId: 2, productName: 'Wooden Building Blocks', quantity: 1, price: 29.99 }] },
    { id: 'ORD005', customerName: 'Charlie Davis', date: '2024-07-25', total: 36.00, status: 'Cancelled', items: [{ productId: 6, productName: 'Insulated Lunch Box', quantity: 2, price: 18.00 }] },
    { id: 'ORD006', customerName: 'Jane Doe', date: '2024-07-24', total: 55.98, status: 'Delivered', items: [{ productId: 7, productName: 'Premium Leather Notebook', quantity: 1, price: 22.00 }, { productId: 8, productName: 'DIY Robot Building Kit', quantity: 1, price: 35.99 }] },

];

export const reviews: Review[] = [
  { id: 1, productId: 1, author: 'Emily R.', rating: 5, date: '2024-07-20', comment: 'These pens are amazing! The colors are so vibrant and they write smoothly. Perfect for my bullet journal.' },
  { id: 2, productId: 1, author: 'Mark T.', rating: 4, date: '2024-07-18', comment: 'Good set of pens, lots of colors. A couple of them were a bit scratchy at first but they work fine now.' },
  { id: 3, productId: 3, author: 'Sarah L.', rating: 5, date: '2024-07-22', comment: 'Best backpack my son has ever had. It\'s sturdy, has lots of pockets, and the straps are really comfortable. Highly recommend!' },
  { id: 4, productId: 2, author: 'David P.', rating: 5, date: '2024-07-15', comment: 'A classic toy for a reason. My kids play with these for hours. The quality of the wood is excellent.' },
  { id: 5, productId: 5, author: 'Jessica B.', rating: 4, date: '2024-07-25', comment: 'My nephew loved this kit! It was a bit messy but that was part of the fun. Kept him occupied all afternoon.' },
  { id: 6, productId: 7, author: 'Chris G.', rating: 5, date: '2024-07-19', comment: 'This notebook feels so premium. The leather is soft and the paper quality is fantastic for fountain pens. No bleed-through at all.' },
  { id: 7, productId: 8, author: 'Olivia M.', rating: 4, date: '2024-07-12', comment: 'Fun STEM kit. The instructions could be a little clearer for a younger child, but we figured it out together. The solar power aspect is really cool.' },
  { id: 8, productId: 4, author: 'ArtStudent88', rating: 5, date: '2024-07-21', comment: 'Great value for the price. The pigments are surprisingly vibrant and they blend well. Perfect for beginners and hobbyists.' },
  { id: 9, productId: 3, author: 'MomOfTwo', rating: 4, date: '2024-07-14', comment: 'Good quality backpack. Wish it had a dedicated water bottle pocket on the side, but otherwise it\'s great.' },
  { id: 10, productId: 1, author: 'PlannerAddict', rating: 5, date: '2024-07-28', comment: 'I buy this set every year. I just love how smooth they are. The new colors in this version are beautiful!' },
  { id: 11, productId: 2, author: 'ParentOfTwo', rating: 5, date: '2024-07-29', comment: 'Absolutely timeless. My kids love these blocks more than their tablets. The quality is fantastic and they feel very durable.' },
  { id: 12, productId: 4, author: 'Hobby Painter', rating: 4, date: '2024-07-28', comment: 'For the price, this is a great set. The colors are bright and it comes with everything you need to start. Perfect for a beginner.' },
  { id: 13, productId: 6, author: 'Mike P.', rating: 5, date: '2024-07-27', comment: 'Keeps food cold all day. The material is easy to clean and it has held up really well after months of daily use. Great purchase.' },
  { id: 14, productId: 9, author: 'Art Student', rating: 5, date: '2024-07-26', comment: 'The paper quality is excellent for pencil and charcoal. Very little smudging and it has a nice tooth. Will buy again.' },
  { id: 15, productId: 10, author: 'Grandma G.', rating: 5, date: '2024-07-25', comment: 'Bought this for my grandson and he takes it everywhere. It is so incredibly soft and cuddly. A perfect classic teddy bear.' },
  { id: 16, productId: 11, author: 'Designer Dan', rating: 4, date: '2024-07-24', comment: 'A solid set of pencils for sketching. The range of hardness is great for shading. The tin case is a nice touch.' },
  { id: 17, productId: 12, author: 'Liam\'s Mom', rating: 5, date: '2024-07-23', comment: 'Easy to set up and bigger than I expected! My son has turned it into his little clubhouse. It\'s been a huge hit.' },
  { id: 18, productId: 7, author: 'Writer Gal', rating: 3, date: '2024-07-22', comment: 'The leather cover is nice, but the paper is a bit thin for my liking. My fountain pen ink bleeds through slightly. Better for ballpoint pens.' },
  { id: 19, productId: 8, author: 'STEM Dad', rating: 5, date: '2024-07-21', comment: 'What a fantastic toy! My daughter and I had a blast building the different robots. It\'s educational and really fun to see it work with solar power.' },
  { id: 20, productId: 3, author: 'Tom W.', rating: 5, date: '2024-07-20', comment: 'I was hesitant about the price, but this backpack is worth every penny. The support it offers for my daughter\'s back is noticeable. Very well made.' },
];


// ICONS
export const iconPaths = {
  pen: <path d="M16.5862 3.92893L19.4147 6.75736L7.82893 18.3431L4.34315 18.3431L4.34315 14.8574L16.5862 3.92893ZM20.8289 5.34315L18 2.51472L19.4147 1.10051C19.8052 0.710009 20.4384 0.710009 20.8289 1.10051L22.2431 2.51472C22.6337 2.90524 22.6337 3.53841 22.2431 3.92893L20.8289 5.34315ZM3 19.3431L3 20.3431C3 20.8954 3.44772 21.3431 4 21.3431L13.5 21.3431L13.5 19.3431L3 19.3431Z" />,
  puzzle: <path d="M22 17H19V15H22V13C22 12.4477 21.5523 12 21 12H19C18.4477 12 18 11.5523 18 11V9C18 8.44772 17.5523 8 17 8H15V5H17V2H11V5H13V7C13 7.55228 13.4477 8 14 8H15V11H12V9H5V11H2V17H5V15H8V17H11V20C11 20.5523 11.4477 21 12 21H14C14.5523 21 15 20.5523 15 20V17H22Z" />,
  backpack: <path d="M19.5 6.5C19.5 5.67157 18.8284 5 18 5H15V3.5C15 2.11929 13.8807 1 12.5 1H11.5C10.1193 1 9 2.11929 9 3.5V5H6C5.17157 5 4.5 5.67157 4.5 6.5V10H19.5V6.5ZM4 22C4 22.5523 4.44772 23 5 23H19C19.5523 23 20 22.5523 20 22V11H4V22ZM7 14C7 13.4477 7.44772 13 8 13H16C16.5523 13 17 13.4477 17 14V18C17 18.5523 16.5523 19 16 19H8C7.44772 19 7 18.5523 7 18V14Z" />,
  search: <path d="M18.031 16.617L22.314 20.899L20.899 22.314L16.617 18.031C15.0237 19.3082 13.042 20.0029 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20.0029 13.042 19.3082 15.0237 18.031 16.617ZM16.025 15.875C17.2941 14.5699 18.0029 12.8204 18 11C18 7.132 14.867 4 11 4C7.132 4 4 7.132 4 11C4 14.867 7.132 18 11 18C12.8204 18.0029 14.5699 17.2941 15.875 16.025Z" />,
  chat: <path d="M20 2H4C2.89543 2 2 2.89543 2 4V22L6 18H20C21.1046 18 22 17.1046 22 16V4C22 2.89543 21.1046 2 20 2Z" />,
  send: <path d="M3.478 2.405A.75.75 0 002.25 3.126l18 9a.75.75 0 000 1.348l-18 9a.75.75 0 00-1.228-.721l4.068-6.81-4.068-6.81a.75.75 0 00-.54-.421z" />,
  mail: <path d="M1.5 4.5H22.5V6H1.5V4.5ZM1.5 20.5H22.5V19H1.5V20.5ZM1.5 7.5H3.268L12 14.536L20.732 7.5H22.5V17.5H1.5V7.5Z" />,
  phone: <path d="M21 16.42v3.536a1 1 0 0 1-1.212.971A18.342 18.342 0 0 1 3.5 4.71a1 1 0 0 1 .97-1.213h3.536a1 1 0 0 1 .971 1.212 15.341 15.341 0 0 0 1.122 3.791 1 1 0 0 1-.418 1.169l-1.54 1.155a13.341 13.341 0 0 0 5.656 5.656l1.155-1.54a1 1 0 0 1 1.169-.418 15.343 15.343 0 0 0 3.79 1.122 1 1 0 0 1 1.213.971z" />,
  location: <path d="M12 20.899l-5.657-5.657a8 8 0 1 1 11.314 0L12 20.899zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  dashboard: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />,
  package: <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.236L18.667 8 12 11.764 5.333 8 12 4.236zM5 15.91l6 3.333v-7.25L5 8.667v7.243zm8 0v-7.243L19 8.667v7.25l-6 3.333z" />,
  users: <path d="M9 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm11-5h-2v2h2v-2zm0 4h-2v2h2v-2zm0-8h-2v2h2V4z" />,
  google: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.28-.059-1.688-.073-4.947-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" />,
  shoppingCart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" fill="none" stroke="currentColor" />,
  magicWand: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278V2.75M8.75 7.5L6.42969 5.17969M15.25 7.5L17.5703 5.17969M6.25278 12H2.75M17.7472 12H21.25M8.75 16.5L6.42969 18.8203M15.25 16.5L17.5703 18.8203M12 17.7472V21.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" /></>,
  menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" />,
  x: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" fill="none" stroke="currentColor" />,
  heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.672l1.318-1.354a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" fill="none" stroke="currentColor" />,
  bookmark: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" fill="none" stroke="currentColor" />,
  sun: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" fill="none" stroke="currentColor" />,
  moon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" fill="none" stroke="currentColor" />,
  chevronDown: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" fill="none" stroke="currentColor" />,
  chevronRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" fill="none" stroke="currentColor" />,
  plus: <path d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z" />,
  minus: <path d="M5 12C5 11.4477 5.44772 11 6 11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H6C5.44772 13 5 12.5523 5 12Z" />,
  trash: <path d="M7 6V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7C3 6.44772 3.44772 6 4 6H7ZM7 8H17V20C17 21.1046 16.1046 22 15 22H9C7.89543 22 7 21.1046 7 20V8Z" />,
  grid: <path d="M14 10V4H20V10H14ZM4 10V4H10V10H4ZM14 20V14H20V20H14ZM4 20V14H10V20H4Z" />,
  list: <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />,
  facebook: <path d="M14 13.5H16.5L17.5 9.5H14V7.5C14 6.47 14 5.5 16 5.5H17.5V2.14C17.174 2.097 15.943 2 14.643 2C11.928 2 10 3.657 10 6.7V9.5H7V13.5H10V22H14V13.5Z" />,
  instagram: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.28-.059-1.688-.073-4.947-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" />,
  twitter: <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.793 4.649-.65.177-1.354.23-2.06.088.621 1.954 2.425 3.379 4.565 3.419-1.724 1.35-3.882 2.083-6.234 2.083-.404 0-.79-.023-1.175-.068 2.226 1.433 4.872 2.27 7.734 2.27 9.284 0 14.376-7.618 14.376-14.376 0-.218-.005-.436-.013-.652.984-.709 1.838-1.599 2.52-2.624z" />,
  star: <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />,
};

export const navigationSchema: NavigationItem[] = [
    { labelKey: 'nav_shop', href: 'shop' },
    { 
      labelKey: 'nav_categories', 
      href: 'categories',
      isMegaMenu: true,
      megaMenuColumns: [
        {
          titleKey: 'category_stationary_title',
          links: [
            { labelKey: 'category_stationary_pens', href: '#', subLinks: [
              { labelKey: 'sub_gel_pens', href: '#', icon: <Icon name="pen" className="w-4 h-4" /> },
              { labelKey: 'sub_ballpoint', href: '#', icon: <Icon name="pen" className="w-4 h-4" /> },
            ]},
            { labelKey: 'category_stationary_notebooks', href: '#' },
            { labelKey: 'category_stationary_art', href: '#', isNew: true },
          ]
        },
        {
          titleKey: 'category_toys_title',
          links: [
            { labelKey: 'category_toys_educational', href: '#' },
            { labelKey: 'category_toys_blocks', href: '#' },
            { labelKey: 'category_toys_puzzles', href: '#', subLinks: [
              { labelKey: 'sub_jigsaw', href: '#', icon: <Icon name="puzzle" className="w-4 h-4" /> },
              { labelKey: 'sub_3d_puzzles', href: '#', icon: <Icon name="puzzle" className="w-4 h-4" /> },
            ]},
          ]
        },
        {
          titleKey: 'category_school_title',
          links: [
            { labelKey: 'category_school_backpacks', href: '#', subLinks: [
              { labelKey: 'sub_ergonomic', href: '#', icon: <Icon name="backpack" className="w-4 h-4" /> },
              { labelKey: 'sub_themed', href: '#', icon: <Icon name="backpack" className="w-4 h-4" /> },
            ] },
            { labelKey: 'category_school_lunchboxes', href: '#' },
          ]
        }
      ]
    },
    { labelKey: 'nav_ai_generator', href: 'home' }, // Should scroll on home
    { labelKey: 'nav_about', href: 'about' },
    { labelKey: 'nav_my_account', href: 'my-account' },
    { labelKey: 'nav_dashboard', href: 'dashboard' },
];

export const brandLogos = [
    { name: 'Brand A', logoUrl: 'https://tailwindui.com/img/logos/158x48/transistor-logo-gray-400.svg' },
    { name: 'Brand B', logoUrl: 'https://tailwindui.com/img/logos/158x48/reform-logo-gray-400.svg' },
    { name: 'Brand C', logoUrl: 'https://tailwindui.com/img/logos/158x48/tuple-logo-gray-400.svg' },
    { name: 'Brand D', logoUrl: 'https://tailwindui.com/img/logos/158x48/savvycal-logo-gray-400.svg' },
    { name: 'Brand E', logoUrl: 'https://tailwindui.com/img/logos/158x48/statamic-logo-gray-400.svg' },
];

export const cookieSettings = [
    {
        id: 'required',
        titleKey: 'cookie_category_required',
        descriptionKey: 'cookie_category_required_desc',
        isMutable: false,
    },
    {
        id: 'analytics',
        titleKey: 'cookie_category_analytics',
        descriptionKey: 'cookie_category_analytics_desc',
        isMutable: true,
    },
    {
        id: 'marketing',
        titleKey: 'cookie_category_marketing',
        descriptionKey: 'cookie_category_marketing_desc',
        isMutable: true,
    },
];

export const faqData = [
    {
        questionKey: 'faq_q1',
        answerKey: 'faq_a1',
    },
    {
        questionKey: 'faq_q2',
        answerKey: 'faq_a2',
    },
    {
        questionKey: 'faq_q3',
        answerKey: 'faq_a3',
    },
    {
        questionKey: 'faq_q4',
        answerKey: 'faq_a4',
    },
];