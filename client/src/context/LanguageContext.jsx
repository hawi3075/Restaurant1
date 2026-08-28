import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Full UI dictionary. Keys are used via t('key').
 * Also supports t('English text') by matching against English values.
 */
const translations = {
  en: {
    home: 'Home',
    categories: 'Categories',
    restaurants: 'Restaurants',
    menu: 'Menu',
    about: 'About',
    contact: 'Contact',
    profile: 'Profile',
    myAddress: 'My Address',
    myOrders: 'My Orders',
    language: 'Language',
    helpSupport: 'Help & Support',
    liveChat: 'Live Chat',
    logout: 'Logout',
    whyStayHungry: 'Why stay Hungry!',
    tasteOfHome: 'Taste of Home, Delivered Fast',
    orderNow: 'Order Now',
    exploreMenu: 'Explore Menu',
    popularDishes: 'Popular Dishes',
    topRestaurants: 'Top Restaurants',
    viewAll: 'View All',
    seeMore: 'See More',
    addToCart: 'Add to Cart',
    addedToCartSuccessfully: 'added to cart successfully!',
    cart: 'Cart',
    checkout: 'Checkout',
    search: 'Search',
    loading: 'Loading...',
    noItemsFound: 'No items found',
    delivery: 'Delivery',
    dineIn: 'Dine In',
    fastDelivery: 'Fast Delivery',
    securePayment: 'Secure Payment',
    chooseLanguage: 'Choose Language',
    selectPreferredLanguage: 'Select your preferred language',
    themePreference: 'Theme Preference',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    brightAndClear: 'Bright and clear',
    easyOnEyes: 'Easy on the eyes',
    active: 'Active',
    aboutUs: 'About Us',
    getInTouch: 'Get in Touch',
    ourStory: 'Our Story',
    featuredCategories: 'Featured Categories',
    specialOffers: 'Special Offers',
    howItWorks: 'How It Works',
    footerRights: 'All rights reserved',
    // Detail / common
    backToHome: 'Back to Home',
    backToRestaurants: 'Back to Restaurants',
    backTo: 'Back to',
    open: 'Open',
    closed: 'Closed',
    openNow: 'Open Now',
    popularChoice: 'Popular Choice',
    currentlyUnavailable: 'Currently Unavailable',
    unavailable: 'Unavailable',
    foodNotFound: 'Food Item Not Found',
    restaurantNotFound: 'Restaurant Not Found',
    quantity: 'Quantity',
    addons: 'Add-ons',
    specialInstructions: 'Special Instructions',
    specialInstructionsPlaceholder: 'Any special requests? (e.g., less spicy, no onions)',
    reviews: 'Reviews',
    noReviewsYet: 'No reviews yet',
    total: 'Total',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    discount: 'Discount',
    shoppingCart: 'Shopping Cart',
    cartEmpty: 'Your Cart is Empty',
    cartEmptyHint: "Looks like you haven't added any items to your cart yet.",
    startShopping: 'Start Shopping',
    continueShopping: 'Continue Shopping',
    clearCart: 'Clear Cart',
    itemsInCart: 'item(s) in your cart',
    proceedToCheckout: 'Proceed to Checkout',
    orderSummary: 'Order Summary',
    placeOrder: 'Place Order',
    selectAddress: 'Select Delivery Address',
    addNewAddress: 'Add New Address',
    addNew: '+ Add New',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    update: 'Update',
    confirm: 'Confirm',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    orderNotes: 'Order Notes',
    orderNotesPlaceholder: 'Any special requests for your order?',
    discoverRestaurants: 'Discover Amazing Restaurants',
    discoverRestaurantsHint: 'Browse through our curated list of top restaurants and find your next favorite meal',
    searchRestaurants: 'Search restaurants by name or location...',
    searchByCategory: 'Search by category...',
    discoverMealsHint: 'Discover delicious meals and order your favorite cravings instantly.',
    all: 'All',
    allOrders: 'All Orders',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    trackOrders: 'Track and manage your order history',
    pleaseLogin: 'Please Login',
    loginToViewOrders: 'You need to login to view your orders',
    loginNow: 'Login Now',
    noOrdersFound: 'No Orders Found',
    noOrdersYet: "You haven't placed any orders yet",
    order: 'Order',
    viewDetails: 'View Details',
    writeReview: 'Write a Review',
    items: 'Items',
    menuItems: 'menu items',
    viewMenu: 'View Menu',
    restaurant: 'Restaurant',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    phoneNumber: 'Phone Number',
    location: 'Location / Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    saveChanges: 'Save Changes',
    editProfile: 'Edit Profile',
    myProfile: 'My Profile',
    personalInfo: 'Personal Information',
    addresses: 'Addresses',
    addAddress: 'Add Address',
    noAddresses: 'No addresses saved yet',
    addressTitle: 'Address Title (e.g., Home, Office)',
    fullAddress: 'Full Address',
    defaultAddress: 'Default',
    setAsDefault: 'Set as Default',
    callUs: 'Call Us',
    emailUs: 'Email Us',
    visitUs: 'Visit Us',
    sendMessage: 'Send Message',
    yourName: 'Your Name',
    emailAddress: 'Email Address',
    typeMessage: 'Type your message here',
    messageSent: 'Message sent successfully!',
    supportOnline: 'Support Online',
    supportOffline: 'Support Offline',
    typeYourMessage: 'Type your message here...',
    you: 'You',
    support: 'Support',
    quickReplies: 'Quick Replies',
    helpWithOrder: 'I need help with my order',
    deliveryTimeQ: 'How long does delivery take?',
    cancelOrderQ: 'I want to cancel my order',
    paymentIssueQ: 'I have a payment issue',
    greatFood: 'Great Food & Warm Hospitality',
    greatFoodDesc: 'We love serving delicious meals made with fresh and healthy ingredients. Come and enjoy wonderful dishes prepared just for you in a cozy and friendly place.',
    discoverKitchen: 'Discover Our Kitchen',
    support247: '24/7 Support',
    support247Desc: 'Round-the-clock dedicated customer assistance to ensure your orders run smoothly anytime.',
    alwaysOpen: 'Always Open',
    easyPayment: 'Easy Payment',
    easyPaymentDesc: 'Integrated smart payment gateways like Telebirr for seamless and secure transactions.',
    fastSecure: 'Fast & Secure',
    fastDeliveryDesc: 'Real-time tracking and optimized logistics to get your food hot and fresh instantly.',
    liveTracking: 'Live Tracking',
    multiRole: 'Multi-Role System',
    multiRoleDesc: 'Synchronized portals for customers, kitchen chefs, waiters, delivery drivers, and managers.',
    smartSync: 'Smart Sync',
    findDailyMeal: 'Find your daily meal',
    easyOrdering: 'Easy to food ordering system',
    fastestDelivery: 'Fastest food delivery service',
    trackOrder: 'Track your food order',
    foodMenu: 'Food Menu',
    filter: 'Filter',
    results: 'results',
    showing: 'Showing',
    etb: 'ETB',
    remove: 'Remove',
    price: 'Price',
    description: 'Description',
    relatedItems: 'You may also like',
    status_PENDING: 'Pending',
    status_CONFIRMED: 'Confirmed',
    status_PREPARING: 'Preparing',
    status_READY: 'Ready',
    status_OUT_FOR_DELIVERY: 'Out for Delivery',
    status_READY_TO_SERVE: 'Ready to Serve',
    status_DELIVERED: 'Delivered',
    status_SERVED: 'Served',
    status_COMPLETED: 'Completed',
    status_CANCELLED: 'Cancelled',
    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    manageRestaurantPlatform: 'Manage your restaurant platform',
    notifications: 'Notifications',
  },
  am: {
    home: 'ቤት',
    categories: 'ምድቦች',
    restaurants: 'ምግብ ቤቶች',
    menu: 'ምናሌ',
    about: 'ስለ እኛ',
    contact: 'አግኙን',
    profile: 'መገለጫ',
    myAddress: 'አድራሻዬ',
    myOrders: 'ትዕዛዞቼ',
    language: 'ቋንቋ',
    helpSupport: 'እገዛ',
    liveChat: 'ቀጥታ ውይይት',
    logout: 'ውጣ',
    whyStayHungry: 'ለምን ረሃብ ይቆዩ!',
    tasteOfHome: 'የቤት ጣዕም፣ በፍጥነት ይደርሳል',
    orderNow: 'አሁን እዘዝ',
    exploreMenu: 'ምናሌን ያስሱ',
    popularDishes: 'ታዋቂ ምግቦች',
    topRestaurants: 'ምርጥ ምግብ ቤቶች',
    viewAll: 'ሁሉንም ይመልከቱ',
    seeMore: 'ተጨማሪ',
    addToCart: 'ወደ ጋሪ ጨምር',
    addedToCartSuccessfully: 'በተሳካ ሁኔታ ወደ ጋሪ ታክሏል!',
    cart: 'ጋሪ',
    checkout: 'ክፍያ',
    search: 'ፈልግ',
    loading: 'በመጫን ላይ...',
    noItemsFound: 'ምንም አልተገኘም',
    delivery: 'ዲሊቨሪ',
    dineIn: 'በቦታው',
    fastDelivery: 'ፈጣን ዲሊቨሪ',
    securePayment: 'ደህንነቱ የተጠበቀ ክፍያ',
    chooseLanguage: 'ቋንቋ ይምረጡ',
    selectPreferredLanguage: 'የሚመርጡትን ቋንቋ ይምረጡ',
    themePreference: 'የገጽታ ምርጫ',
    lightMode: 'ብርሃን ሁነታ',
    darkMode: 'ጨለማ ሁነታ',
    brightAndClear: 'ብሩህ እና ግልጽ',
    easyOnEyes: 'ለዓይን ምቹ',
    active: 'ንቁ',
    aboutUs: 'ስለ እኛ',
    getInTouch: 'ያግኙን',
    ourStory: 'ታሪካችን',
    featuredCategories: 'ተለይተው የቀረቡ ምድቦች',
    specialOffers: 'ልዩ ቅናሾች',
    howItWorks: 'እንዴት እንደሚሰራ',
    footerRights: 'መብቱ በህግ የተጠበቀ ነው',
    backToHome: 'ወደ ቤት ተመለስ',
    backToRestaurants: 'ወደ ምግብ ቤቶች ተመለስ',
    backTo: 'ተመለስ ወደ',
    open: 'ክፍት',
    closed: 'ዝግ',
    openNow: 'አሁን ክፍት',
    popularChoice: 'ታዋቂ ምርጫ',
    currentlyUnavailable: 'በአሁኑ ጊዜ አይገኝም',
    unavailable: 'አይገኝም',
    foodNotFound: 'ምግብ አልተገኘም',
    restaurantNotFound: 'ምግብ ቤት አልተገኘም',
    quantity: 'ብዛት',
    addons: 'ተጨማሪዎች',
    specialInstructions: 'ልዩ መመሪያዎች',
    specialInstructionsPlaceholder: 'ልዩ ጥያቄ አለዎት? (ለምሳሌ፡ ትንሽ ቅመም፣ ሽንኩርት የለም)',
    reviews: 'ግምገማዎች',
    noReviewsYet: 'እስካሁን ግምገማ የለም',
    total: 'ድምር',
    subtotal: 'ንዑስ ድምር',
    deliveryFee: 'የዲሊቨሪ ክፍያ',
    discount: 'ቅናሽ',
    shoppingCart: 'የግዢ ጋሪ',
    cartEmpty: 'ጋሪዎ ባዶ ነው',
    cartEmptyHint: 'እስካሁን ወደ ጋሪዎ ምንም አላከሉም።',
    startShopping: 'ግዢ ጀምር',
    continueShopping: 'ግዢን ቀጥል',
    clearCart: 'ጋሪን አጽዳ',
    itemsInCart: 'እቃ(ዎች) በጋሪዎ ውስጥ',
    proceedToCheckout: 'ወደ ክፍያ ይቀጥሉ',
    orderSummary: 'የትዕዛዝ ማጠቃለያ',
    placeOrder: 'ትዕዛዝ አስገባ',
    selectAddress: 'የዲሊቨሪ አድራሻ ይምረጡ',
    addNewAddress: 'አዲስ አድራሻ ጨምር',
    addNew: '+ አዲስ ጨምር',
    cancel: 'ሰርዝ',
    save: 'አስቀምጥ',
    edit: 'አርትዕ',
    delete: 'ሰርዝ',
    update: 'አዘምን',
    confirm: 'አረጋግጥ',
    paymentMethod: 'የክፍያ ዘዴ',
    cashOnDelivery: 'በዲሊቨሪ ጊዜ ክፍያ',
    orderNotes: 'የትዕዛዝ ማስታወሻ',
    orderNotesPlaceholder: 'ለትዕዛዝዎ ልዩ ጥያቄ?',
    discoverRestaurants: 'አስደናቂ ምግብ ቤቶችን ያግኙ',
    discoverRestaurantsHint: 'ከምርጥ ምግብ ቤቶቻችን ይምረጡና ቀጣዩን ተወዳጅ ምግብዎን ያግኙ',
    searchRestaurants: 'በስም ወይም በአድራሻ ምግብ ቤቶችን ፈልግ...',
    searchByCategory: 'በምድብ ፈልግ...',
    discoverMealsHint: 'ጣፋጭ ምግቦችን ያግኙና ተወዳጅዎን ወዲያውኑ ይዘዙ።',
    all: 'ሁሉም',
    allOrders: 'ሁሉም ትዕዛዞች',
    completed: 'ተጠናቋል',
    cancelled: 'ተሰርዟል',
    pending: 'በመጠባበቅ ላይ',
    trackOrders: 'የትዕዛዝ ታሪክዎን ይከታተሉ እና ያስተዳድሩ',
    pleaseLogin: 'እባክዎ ይግቡ',
    loginToViewOrders: 'ትዕዛዞችዎን ለማየት መግባት ያስፈልግዎታል',
    loginNow: 'አሁን ይግቡ',
    noOrdersFound: 'ትዕዛዝ አልተገኘም',
    noOrdersYet: 'እስካሁን ምንም ትዕዛዝ አላስገቡም',
    order: 'ትዕዛዝ',
    viewDetails: 'ዝርዝር ይመልከቱ',
    writeReview: 'ግምገማ ጻፍ',
    items: 'እቃዎች',
    menuItems: 'የምናሌ እቃዎች',
    viewMenu: 'ምናሌ ይመልከቱ',
    restaurant: 'ምግብ ቤት',
    fullName: 'ሙሉ ስም',
    email: 'ኢሜይል',
    phone: 'ስልክ',
    phoneNumber: 'ስልክ ቁጥር',
    location: 'አድራሻ',
    password: 'የይለፍ ቃል',
    confirmPassword: 'የይለፍ ቃል አረጋግጥ',
    saveChanges: 'ለውጦችን አስቀምጥ',
    editProfile: 'መገለጫ አርትዕ',
    myProfile: 'መገለጫዬ',
    personalInfo: 'የግል መረጃ',
    addresses: 'አድራሻዎች',
    addAddress: 'አድራሻ ጨምር',
    noAddresses: 'እስካሁን አድራሻ አልተቀመጠም',
    addressTitle: 'የአድራሻ ርዕስ (ለምሳሌ፡ ቤት፣ ቢሮ)',
    fullAddress: 'ሙሉ አድራሻ',
    defaultAddress: 'ነባሪ',
    setAsDefault: 'እንደ ነባሪ አድርግ',
    callUs: 'ይደውሉልን',
    emailUs: 'ኢሜይል ይላኩልን',
    visitUs: 'ይጎብኙን',
    sendMessage: 'መልእክት ላክ',
    yourName: 'ስምዎ',
    emailAddress: 'ኢሜይል አድራሻ',
    typeMessage: 'መልእክትዎን እዚህ ይጻፉ',
    messageSent: 'መልእክት በተሳካ ሁኔታ ተልኳል!',
    supportOnline: 'ድጋፍ በመስመር ላይ',
    supportOffline: 'ድጋፍ ከመስመር ውጭ',
    typeYourMessage: 'መልእክትዎን እዚህ ይጻፉ...',
    you: 'እርስዎ',
    support: 'ድጋፍ',
    quickReplies: 'ፈጣን ምላሾች',
    helpWithOrder: 'ስለ ትዕዛዜ እገዛ እፈልጋለሁ',
    deliveryTimeQ: 'ዲሊቨሪ ምን ያህል ጊዜ ይወስዳል?',
    cancelOrderQ: 'ትዕዛዜን መሰረዝ እፈልጋለሁ',
    paymentIssueQ: 'የክፍያ ችግር አለብኝ',
    greatFood: 'ጥሩ ምግብ እና ሞቅ ያለ አቀባበል',
    greatFoodDesc: 'በትኩስ እና ጤናማ ንጥረ ነገሮች የተዘጋጁ ጣፋጭ ምግቦችን እናቀርባለን። በምቹ ቦታ ይደሰቱ።',
    discoverKitchen: 'ወጥ ቤታችንን ያግኙ',
    support247: '24/7 ድጋፍ',
    support247Desc: 'ትዕዛዞችዎ በማንኛውም ጊዜ በደንብ እንዲሄዱ የቀንና ማታ ድጋፍ።',
    alwaysOpen: 'ሁልጊዜ ክፍት',
    easyPayment: 'ቀላል ክፍያ',
    easyPaymentDesc: 'እንደ ቴሌብር ያሉ ደህንነቱ የተጠበቁ የክፍያ ስርዓቶች።',
    fastSecure: 'ፈጣን እና ደህንነቱ የተጠበቀ',
    fastDeliveryDesc: 'ምግብዎ ትኩስ እና ሞቅ ብሎ እንዲደርስዎ የቀጥታ ክትትል።',
    liveTracking: 'የቀጥታ ክትትል',
    multiRole: 'ባለብዙ ሚና ስርዓት',
    multiRoleDesc: 'ለደንበኞች፣ ሼፎች፣ አስተናጋጆች፣ አሽከርካሪዎች እና አስተዳዳሪዎች የተቀናጀ ፖርታል።',
    smartSync: 'ብልጥ ማመሳሰል',
    findDailyMeal: 'ዕለታዊ ምግብዎን ያግኙ',
    easyOrdering: 'ቀላል የምግብ ትዕዛዝ ስርዓት',
    fastestDelivery: 'ፈጣኑ የምግብ ዲሊቨሪ',
    trackOrder: 'ትዕዛዝዎን ይከታተሉ',
    foodMenu: 'የምግብ ምናሌ',
    filter: 'አጣራ',
    results: 'ውጤቶች',
    showing: 'በማሳየት ላይ',
    etb: 'ብር',
    remove: 'አስወግድ',
    price: 'ዋጋ',
    description: 'መግለጫ',
    relatedItems: 'ሊወዱት ይችላሉ',
    status_PENDING: 'በመጠባበቅ',
    status_CONFIRMED: 'ተረጋግጧል',
    status_PREPARING: 'በዝግጅት ላይ',
    status_READY: 'ዝግጁ',
    status_OUT_FOR_DELIVERY: 'ለዲሊቨሪ ወጥቷል',
    status_READY_TO_SERVE: 'ለማቅረብ ዝግጁ',
    status_DELIVERED: 'ደርሷል',
    status_SERVED: 'ቀርቧል',
    status_COMPLETED: 'ተጠናቋል',
    status_CANCELLED: 'ተሰርዟል',
    // Admin Dashboard
    adminDashboard: 'የአስተዳዳሪ ሰሌዳ',
    manageRestaurantPlatform: 'የምግብ ቤት መድረክዎን ያስተዳድሩ',
    notifications: 'ማሳወቂያዎች',
  },
  om: {
    home: 'Mana',
    categories: 'Ramaddiiwwan',
    restaurants: 'Mana Nyaataa',
    menu: 'Menu',
    about: "Waa'ee Keenya",
    contact: 'Nu Qunnamaa',
    profile: 'Profaayilii',
    myAddress: 'Teessoo Koo',
    myOrders: 'Ajaja Koo',
    language: 'Afaan',
    helpSupport: 'Gargaarsa',
    liveChat: 'Haasawaa',
    logout: "Ba'i",
    whyStayHungry: 'Maaliif Beelaa Turta!',
    tasteOfHome: 'Dhandhamtii Manaa, Ariitiin Geessisa',
    orderNow: 'Amma Ajaji',
    exploreMenu: "Menu Sakatta'i",
    popularDishes: 'Nyaata Beekamoo',
    topRestaurants: 'Mana Nyaataa Filatamoo',
    viewAll: 'Hunda Ilaali',
    seeMore: 'Dabalata',
    addToCart: 'Gara Kaartii Dabali',
    addedToCartSuccessfully: 'milkiin gara kaartii dabalameera!',
    cart: 'Kaartii',
    checkout: 'Kaffalti',
    search: 'Barbaadi',
    loading: "Fe'aa jira...",
    noItemsFound: 'Homtuu hin argamne',
    delivery: 'Geessisa',
    dineIn: 'Bakka irratti',
    fastDelivery: 'Geessisa Ariifataa',
    securePayment: 'Kaffaltii Nageenya qabu',
    chooseLanguage: 'Afaan Filadhu',
    selectPreferredLanguage: 'Afaan filattee kee filadhu',
    themePreference: "Filannoo Mul'ata",
    lightMode: 'Haala Ifaa',
    darkMode: 'Haala Dukkanaa',
    brightAndClear: 'Ifaa fi iftoomaa',
    easyOnEyes: 'Ijatiif mijataa',
    active: 'Hojjachaa',
    aboutUs: "Waa'ee Keenya",
    getInTouch: 'Nu Qunnamaa',
    ourStory: 'Seenaa Keenya',
    featuredCategories: 'Ramaddiiwwan Filatamoo',
    specialOffers: 'Dhiyeessii Addaa',
    howItWorks: 'Akkamittiin Hojjeta',
    footerRights: 'Mirgi seeraan eegameera',
    backToHome: 'Gara Manaatti Deebi\'i',
    backToRestaurants: 'Gara Mana Nyaataatti Deebi\'i',
    backTo: 'Deebi\'i gara',
    open: 'Banaa',
    closed: 'Cufame',
    openNow: 'Amma Banaa',
    popularChoice: 'Filannoo Beekamaa',
    currentlyUnavailable: 'Amma hin argamu',
    unavailable: 'Hin argamu',
    foodNotFound: 'Nyaanni hin argamne',
    restaurantNotFound: 'Mana nyaataa hin argamne',
    quantity: 'Baay\'ina',
    addons: 'Dabalatawwan',
    specialInstructions: 'Qajeelfama Addaa',
    specialInstructionsPlaceholder: 'Gaaffii addaa qabduu? (fkn: qaraa xiqqaa, shunkurtii malee)',
    reviews: 'Gamaaggama',
    noReviewsYet: 'Ammatti gamaaggamni hin jiru',
    total: 'Ida\'ama',
    subtotal: 'Ida\'ama xiqqaa',
    deliveryFee: 'Kaffaltii Geessisaa',
    discount: 'Hir\'ina',
    shoppingCart: 'Kaartii Bittaa',
    cartEmpty: 'Kaartiin kee duwwaa dha',
    cartEmptyHint: 'Ammatti wanti kaartii keetti dabalamte hin jiru.',
    startShopping: 'Bittaa Jalqabi',
    continueShopping: 'Bittaa Itti Fufi',
    clearCart: 'Kaartii Qulqulleessi',
    itemsInCart: 'wantoota kaartii keessan keessa',
    proceedToCheckout: 'Gara Kaffaltitti Darbi',
    orderSummary: 'Cuunfaa Ajaja',
    placeOrder: 'Ajaja Kenni',
    selectAddress: 'Teessoo Geessisaa Filadhu',
    addNewAddress: 'Teessoo Haaraa Dabali',
    addNew: '+ Haaraa Dabali',
    cancel: 'Haqi',
    save: 'Olkaa\'i',
    edit: 'Gulaali',
    delete: 'Haqi',
    update: 'Haaromsii',
    confirm: 'Mirkaneessi',
    paymentMethod: 'Malattoo Kaffaltii',
    cashOnDelivery: 'Yeroo Geessisu Kaffali',
    orderNotes: 'Yaada Ajaja',
    orderNotesPlaceholder: 'Ajaja keetiif gaaffii addaa?',
    discoverRestaurants: 'Mana Nyaataa Ajaa\'ibaa Argadhu',
    discoverRestaurantsHint: 'Mana nyaataa filatamoo keenyatti keessa deemi fi nyaata jaalattu argadhu',
    searchRestaurants: 'Maqaa ykn teessoon mana nyaataa barbaadi...',
    searchByCategory: 'Ramaddiidhaan barbaadi...',
    discoverMealsHint: 'Nyaata mi\'aawaa argadhu fi jaalattee kee amma ajaji.',
    all: 'Hunda',
    allOrders: 'Ajaja Hunda',
    completed: 'Xumurame',
    cancelled: 'Haqame',
    pending: 'Eegaa jira',
    trackOrders: 'Seenaa ajaja kee hordofi fi bulchi',
    pleaseLogin: 'Maaloo Seeni',
    loginToViewOrders: 'Ajaja kee ilaaluuf seenuu qabda',
    loginNow: 'Amma Seeni',
    noOrdersFound: 'Ajajni hin argamne',
    noOrdersYet: 'Ammatti ajaja hin kennine',
    order: 'Ajaja',
    viewDetails: 'Bal\'ina Ilaali',
    writeReview: 'Gamaaggama Barreessi',
    items: 'Wantoota',
    menuItems: 'wantoota menu',
    viewMenu: 'Menu Ilaali',
    restaurant: 'Mana Nyaataa',
    fullName: 'Maqaa Guutuu',
    email: 'Imeelii',
    phone: 'Bilbila',
    phoneNumber: 'Lakkoofsa Bilbilaa',
    location: 'Teessoo',
    password: 'Jecha Iccitii',
    confirmPassword: 'Jecha Iccitii Mirkaneessi',
    saveChanges: 'Jijjiirama Olkaa\'i',
    editProfile: 'Profaayilii Gulaali',
    myProfile: 'Profaayilii Koo',
    personalInfo: 'Odeeffannoo Dhuunfaa',
    addresses: 'Teessowwan',
    addAddress: 'Teessoo Dabali',
    noAddresses: 'Ammatti teessoon hin olkaafamne',
    addressTitle: 'Mata duree Teessoo (fkn: Mana, Waajjira)',
    fullAddress: 'Teessoo Guutuu',
    defaultAddress: 'Durtii',
    setAsDefault: 'Akkuma Durtii Godhi',
    callUs: 'Nu Bilbili',
    emailUs: 'Imeelii Nuuf Ergi',
    visitUs: 'Nu Daawwadhu',
    sendMessage: 'Ergaa Ergi',
    yourName: 'Maqaa Kee',
    emailAddress: 'Teessoo Imeelii',
    typeMessage: 'Ergaa kee asitti barreessi',
    messageSent: 'Ergaan milkaa\'inaan ergameera!',
    supportOnline: 'Gargaarsi Toora irratti',
    supportOffline: 'Gargaarsi Toora ala',
    typeYourMessage: 'Ergaa kee asitti barreessi...',
    you: 'Ati',
    support: 'Gargaarsa',
    quickReplies: 'Deebii Ariifataa',
    helpWithOrder: 'Ajaja koo irratti gargaarsa barbaada',
    deliveryTimeQ: 'Geessisni yeroo hammam fudhata?',
    cancelOrderQ: 'Ajaja koo haquu barbaada',
    paymentIssueQ: 'Rakkoo kaffaltii qaba',
    greatFood: 'Nyaata Gaarii fi Simannaa Ho\'aa',
    greatFoodDesc: 'Nyaata mi\'aawaa wantoota haaraa fi fayyaa qabuun qophaa\'e dhiyeessina. Bakka mijataa keessatti bashannani.',
    discoverKitchen: 'Kushinaa Keenya Argadhu',
    support247: 'Gargaarsa 24/7',
    support247Desc: 'Ajajni kee yeroo kamiyyuu akka gaariitti akka deemuuf gargaarsa guyyaa fi halkan.',
    alwaysOpen: 'Yeroo hunda Banaa',
    easyPayment: 'Kaffaltii Salphaa',
    easyPaymentDesc: 'Akka Telebirr kaffaltii nageenya qabu.',
    fastSecure: 'Ariifataa fi Nageenya qabu',
    fastDeliveryDesc: 'Nyaanni kee ho\'aa fi haaraa ta\'ee akka sii gahuuf hordoffii kallattii.',
    liveTracking: 'Hordoffii Kallattii',
    multiRole: 'Sirna Gahee Hedduu',
    multiRoleDesc: 'Maamiltoota, chefota, waiteroota, konkolaachisota fi bulchitootaaf portal walqunnamtii.',
    smartSync: 'Wal-simsiisa Qaroo',
    findDailyMeal: 'Nyaata guyyaa kee argadhu',
    easyOrdering: 'Sirna ajaja nyaataa salphaa',
    fastestDelivery: 'Tajaajila geessisaa ariifataa',
    trackOrder: 'Ajaja kee hordofi',
    foodMenu: 'Menu Nyaataa',
    filter: 'Calali',
    results: 'bu\'aawwan',
    showing: 'Agarsiisaa',
    etb: 'ETB',
    remove: 'Haqi',
    price: 'Gatii',
    description: 'Ibsa',
    relatedItems: 'Siitti dhaga\'amuu danda\'a',
    status_PENDING: 'Eegaa',
    status_CONFIRMED: 'Mirkanaa\'e',
    status_PREPARING: 'Qophaa\'aa',
    status_READY: 'Qophaa\'e',
    status_OUT_FOR_DELIVERY: 'Geessisuuf ba\'e',
    status_READY_TO_SERVE: 'Dhiyeessuuf qophaa\'e',
    status_DELIVERED: 'Geesse',
    status_SERVED: 'Dhiyaate',
    status_COMPLETED: 'Xumurame',
    status_CANCELLED: 'Haqame',
    // Admin Dashboard
    adminDashboard: 'Boordi Bulchaa',
    manageRestaurantPlatform: 'Waltajjii mana nyaataa bulchi',
    notifications: 'Beeksisawwan',
  },
};

// Build reverse map: English phrase → key (for t('Add to Cart') style calls)
const enToKey = {};
Object.entries(translations.en).forEach(([key, value]) => {
  enToKey[value] = key;
});

const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '';
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved && translations[saved] ? saved : 'en';
  });
  const [translationCache, setTranslationCache] = useState(() => {
    try {
      const saved = localStorage.getItem('translationCache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    if (Object.keys(translationCache).length > 0) {
      localStorage.setItem('translationCache', JSON.stringify(translationCache));
    }
  }, [translationCache]);

  const changeLanguage = (lang) => {
    if (!translations[lang]) return;
    setLanguage(lang);
  };

  const translateText = useCallback(
    async (text, targetLang = language) => {
      if (targetLang === 'en' || !text || typeof text !== 'string') {
        return text;
      }

      // Prefer static dictionary (by key or English phrase)
      const dict = translations[targetLang] || translations.en;
      if (dict[text]) return dict[text];
      const key = enToKey[text];
      if (key && dict[key]) return dict[key];

      const cacheKey = `${text}_${targetLang}`;
      if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
      }

      if (!GOOGLE_TRANSLATE_API_KEY) {
        return text;
      }

      try {
        const response = await fetch(`${TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, target: targetLang, format: 'text' }),
        });

        if (!response.ok) return text;

        const data = await response.json();
        const translatedText = data.data.translations[0].translatedText;

        setTranslationCache((prev) => ({ ...prev, [cacheKey]: translatedText }));
        return translatedText;
      } catch (error) {
        console.error('Translation error:', error);
        return text;
      }
    },
    [language, translationCache]
  );

  const t = useCallback(
    (keyOrText, vars) => {
      if (!keyOrText || typeof keyOrText !== 'string') return keyOrText;

      const dict = translations[language] || translations.en;

      // Direct key lookup
      let result = dict[keyOrText];

      // English phrase → key → translation
      if (!result) {
        const mappedKey = enToKey[keyOrText];
        if (mappedKey) result = dict[mappedKey];
      }

      // Fallback to English dictionary value or original
      if (!result) {
        result = translations.en[keyOrText] || keyOrText;
      }

      // Simple {name} interpolation
      if (vars && typeof result === 'string') {
        Object.entries(vars).forEach(([k, v]) => {
          result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }

      return result;
    },
    [language]
  );

  const statusLabel = useCallback(
    (status) => t(`status_${status}`) || status,
    [t]
  );

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage, t, translateText, statusLabel }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
