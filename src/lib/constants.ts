import type { Product, Order, Review } from '@/types';
import T from '@/infrastructure/cms/messages/en.json';

/**
 * Centralized configuration and mock data.
 * 
 * This file contains structured data used throughout the application, such as:
 * - Product lists (mock database)
 * - Navigation menus
 * - FAQ items
 * - Cookie settings
 * 
 * Pattern:
 * - Data here defines the *structure* and *logic* (e.g., links, IDs, prices).
 * - Text labels often use keys (e.g., `labelKey`) that map to `lib/i18n.ts`.
 *   This separates data from presentation text, enabling easy translation.
 */

/**
 * Mock data for products.
 * 
 * This array simulates a database of products, including details like price, description,
 * category, and variants.
 * 
 * @type {Product[]}
 */
export const products: Product[] = [
  {
    id: 1,
    name: 'Premium Gel Pen Set',
    description: 'A set of 12 high-quality gel pens in vibrant colors. Perfect for journaling and art projects.',
    longDescription: 'Experience smooth, skip-free writing with our Premium Gel Pen Set. This collection features 12 unique colors, each formulated with high-pigment ink that dries quickly to prevent smudging. The ergonomic grip ensures comfort during long writing sessions, making them ideal for students, artists, and professionals alike. Whether you are color-coding your notes or creating intricate mandalas, these pens deliver consistent performance and brilliant results.',
    price: 19.99,
    strikePrice: 24.99,
    category: 'Stationary',
    images: [
      'https://images.unsplash.com/photo-1585336261022-69c66d117f6e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    ],
    isNew: true,
    rating: 4.8,
    reviewsCount: 124,
    variants: {
      'Pack Size': {
        name: 'Pack Size',
        options: [
          { value: '12-pack', label: '12 Pack', priceModifier: 0, stock: 50 },
          { value: '24-pack', label: '24 Pack', priceModifier: 15, stock: 30 },
        ]
      }
    }
  },
  {
    id: 2,
    name: 'Wooden Building Blocks',
    description: 'Classic 50-piece wooden block set for creative play and motor skill development.',
    longDescription: 'Spark your child\'s imagination with our Classic Wooden Building Blocks. This 50-piece set includes a variety of shapes and sizes, all crafted from sustainably sourced hardwood and finished with non-toxic, child-safe paints. These blocks are designed to encourage open-ended play, helping children develop fine motor skills, spatial awareness, and problem-solving abilities. From towering castles to futuristic cities, the possibilities are endless with this timeless toy.',
    price: 34.99,
    category: 'Toys',
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800',
    ],
    rating: 4.9,
    reviewsCount: 86,
  },
  {
    id: 3,
    name: 'Ergonomic School Backpack',
    description: 'Durable and comfortable backpack with multiple compartments and reflective safety strips.',
    longDescription: 'Our Ergonomic School Backpack is designed with your child\'s comfort and safety in mind. Featuring padded shoulder straps and a breathable back panel, it provides excellent support even when fully loaded. The durable, water-resistant fabric protects school supplies from the elements, while multiple compartments keep everything organized. For added safety, we\'ve included high-visibility reflective strips on the front and sides, ensuring your child is seen during early morning or late afternoon commutes.',
    price: 45.00,
    strikePrice: 55.00,
    category: 'School Items',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    ],
    rating: 4.7,
    reviewsCount: 210,
    variants: {
      'Color': {
        name: 'Color',
        options: [
          { value: 'blue', label: 'Ocean Blue', priceModifier: 0, stock: 15 },
          { value: 'pink', label: 'Rose Pink', priceModifier: 0, stock: 10 },
          { value: 'green', label: 'Forest Green', priceModifier: 0, stock: 20 },
        ]
      }
    }
  },
  {
      id: 4,
      name: 'Watercolor Paint Set',
      description: 'Professional grade 24-color watercolor set with two brushes and a mixing palette.',
      longDescription: 'Unleash your inner artist with our Professional Watercolor Paint Set. This comprehensive kit features 24 highly pigmented, artist-grade colors that blend beautifully to create a vast spectrum of shades. The set includes two high-quality synthetic brushes (round and flat) and a built-in mixing palette in the lid, making it perfect for painting at home or on the go. Whether you are a seasoned professional or just starting your artistic journey, this set provides the quality and versatility you need.',
      price: 29.99,
      category: 'Stationary',
      images: [
          'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.6,
      reviewsCount: 45,
  },
  {
      id: 5,
      name: 'Solar System Puzzle',
      description: '1000-piece educational puzzle featuring detailed illustrations of our solar system.',
      longDescription: 'Embark on a journey through space with our Solar System Puzzle. This 1000-piece challenge features a stunningly detailed and scientifically accurate illustration of our sun, planets, and major moons. Made from high-quality, recycled cardboard with a glare-free finish, each piece is uniquely cut to ensure a perfect fit. It\'s not just a puzzle; it\'s an educational experience that provides hours of entertainment for space enthusiasts of all ages.',
      price: 24.50,
      category: 'Toys',
      images: [
          'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800',
      ],
      isNew: true,
      rating: 4.8,
      reviewsCount: 67,
  },
  {
      id: 6,
      name: 'Insulated Lunch Box',
      description: 'BPA-free insulated lunch box that keeps food fresh for hours. Easy to clean and carry.',
      longDescription: 'Keep your meals fresh and delicious with our Insulated Lunch Box. The high-density insulation and leak-proof liner work together to maintain the temperature of your food, whether you want it cold or warm. The spacious interior fits a variety of containers, while the exterior mesh pocket is perfect for a water bottle. Made from durable, BPA-free materials, it features a reinforced handle and a removable shoulder strap for easy carrying. The wipe-clean interior makes maintenance a breeze.',
      price: 18.00,
      category: 'School Items',
      images: [
          'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.5,
      reviewsCount: 156,
  },
  {
      id: 7,
      name: 'Leather Bound Journal',
      description: 'Handcrafted genuine leather journal with 200 pages of premium cream paper.',
      longDescription: 'Capture your thoughts and inspirations in our Handcrafted Leather Bound Journal. Each journal is made from genuine, top-grain leather that develops a beautiful patina over time. Inside, you\'ll find 200 pages of acid-free, cream-colored paper that is perfect for writing, sketching, or even light watercolor. The sturdy binding allows the journal to lay flat, providing a comfortable writing surface. It\'s a sophisticated and durable companion for your daily reflections or creative ideas.',
      price: 39.99,
      category: 'Stationary',
      images: [
          'https://images.unsplash.com/photo-1544816153-12ad5d7133a2?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.9,
      reviewsCount: 92,
  },
  {
      id: 8,
      name: 'Remote Control Robot',
      description: 'Programmable RC robot with voice control, dancing mode, and gesture sensing.',
      longDescription: 'Meet your new robotic friend! Our Remote Control Robot is packed with interactive features that will delight children and tech enthusiasts alike. Use the included remote or simple voice commands to make it walk, slide, and turn. It features a fun dancing mode with built-in music and gesture sensing technology that allows you to control its movements with your hands. You can even program a sequence of up to 50 actions for the robot to perform. It\'s a fun and engaging way to introduce children to the basics of robotics and programming.',
      price: 59.99,
      strikePrice: 79.99,
      category: 'Toys',
      images: [
          'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.7,
      reviewsCount: 112,
  },
  {
      id: 9,
      name: 'Sketchbook A4',
      description: 'Hardcover sketchbook with 100 sheets of 150gsm acid-free paper. Ideal for all dry media.',
      longDescription: 'Our Hardcover A4 Sketchbook is the perfect canvas for your artistic creations. It contains 100 sheets (200 pages) of 150gsm, acid-free paper that is specifically designed for dry media like pencil, charcoal, graphite, and pastels. The heavy-weight paper prevents bleed-through and can even handle light washes of ink. The durable hardcover protects your work, while the elegant black finish gives it a professional look. Whether you are a student or a professional artist, this sketchbook is an essential tool for your kit.',
      price: 14.99,
      category: 'Stationary',
      images: [
          'https://images.unsplash.com/photo-1544816153-12ad5d7133a2?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.8,
      reviewsCount: 78,
  },
  {
      id: 10,
      name: 'Plush Teddy Bear',
      description: 'Ultra-soft and cuddly 12-inch teddy bear. Made from premium hypoallergenic materials.',
      longDescription: 'Give the gift of comfort with our Ultra-Soft Plush Teddy Bear. Standing 12 inches tall, this classic bear is made from premium, hypoallergenic plush fabric that is incredibly soft to the touch. It\'s stuffed with high-quality, resilient filling that keeps its shape even after countless hugs. With its friendly embroidered face and soft, squishy paws, it\'s the perfect companion for children of all ages. It\'s also machine washable, making it easy to keep clean and fresh for years of love.',
      price: 15.00,
      category: 'Toys',
      images: [
          'https://images.unsplash.com/photo-1559440666-37443442d766?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.9,
      reviewsCount: 230,
  },
  {
      id: 11,
      name: 'Graphite Pencil Set',
      description: 'Set of 12 professional drawing pencils ranging from 8B to 4H. Includes a metal tin.',
      longDescription: 'Master the art of shading and sketching with our Professional Graphite Pencil Set. This collection includes 12 high-quality pencils in a full range of hardness, from the soft and dark 8B to the hard and light 4H. The leads are break-resistant and provide smooth, consistent lines. The set comes in a sleek, protective metal tin, keeping your pencils organized and easy to transport. Whether you are working on detailed technical drawings or expressive portraits, this set offers the precision and versatility required by serious artists.',
      price: 12.50,
      category: 'Stationary',
      images: [
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.7,
      reviewsCount: 54,
  },
  {
      id: 12,
      name: 'Kids Play Tent',
      description: 'Easy-to-assemble indoor/outdoor play tent. Stimulates imaginative play and provides a cozy space.',
      longDescription: 'Create a magical hideaway for your little ones with our Kids Play Tent. This lightweight and portable tent is incredibly easy to assemble, featuring a simple pop-up design or sturdy, easy-to-connect poles. It\'s perfect for indoor playrooms or sunny days in the backyard. The breathable fabric and mesh windows ensure good ventilation, while the tie-back door provides easy access. It\'s a wonderful space for reading, playing with toys, or letting their imaginations run wild. When playtime is over, it folds down compactly into its own carrying bag for easy storage.',
      price: 35.00,
      category: 'Toys',
      images: [
          'https://images.unsplash.com/photo-1560131113-90435970868a?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.6,
      reviewsCount: 89,
  }
];

export const categories = [
    { name: 'Stationary', description: 'High-quality pens, notebooks, and art supplies.', imageUrl: 'https://images.unsplash.com/photo-1585336261022-69c66d117f6e?auto=format&fit=crop&q=80&w=800', count: 124 },
    { name: 'Toys', description: 'Educational and fun toys for all ages.', imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800', count: 86 },
    { name: 'School Items', description: 'Backpacks, lunchboxes, and more for school.', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800', count: 210 },
];

export const orders: Order[] = [
  { 
    id: 'ORD-001', 
    customerName: 'Sarah J.', 
    date: '2024-08-01', 
    total: 125.50, 
    status: 'delivered', 
    items: [
      { productId: 1, productName: 'Premium Gel Pen Set', quantity: 2, price: 19.99 },
      { productId: 3, productName: 'Ergonomic School Backpack', quantity: 1, price: 45.00 }
    ] 
  },
  { 
    id: 'ORD-002', 
    customerName: 'Mark T.', 
    date: '2024-08-05', 
    total: 45.00, 
    status: 'shipped', 
    items: [
      { productId: 3, productName: 'Ergonomic School Backpack', quantity: 1, price: 45.00 }
    ] 
  },
  { 
    id: 'ORD-003', 
    customerName: 'Emily R.', 
    date: '2024-08-10', 
    total: 210.20, 
    status: 'processing', 
    items: [
      { productId: 2, productName: 'Wooden Building Blocks', quantity: 3, price: 34.99 },
      { productId: 5, productName: 'Solar System Puzzle', quantity: 2, price: 24.50 }
    ] 
  },
  { 
    id: 'ORD-004', 
    customerName: 'David L.', 
    date: '2024-08-12', 
    total: 89.99, 
    status: 'delivered', 
    items: [
      { productId: 8, productName: 'Remote Control Robot', quantity: 1, price: 59.99 },
      { productId: 4, productName: 'Watercolor Paint Set', quantity: 1, price: 29.99 }
    ] 
  },
  { 
    id: 'ORD-005', 
    customerName: 'Jessica M.', 
    date: '2024-08-15', 
    total: 34.50, 
    status: 'cancelled', 
    items: [
      { productId: 2, productName: 'Wooden Building Blocks', quantity: 1, price: 34.50 }
    ] 
  },
];

export const reviews: Review[] = [
  { id: 1, productId: 1, author: 'Sarah J.', rating: 5, date: '2024-07-15', comment: 'These pens are amazing! The colors are so vibrant and they write so smoothly. I use them for my bullet journal every day.' },
  { id: 2, productId: 1, author: 'Mark T.', rating: 4, date: '2024-07-20', comment: 'Great set of pens. A couple of them were a bit scratchy at first, but they seem to have broken in now. Good value for the price.' },
  { id: 3, productId: 2, author: 'Emily R.', rating: 5, date: '2024-07-22', comment: 'My son loves these blocks! They are very well made and the colors are beautiful. Great for building all sorts of things.' },
  { id: 4, productId: 3, author: 'David L.', rating: 5, date: '2024-07-25', comment: 'This backpack is very sturdy and has lots of pockets. My daughter says it\'s very comfortable to wear, even when it\'s full of books.' },
  { id: 5, productId: 3, author: 'Jessica M.', rating: 4, date: '2024-07-28', comment: 'Good quality backpack. The zippers seem a bit stiff, but hopefully they will loosen up with use. Overall, I\'m happy with the purchase.' },
  { id: 6, productId: 1, author: 'Alex B.', rating: 5, date: '2024-08-01', comment: 'Best gel pens I\'ve ever used. No smudging at all, which is great because I\'m left-handed!' },
  { id: 7, productId: 2, author: 'Chris K.', rating: 4, date: '2024-08-03', comment: 'Nice set of blocks. I wish there were a few more of the larger pieces, but my kids still have fun with them.' },
  { id: 8, productId: 5, author: 'Space Enthusiast', rating: 5, date: '2024-07-10', comment: 'This puzzle is challenging but so rewarding! The image is beautiful and the pieces fit together perfectly. Highly recommend for any space lover.' },
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
        titleKey: T.Pages.Cookies.CategoryRequired,
        descriptionKey: T.Pages.Cookies.CategoryRequiredDesc,
        isMutable: false,
    },
    {
        id: 'analytics',
        titleKey: T.Pages.Cookies.CategoryAnalytics,
        descriptionKey: T.Pages.Cookies.CategoryAnalyticsDesc,
        isMutable: true,
    },
    {
        id: 'marketing',
        titleKey: T.Pages.Cookies.CategoryMarketing ,
        descriptionKey: T.Pages.Cookies.CategoryMarketingDesc ,
        isMutable: true,
    },
];

export const faqData = [
    {
        questionKey: T.Pages.Faq.Q1,
        answerKey: T.Pages.Faq.A1,
    },
    {
        questionKey: T.Pages.Faq.Q2,
        answerKey: T.Pages.Faq.A2,
    },
    {
        questionKey: T.Pages.Faq.Q3,
        answerKey: T.Pages.Faq.A3,
    },
    {
        questionKey: T.Pages.Faq.Q4,
        answerKey: T.Pages.Faq.A4,
    },
];
