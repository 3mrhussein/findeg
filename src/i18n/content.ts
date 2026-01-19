/**
 * Single Source of Truth for Translations.
 * This file contains all static content for the application in both English and Arabic.
 * It also automatically generates UPPERCASE constants for type-safe usage in components.
 */

export const DICTIONARY = {
  COMMON: {
    LOGO_ARIA_LABEL: { en: 'FindEg.com Homepage', ar: 'FindEg.com الصفحة الرئيسية' },
    DISCOUNT_BADGE: { en: '{percent}% OFF', ar: 'خصم {percent}%' },
    LOADING: { en: 'Loading...', ar: 'جاري التحميل...' },
    ERROR_OCCURRED: { en: 'An error occurred. Please try again.', ar: 'حدث خطأ. يرجى المحاولة مرة أخرى.' },
    SAVE: { en: 'Save', ar: 'حفظ' },
    CANCEL: { en: 'Cancel', ar: 'إلغاء' },
    SUBMIT: { en: 'Submit', ar: 'إرسال' },
  },
  NAV: {
    HOME: { en: 'Home', ar: 'الرئيسية' },
    SHOP: { en: 'Shop', ar: 'تسوق' },
    CATEGORIES: { en: 'Categories', ar: 'الفئات' },
    ABOUT: { en: 'About Us', ar: 'من نحن' },
    MY_ACCOUNT: { en: 'My Account', ar: 'حسابي' },
    DASHBOARD: { en: 'Dashboard', ar: 'لوحة التحكم' },
    SEARCH_PLACEHOLDER: { en: 'Search for products...', ar: 'ابحث عن المنتجات...' },
    AI_GENERATOR: { en: 'AI Generator', ar: 'مولد الصور' },
    STATIONARY: {
      TITLE: { en: 'Stationary', ar: 'أدوات مكتبية' },
      PENS: { en: 'Pens & Writing', ar: 'الأقلام والكتابة' },
      GEL_PENS: { en: 'Gel Pens', ar: 'أقلام جل' },
      BALLPOINT: { en: 'Ballpoint Pens', ar: 'أقلام حبر جاف' },
      NOTEBOOKS: { en: 'Notebooks', ar: 'دفاتر' },
      ART_SUPPLIES: { en: 'Art Supplies', ar: 'أدوات فنية' },
    },
    TOYS: {
      TITLE: { en: 'Toys & Games', ar: 'ألعاب ومسابقات' },
      EDUCATIONAL: { en: 'Educational', ar: 'تعليمية' },
      BLOCKS: { en: 'Building Blocks', ar: 'مكعبات بناء' },
      PUZZLES: { en: 'Puzzles', ar: 'ألعاب الألغاز' },
      JIGSAW: { en: 'Jigsaw Puzzles', ar: 'ألغاز الصور' },
      THREE_D: { en: '3D Puzzles', ar: 'ألغاز ثلاثية الأبعاد' },
    },
    SCHOOL: {
      TITLE: { en: 'School Items', ar: 'اللوازم المدرسية' },
      BACKPACKS: { en: 'Backpacks', ar: 'حقائب ظهر' },
      ERGONOMIC: { en: 'Ergonomic', ar: 'مريحة للظهر' },
      THEMED: { en: 'Themed', ar: 'ذات طابع خاص' },
      LUNCHBOXES: { en: 'Lunch Boxes', ar: 'حقائب غذاء' },
    }
  },
  LAYOUT: {
    HEADER: {
      CART_BUTTON: { en: 'Open shopping cart', ar: 'فتح عربة التسوق' },
      SIGNIN_BUTTON: { en: 'Sign In', ar: 'تسجيل الدخول' },
      SIGNUP_BUTTON: { en: 'Sign Up', ar: 'إنشاء حساب' },
    },
    NAV: {
      HOME: { en: 'Home', ar: 'الرئيسية' },
      SHOP: { en: 'Shop', ar: 'تسوق' },
      CATEGORIES: { en: 'Categories', ar: 'الفئات' },
      AI_GENERATOR: { en: 'AI Generator', ar: 'مولد الصور' },
      ABOUT: { en: 'About', ar: 'حولنا' },
      MY_ACCOUNT: { en: 'My Account', ar: 'حسابي' },
      DASHBOARD: { en: 'Dashboard', ar: 'لوحة التحكم' },
      BRAND_KIT: { en: 'Brand Kit', ar: 'هوية العلامة التجارية' },
    },
    FOOTER: {
      TAGLINE: { en: 'Everything for learning & play, delivered to your door.', ar: 'كل شيء للتعلم واللعب، يتم توصيله إلى باب منزلك.' },
      SHOP_TITLE: { en: 'Shop', ar: 'تسوق' },
      ABOUT_TITLE: { en: 'About', ar: 'حولنا' },
      ABOUT_STORY: { en: 'Our Story', ar: 'قصتنا' },
      ABOUT_CAREERS: { en: 'Careers', ar: 'وظائف' },
      ABOUT_CONTACT: { en: 'Contact Us', ar: 'اتصل بنا' },
      FOLLOW_TITLE: { en: 'Follow Us', ar: 'تابعنا' },
      COOKIE_SETTINGS: { en: 'Cookie Settings', ar: 'إعدادات ملفات تعريف الارتباط' },
      COPYRIGHT: { en: 'All rights reserved.', ar: 'كل الحقوق محفوظة.' },
    },
    ANNOUNCEMENT: {
      BAR_TEXT: { en: 'Free shipping on orders over $50! 🎉', ar: 'شحن مجاني للطلبات التي تزيد عن 200 جنيه! 🎉' },
      BAR_CLOSE: { en: 'Close announcement', ar: 'إغلاق الإعلان' },
    }
  },
  PAGES: {
    HOME: {
      HERO: {
        TITLE_PART1: { en: 'Find Everything for', ar: 'اعثر على كل شيء' },
        TITLE_LEARNING: { en: 'Learning', ar: 'للتعلم' },
        TITLE_PLAY: { en: 'Play', ar: 'واللعب' },
        SUBTITLE: { 
          en: "Your one-stop shop for high-quality stationary, engaging kids' toys, and essential school supplies. Spark creativity and make learning fun!", 
          ar: 'متجرك الشامل للأدوات المكتبية عالية الجودة وألعاب الأطفال الجذابة واللوازم المدرسية الأساسية. أطلق العنان للإبداع واجعل التعلم ممتعًا!' 
        },
        BUTTON_SHOP: { en: 'Shop Now', ar: 'تسوق الآن' },
        BUTTON_EXPLORE: { en: 'Explore Categories', ar: 'استكشف الفئات' },
      },
      FEATURED: {
        TITLE: { en: 'Featured Products', ar: 'المنتجات المميزة' },
        SUBTITLE: { en: 'Handpicked essentials for creativity and learning. Discover our most popular items.', ar: 'أساسيات منتقاة بعناية للإبداع والتعلم. اكتشف منتجاتنا الأكثر شهرة.' },
      },
      CATEGORIES: {
        TITLE: { en: 'Shop by Category', ar: 'تسوق حسب الفئة' },
        SUBTITLE: { en: 'Find exactly what you need by exploring our curated categories.', ar: 'ابحث عما تحتاجه بالضبط من خلال استكشاف فئاتنا المنسقة.' },
      },
      GENERATOR: {
        TITLE: { en: 'AI Product Idea Generator', ar: 'مولد أفكار المنتجات بالذكاء الاصطناعي' },
        SUBTITLE: { en: "Can't find what you're for? Describe a toy or stationary item, and let our AI bring your idea to life!", ar: 'لا تستطيع العثور على ما تبحث عنه؟ صف لعبة أو أداة مكتبية، ودع الذكاء الاصطناعي لدينا يحقق فكرتك!' },
        PLACEHOLDER: { en: 'e.g., A friendly robot holding a red skateboard', ar: 'مثال: روبوت ودود يحمل لوح تزلج أحمر' },
        BUTTON_GENERATE: { en: 'Generate', ar: 'إنشاء' },
        BUTTON_LOADING: { en: 'Generating...', ar: 'جاري الإنشاء...' },
        ERROR_PROMPT: { en: 'Please enter a description for the image.', ar: 'الرجاء إدخال وصف للصورة.' },
        ERROR_FAILED: { en: 'Failed to generate image. Please try again.', ar: 'فشل في إنشاء الصورة. الرجاء المحاولة مرة أخرى.' },
        RESULT_TITLE: { en: 'Your AI-Generated Creation!', ar: 'إبداعك الذي تم إنشاؤه بواسطة الذكاء الاصطناعي!' },
        RESULT_ALT: { en: 'Generated by AI', ar: 'تم إنشاؤها بواسطة الذكاء الاصطناعي' },
      }
    },
    SHOP: {
      TITLE: { en: 'Explore Our Collection', ar: 'اكتشف مجموعتنا' },
      FILTERS_TITLE: { en: 'Filters', ar: 'الفلاتر' },
      FILTERS_CATEGORIES: { en: 'Categories', ar: 'الفئات' },
      FILTERS_PRICE: { en: 'Price Range', ar: 'نطاق السعر' },
      FILTERS_COLOR: { en: 'Color', ar: 'اللون' },
      SORT_BY: { en: 'Sort by', ar: 'ترتيب حسب' },
      SORT_FEATURED: { en: 'Featured', ar: 'المميزة' },
      SORT_NEWEST: { en: 'Newest', ar: 'الأحدث' },
      SORT_PRICE_ASC: { en: 'Price: Low to High', ar: 'السعر: من الأقل إلى الأعلى' },
      SORT_PRICE_DESC: { en: 'Price: High to Low', ar: 'السعر: من الأعلى إلى الأقل' },
      SHOWING_RESULTS: { en: 'Showing {count} of {total} results', ar: 'عرض {count} من {total} نتيجة' },
      NO_PRODUCTS: { en: 'No products found matching your criteria.', ar: 'لم يتم العثور على منتجات تطابق معاييرك.' },
      VIEW_RESULTS: { en: 'View Results', ar: 'عرض النتائج' },
      PAGINATION_PREVIOUS: { en: 'Previous', ar: 'السابق' },
      PAGINATION_NEXT: { en: 'Next', ar: 'التالي' },
      FAQ_TITLE: { en: 'Frequently Asked Questions', ar: 'الأسئلة الشائعة' },
    },
    FAQ: {
      Q1: { en: 'How long does shipping take?', ar: 'كم يستغرق الشحن؟' },
      A1: { en: 'Shipping usually takes 3-5 business days within the country.', ar: 'يستغرق الشحن عادةً من 3 إلى 5 أيام عمل داخل البلاد.' },
      Q2: { en: 'What is your return policy?', ar: 'ما هي سياسة الإرجاع الخاصة بكم؟' },
      A2: { en: 'We offer a 30-day return policy for unused items in their original packaging.', ar: 'نحن نقدم سياسة إرجاع لمدة 30 يومًا للمنتجات غير المستخدمة في عبوتها الأصلية.' },
      Q3: { en: 'Do you offer international shipping?', ar: 'هل تقدمون الشحن الدولي؟' },
      A3: { en: 'Currently, we only ship within the country, but we are working on expanding!', ar: 'حالياً، نشحن فقط داخل البلاد، لكننا نعمل على التوسع!' },
      Q4: { en: 'How can I track my order?', ar: 'كيف يمكنني تتبع طلبي؟' },
      A4: { en: 'Once your order is shipped, you will receive an email with a tracking number.', ar: 'بمجرد شحن طلبك، ستتلقى بريداً إلكترونياً يحتوي على رقم التتبع.' },
    },
    PRODUCT_DETAIL: {
      ADD_TO_CART: { en: 'Add to Cart', ar: 'أضف إلى السلة' },
      QUANTITY: { en: 'Quantity', ar: 'الكمية' },
      DESCRIPTION: { en: 'Description', ar: 'الوصف' },
      REVIEWS: { en: 'Customer Reviews', ar: 'مراجعات العملاء' },
      NO_REVIEWS: { en: 'No reviews yet.', ar: 'لا توجد مراجعات بعد.' },
      OUT_OF_STOCK: { en: 'Out of Stock', ar: 'نفذ من المخزون' },
      RECOMMENDED_ITEMS: { en: 'You Might Also Like', ar: 'قد يعجبك أيضاً' },
      NAV_DESCRIPTION: { en: 'Description', ar: 'الوصف' },
      NAV_REVIEWS: { en: 'Reviews', ar: 'المراجعات' },
      NAV_RECOMMENDED: { en: 'Recommended', ar: 'منتجات مقترحة' },
      BASED_ON_REVIEWS: { en: 'Based on {count} reviews', ar: 'بناءً على {count} مراجعات' },
      WRITE_REVIEW: { en: 'Write a review', ar: 'اكتب مراجعة' },
      REVIEW_FORM: {
        NAME: { en: 'Your Name', ar: 'اسمك' },
        RATING: { en: 'Rating', ar: 'التقييم' },
        COMMENT: { en: 'Your Comment', ar: 'تعليقك' },
        SUBMIT: { en: 'Submit Review', ar: 'إرسال التقييم' },
        SUCCESS: { en: 'Thank you for your review!', ar: 'شكراً لك على تقييمك!' },
      },
      NOT_FOUND: { en: 'Product not found.', ar: 'المنتج غير موجود.' },
      BACK_TO_SHOP: { en: 'Back to Shop', ar: 'العودة إلى المتجر' },
    },
    PRODUCT_CARD: {
      LIKE: { en: 'Like', ar: 'إعجاب' },
      SAVE: { en: 'Save', ar: 'حفظ' },
      ADD_TO_CART: { en: 'Add to Cart', ar: 'أضف إلى السلة' },
    },
    CART: {
      TITLE: { en: 'Your Shopping Cart', ar: 'عربة التسوق الخاصة بك' },
      EMPTY: { en: 'Your cart is empty.', ar: 'عربة التسوق فارغة.' },
      SUBTOTAL: { en: 'Subtotal', ar: 'المجموع الفرعي' },
      CHECKOUT: { en: 'Proceed to Checkout', ar: 'الانتقال إلى الدفع' },
      REMOVE_ITEM: { en: 'Remove item', ar: 'إزالة المنتج' },
    },
    CHECKOUT: {
      TITLE: { en: 'Checkout', ar: 'الدفع' },
      STEP1: { en: 'Shipping', ar: 'الشحن' },
      STEP2: { en: 'Payment', ar: 'الدفع' },
      STEP3: { en: 'Review', ar: 'مراجعة' },
      SHIPPING_INFO: { en: 'Shipping Information', ar: 'معلومات الشحن' },
      CONTINUE_PAYMENT: { en: 'Continue to Payment', ar: 'متابعة إلى الدفع' },
      PLACE_ORDER: { en: 'Place Order', ar: 'إتمام الطلب' },
      FIRST_NAME: { en: 'First Name', ar: 'الاسم الأول' },
      LAST_NAME: { en: 'Last Name', ar: 'اسم العائلة' },
      EMAIL: { en: 'Email Address', ar: 'البريد الإلكتروني' },
      ADDRESS: { en: 'Address', ar: 'العنوان' },
      CITY: { en: 'City', ar: 'المدينة' },
      POSTAL_CODE: { en: 'Postal Code', ar: 'الرمز البريدي' },
      ORDER_SUMMARY: { en: 'Order Summary', ar: 'ملخص الطلب' },
      TOTAL: { en: 'Total', ar: 'المجموع' },
    },
    AUTH: {
      REGISTRATION_TITLE: { en: 'Create an Account', ar: 'إنشاء حساب' },
      LOGIN_TITLE: { en: 'Sign In to Your Account', ar: 'تسجيل الدخول إلى حسابك' },
      NAME: { en: 'Full Name', ar: 'الاسم الكامل' },
      EMAIL: { en: 'Email Address', ar: 'البريد الإلكتروني' },
      PASSWORD: { en: 'Password', ar: 'كلمة المرور' },
      BUTTON_REGISTER: { en: 'Create Account', ar: 'إنشاء حساب' },
      BUTTON_LOGIN: { en: 'Sign In', ar: 'تسجيل الدخول' },
      SOCIAL_PROMPT: { en: 'Or sign up with', ar: 'أو سجل باستخدام' },
      SOCIAL_PROMPT_LOGIN: { en: 'Or sign in with', ar: 'أو سجل الدخول باستخدام' },
      HAVE_ACCOUNT: { en: 'Already have an account?', ar: 'هل لديك حساب بالفعل؟' },
      NO_ACCOUNT: { en: "Don't have an account?", ar: 'ليس لديك حساب؟' },
      SIGNIN_LINK: { en: 'Sign In', ar: 'تسجيل الدخول' },
      SIGNUP_LINK: { en: 'Sign Up', ar: 'إنشاء حساب' },
    },
    ABOUT: {
      HERO_TITLE: { en: 'Sparking Joy in Learning & Play', ar: 'إشعال الفرح في التعلم واللعب' },
      HERO_SUBTITLE: { 
        en: "We believe that the best tools for growth are the ones that blend education with imagination. At FindEg.com, we're passionate about curating high-quality products that inspire creativity in children and students alike.", 
        ar: 'نحن نؤمن بأن أفضل أدوات النمو هي تلك التي تمزج التعليم بالخيال. في FindEg.com، نحن متحمسون لتقديم منتجات عالية الجودة تلهم الإبداع لدى الأطفال والطلاب على حد سواء.' 
      },
      STORY_TITLE: { en: 'Our Story', ar: 'قصتنا' },
      STORY_P1: { 
        en: "Founded by a team of parents and educators, FindEg.com started with a simple idea: to make finding the right educational and creative supplies easier for everyone. We were tired of searching through endless options online, never quite sure of the quality or educational value.", 
        ar: 'تأسست FindEg.com على يد فريق من الآباء والمعلمين، وبدأت بفكرة بسيطة: تسهيل العثور على اللوازم التعليمية والإبداعية المناسبة للجميع. لقد سئمنا من البحث في خيارات لا نهاية لها عبر الإنترنت، دون التأكد من الجودة أو القيمة التعليمية.' 
      },
      STORY_P2: { 
        en: 'We decided to build the store we always wanted. A place where every item is handpicked for its ability to engage, educate, and endure. From the smoothest gel pens to the most imaginative building blocks, our catalog is a celebration of quality and creativity.', 
        ar: 'قررنا بناء المتجر الذي طالما أردناه. مكان يتم فيه اختيار كل منتج بعناية لقدرته على المشاركة والتعليم والتحمل. من أنعم أقلام الجل إلى أكثر مكعبات البناء إبداعًا، يعد كتالوجنا احتفالًا بالجودة والإبداع.' 
      },
      MISSION_TITLE: { en: 'Our Mission', ar: 'مهمتنا' },
      MISSION_TEXT: { en: 'To provide families and educators with a trusted source for supplies that foster creativity, critical thinking, and a lifelong love of learning.', ar: 'تزويد العائلات والمعلمين بمصدر موثوق للمستلزمات التي تعزز الإبداع والتفكير النقدي وحب التعلم مدى الحياة.' },
      VALUES_TITLE: { en: 'Our Values', ar: 'قيمنا' },
      VALUE_QUALITY: { en: 'Quality', ar: 'الجودة' },
      VALUE_QUALITY_TEXT: { en: 'We stand by the durability and safety of our products.', ar: 'نحن نضمن متانة وسلامة منتجاتنا.' },
      VALUE_CREATIVITY: { en: 'Creativity', ar: 'الإبداع' },
      VALUE_CREATIVITY_TEXT: { en: 'We champion products that unlock imagination.', ar: 'ندعم المنتجات التي تطلق العنان للخيال.' },
      VALUE_LEARNING: { en: 'Learning', ar: 'التعلم' },
      VALUE_LEARNING_TEXT: { en: "Every item has a purpose in a child's development.", ar: 'كل عنصر له هدف في تنمية الطفل.' },
      BRAND_SHOWCASE_TITLE: { en: 'Trusted by Leading Brands', ar: 'موثوق به من قبل العلامات التجارية الرائدة' },
    },
    CONTACT: {
      TITLE: { en: 'Get in Touch', ar: 'تواصل معنا' },
      SUBTITLE: { en: "Have a question or feedback? We'd love to hear from you! Reach out to us through the form below or using our contact details.", ar: 'هل لديك سؤال أو ملاحظات؟ نود أن نسمع منك! تواصل معنا من خلال النموذج أدناه أو باستخدام تفاصيل الاتصال الخاصة بنا.' },
      INFO_TITLE: { en: 'Contact Information', ar: 'معلومات الاتصال' },
      FORM_TITLE: { en: 'Send us a Message', ar: 'أرسل لنا رسالة' },
      FORM_NAME: { en: 'Your Name', ar: 'اسمك' },
      FORM_EMAIL: { en: 'Your Email', ar: 'بريدك الإلكتروني' },
      FORM_SUBJECT: { en: 'Subject', ar: 'الموضوع' },
      FORM_MESSAGE: { en: 'Your Message', ar: 'رسالتك' },
      FORM_SEND: { en: 'Send Message', ar: 'إرسال الرسالة' },
      INFO_EMAIL: { en: 'support@findeg.com', ar: 'support@findeg.com' },
      INFO_PHONE: { en: '+1 (555) 123-4567', ar: '+1 (555) 123-4567' },
      INFO_ADDRESS: { en: '123 Creativity Lane, Imagination City, 12345', ar: '123 شارع الإبداع، مدينة الخيال، 12345' },
    },
    SEARCH: {
      PLACEHOLDER: { en: 'Search for products...', ar: 'ابحث عن منتجات...' },
      PAGE_TITLE: { en: 'Search Results for "{query}"', ar: 'نتائج البحث عن "{query}"' },
      NO_RESULTS: { en: 'No products found for your search.', ar: 'لم يتم العثور على منتجات لبحثك.' },
      EMPTY_PROMPT: { en: 'Please enter a search term', ar: 'يرجى إدخال مصطلح للبحث' },
    },
    COOKIES: {
      CONSENT_TITLE: { en: 'We value your privacy', ar: 'نحن نقدر خصوصيتك' },
      CONSENT_TEXT: { en: 'We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.', ar: 'نحن نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح الخاصة بك، وتقديم إعلانات أو محتوى مخصص، وتحليل حركة المرور لدينا.' },
      CONSENT_ACCEPT: { en: 'Accept All', ar: 'قبول الكل' },
      CONSENT_REJECT: { en: 'Reject All', ar: 'رفض الكل' },
      CONSENT_SETTINGS_BTN: { en: 'Settings', ar: 'إعدادات' },
      SETTINGS_TITLE: { en: 'Cookie Preferences', ar: 'تفضيلات ملفات تعريف الارتباط' },
      SETTINGS_DESCRIPTION: { en: 'Manage your cookie settings. You can enable or disable different types of cookies below. Changes will be saved when you press the button.', ar: 'إدارة إعدادات ملفات تعريف الارتباط الخاصة بك. يمكنك تمكين أو تعطيل أنواع مختلفة من ملفات تعريف الارتباط أدناه. سيتم حفظ التغييرات عند الضغط على الزر.' },
      SETTINGS_SAVE: { en: 'Save Preferences', ar: 'حفظ التفضيلات' },
      CATEGORY_REQUIRED: { en: 'Strictly Necessary', ar: 'ضرورية للغاية' },
      CATEGORY_REQUIRED_DESC: { en: 'These cookies are essential for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.', ar: 'هذه الملفات ضرورية لعمل الموقع ولا يمكن إيقاف تشغيلها. يتم تعيينها عادةً فقط استجابةً للإجراءات التي تقوم بها والتي تصل إلى طلب خدمات، مثل تعيين تفضيلات الخصوصية أو تسجيل الدخول أو ملء النماذج.' },
      CATEGORY_ANALYTICS: { en: 'Analytics Cookies', ar: 'ملفات تعريف الارتباط التحليلية' },
      CATEGORY_ANALYTICS_DESC: { en: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.', ar: 'تسمح لنا هذه الملفات بحساب الزيارات ومصادر حركة المرور حتى نتمكن من قياس أداء موقعنا وتحسينه. تساعدنا في معرفة الصفحات الأكثر والأقل شيوعًا ومعرفة كيفية تحرك الزوار في الموقع.' },
      CATEGORY_MARKETING: { en: 'Marketing Cookies', ar: 'ملفات تعريف الارتباط التسويقية' },
      CATEGORY_MARKETING_DESC: { en: 'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.', ar: 'قد يتم تعيين هذه الملفات عبر موقعنا من قبل شركائنا الإعلانيين. قد تستخدمها تلك الشركات لبناء ملف تعريف لاهتماماتك وعرض إعلانات ذات صلة على مواقع أخرى.' },
      ENABLED: { en: 'Enabled', ar: 'مفعل' },
    },
    CHATBOT: {
      TITLE: { en: 'Chat with us', ar: 'تحدث معنا' },
      PLACEHOLDER: { en: 'Type your message...', ar: 'اكتب رسالتك...' },
      SEND: { en: 'Send', ar: 'إرسال' },
      GREETING: { en: 'Hello! How can we help you today?', ar: 'مرحباً! كيف يمكننا مساعدتك اليوم؟' },
    },
    MY_ACCOUNT: {
      LOGOUT: { en: 'Logout', ar: 'تسجيل الخروج' },
      TITLE: { en: 'My Account', ar: 'حسابي' },
      WELCOME: { en: 'Welcome back, {name}!', ar: 'مرحباً بعودتك، {name}!' },
      PROFILE: { en: 'Profile', ar: 'الملف الشخصي' },
      ORDERS: { en: 'Order History', ar: 'تاريخ الطلبات' },
      WISHLIST: { en: 'My Wishlist', ar: 'قائمة أمنياتي' },
      NO_ORDERS: { en: "You haven't placed any orders yet.", ar: 'لم تقم بأي طلبات بعد.' },
      NO_WISHLIST: { en: 'Your wishlist is empty. Start adding some products!', ar: 'قائمة أمنياتك فارغة. ابدأ في إضافة بعض المنتجات!' },
      ORDER_ID: { en: 'Order ID', ar: 'رقم الطلب' },
      ORDER_DATE: { en: 'Date', ar: 'التاريخ' },
      ORDER_TOTAL: { en: 'Total', ar: 'المجموع' },
      ORDER_STATUS: { en: 'Status', ar: 'الحالة' },
      PLEASE_LOGIN: { en: 'Please log in to view your account.', ar: 'يرجى تسجيل الدخول لعرض حسابك.' },
      SIGN_IN: { en: 'Sign In', ar: 'تسجيل الدخول' },
      NAME_LABEL: { en: 'Name', ar: 'الاسم' },
      EMAIL_LABEL: { en: 'Email', ar: 'البريد الإلكتروني' },
    },
    BRAND_KIT: {
      TITLE: { en: "Our Brand Identity", ar: 'هويتنا التجارية' },
      SUBTITLE: { en: "The core elements that define the look and feel of FindEg.com.", ar: 'العناصر الأساسية التي تحدد شكل ومظهر FindEg.com.' },
      LOGO_TITLE: { en: "Logo", ar: 'الشعار' },
      COLORS_TITLE: { en: "Color Palette", ar: 'لوحة الألوان' },
      TYPOGRAPHY_TITLE: { en: "Typography", ar: 'الخطوط' },
      COMPONENTS_TITLE: { en: "Component Showcase", ar: 'استعراض المكونات' },
    },
    DASHBOARD: {
      TITLE: { en: 'Dashboard', ar: 'لوحة التحكم' },
      OVERVIEW: { en: 'Overview', ar: 'نظرة عامة' },
      PRODUCTS: { en: 'Products', ar: 'المنتجات' },
      ORDERS: { en: 'Orders', ar: 'الطلبات' },
      CUSTOMERS: { en: 'Customers', ar: 'العملاء' },
      CUSTOMERS_COMING_SOON: { en: 'Customer management feature coming soon.', ar: 'ميزة إدارة العملاء ستتوفر قريباً.' },
      TOTAL_REVENUE: { en: 'Total Revenue', ar: 'إجمالي الإيرادات' },
      TOTAL_ORDERS: { en: 'Total Orders', ar: 'إجمالي الطلبات' },
      TOTAL_PRODUCTS: { en: 'Total Products', ar: 'إجمالي المنتجات' },
      TOTAL_CUSTOMERS: { en: 'Total Customers', ar: 'إجمالي العملاء' },
      MONTHLY_SALES: { en: 'Monthly Sales Overview', ar: 'نظرة عامة على المبيعات الشهرية' },
      WEEKLY_ACTIVITY: { en: 'Weekly User Activity', ar: 'نشاط المستخدمين الأسبوعي' },
      DEVICE_USAGE: { en: 'Device Usage', ar: 'استخدام الأجهزة' },
      RECENT_ORDERS: { en: 'Recent Orders', ar: 'الطلبات الأخيرة' },
      PRODUCT_LIST: { en: 'Product List', ar: 'قائمة المنتجات' },
      ADD_PRODUCT: { en: 'Add Product', ar: 'إضافة منتج' },
      ORDER_LIST: { en: 'Order List', ar: 'قائمة الطلبات' },
      EXPAND_SIDEBAR: { en: 'Expand sidebar', ar: 'توسيع الشريط الجانبي' },
      COLLAPSE_SIDEBAR: { en: 'Collapse sidebar', ar: 'طي الشريط الجانبي' },
      TABLE: {
        PRODUCT_NAME: { en: 'Product Name', ar: 'اسم المنتج' },
        CATEGORY: { en: 'Category', ar: 'الفئة' },
        PRICE: { en: 'Price', ar: 'السعر' },
        STOCK: { en: 'Stock', ar: 'المخزون' },
        ACTIONS: { en: 'Actions', ar: 'الإجراءات' },
        ORDER_ID: { en: 'Order ID', ar: 'رقم الطلب' },
        CUSTOMER: { en: 'Customer', ar: 'العميل' },
        DATE: { en: 'Date', ar: 'التاريخ' },
        TOTAL: { en: 'Total', ar: 'المجموع' },
        STATUS: { en: 'Status', ar: 'الحالة' },
      }
    },
    ERROR: {
      PAGE_TITLE: { en: '404 - Page Not Found', ar: '404 - الصفحة غير موجودة' },
      PAGE_SUBTITLE: { en: 'Oops! The page you are looking for does not exist. It might have been moved or deleted.', ar: 'عفوًا! الصفحة التي تبحث عنها غير موجودة. ربما تم نقلها أو حذفها.' },
      BUTTON: { en: 'Go Back Home', ar: 'العودة إلى الصفحة الرئيسية' },
    }
  }
} as const;

// --- AUTO-GENERATION LOGIC FOR TYPE-SAFETY ---

type DeepKeyMap<T, P extends string = ""> = {
  [K in keyof T]: T[K] extends { en: any; ar: any }
    ? (P extends "" ? K : `${P}.${string & K}`)
    : DeepKeyMap<T[K], P extends "" ? string & K : `${P}.${string & K}`>;
};

function generatePaths<T>(obj: T, prefix = ""): DeepKeyMap<T> {
  const res: any = {};
  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = (obj as any)[key];

    if (value && typeof value === 'object' && 'en' in value && 'ar' in value) {
      res[key] = path;
    } else {
      res[key] = generatePaths(value, path);
    }
  }
  return res as DeepKeyMap<T>;
}

/**
 * 💎 T is your UPPERCASE constant for use in components.
 * Use it like: t(T.COMMON.SAVE)
 */
export const T = generatePaths(DICTIONARY);

/**
 * Helper used by next-intl to load messages for a specific locale.
 */
export function getLocaleMessages(locale: string) {
  const targetLocale = (['en', 'ar'].includes(locale) ? locale : 'en') as 'en' | 'ar';
  
  const extract = (obj: any): any => {
    const res: any = {};
    for (const key in obj) {
      if (obj[key] && (obj[key].en || obj[key].ar)) {
        // Fallback sequence: requested locale -> English -> Arabic
        res[key] = obj[key][targetLocale] || obj[key].en || obj[key].ar;
      } else if (obj[key] && typeof obj[key] === 'object') {
        res[key] = extract(obj[key]);
      }
    }
    return res;
  };
  return extract(DICTIONARY);
}
