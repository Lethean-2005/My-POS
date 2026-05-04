export const recentOrders = [
  {
    id: '#4589',
    name: 'James Smith',
    time: '11:30 AM',
    type: 'Delivery',
    typeColor: 'orange',
    timer: '12 Mins',
    timerColor: 'red',
    price: 14.25,
    progress: 70
  },
  {
    id: '#5698',
    name: 'Maria Gonzalez',
    time: '11:45 AM',
    type: 'Take Away',
    typeColor: 'pink',
    timer: '8 Mins',
    timerColor: 'red',
    price: 18.40,
    progress: 50
  },
  {
    id: '#9989',
    name: "Liam O'Connor",
    time: '11:10 AM',
    type: 'Dine In',
    typeColor: 'green',
    timer: 'Table 1',
    timerColor: 'green',
    price: 13.45,
    progress: 90
  },
  {
    id: '#9089',
    name: 'Sophia Kim',
    time: '11:20 AM',
    type: 'Delivery',
    typeColor: 'orange',
    timer: '15 Mins',
    timerColor: 'orange',
    price: 22.60,
    progress: 40
  }
]

export const categories = [
  { id: 'all', name: 'All Menus', count: 200, emoji: '🍽️' },
  { id: 'seafood', name: 'Sea Food', count: 35, emoji: '🦐' },
  { id: 'pizza', name: 'Pizza', count: 180, emoji: '🍕' },
  { id: 'salads', name: 'Salads', count: 120, emoji: '🥗' },
  { id: 'tacos', name: 'Tacos', count: 150, emoji: '🌮' },
  { id: 'soups', name: 'Soups', count: 100, emoji: '🍜' }
]

export const menuItems = [
  {
    id: 1,
    name: 'Grilled Salmon Steak',
    category: 'Sea Food',
    price: 80,
    veg: false,
    badge: 'Trending',
    img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80'
  },
  {
    id: 2,
    name: 'Cheese Burst Pizza',
    category: 'Pizza',
    price: 66,
    veg: true,
    badge: 'Must Try',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80'
  },
  {
    id: 3,
    name: 'Garlic Butter Shrimp',
    category: 'Sea Food',
    price: 25,
    veg: false,
    img: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400&q=80'
  },
  {
    id: 4,
    name: 'Chicken Taco',
    category: 'Tacos',
    price: 33,
    qty: 2,
    veg: false,
    img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80'
  },
  {
    id: 5,
    name: 'Tomato Basil Soup',
    category: 'Soups',
    price: 44,
    veg: true,
    img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80'
  },
  {
    id: 6,
    name: 'Vegetable Roll',
    category: 'Sushi',
    price: 66,
    veg: true,
    img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80'
  },
  {
    id: 7,
    name: 'Lemon Mint Juice',
    category: 'Beverages',
    price: 36,
    veg: true,
    img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80'
  },
  {
    id: 8,
    name: 'Grilled Veggie Taco',
    category: 'Tacos',
    price: 49,
    veg: true,
    badge: 'Must Try',
    img: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&q=80'
  },
  {
    id: 9,
    name: 'Chicken Taco',
    category: 'Tacos',
    price: 69,
    veg: false,
    egg: true,
    img: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&q=80'
  },
  {
    id: 10,
    name: 'Shrimp Tom Yum',
    category: 'Soups',
    price: 56,
    veg: false,
    img: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&q=80'
  },
  {
    id: 11,
    name: 'Corn Pizza',
    category: 'Pizza',
    price: 96,
    veg: true,
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80'
  },
  {
    id: 12,
    name: 'Chicken Noodle Soup',
    category: 'Soups',
    price: 45,
    veg: false,
    img: 'https://images.unsplash.com/photo-1547308283-b941c1cb91d2?w=400&q=80'
  },
  {
    id: 13,
    name: 'Lobster Thermidor',
    category: 'Sea Food',
    price: 80,
    veg: false,
    img: 'https://images.unsplash.com/photo-1625944525533-473f1b3d9684?w=400&q=80'
  },
  {
    id: 14,
    name: 'Quinoa Salad',
    category: 'Salads',
    price: 110,
    veg: true,
    img: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400&q=80'
  },
  {
    id: 15,
    name: 'Hot Chocolate',
    category: 'Beverages',
    price: 84,
    veg: true,
    img: 'https://images.unsplash.com/photo-1542990253-0b8be07d4d51?w=400&q=80'
  }
]

export const orderItems = [
  {
    id: 1,
    name: 'Chicken Taco',
    size: 'Medium',
    img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&q=80',
    qty: 2,
    itemPrice: 33,
    total: 66,
    note: 'Add Note',
    highlighted: true
  },
  {
    id: 2,
    name: 'Grilled Chicken',
    size: 'Small : 250 gms',
    img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&q=80',
    qty: 1,
    itemPrice: 0,
    total: 0,
    note: 'Add Note'
  },
  {
    id: 3,
    name: 'Lobster Thermidor',
    size: 'Half Lobster : 300 gms',
    img: 'https://images.unsplash.com/photo-1625944525533-473f1b3d9684?w=200&q=80',
    qty: 1,
    itemPrice: 0,
    total: 0,
    note: 'View Note'
  },
  {
    id: 4,
    name: 'Spinach & Corn Pizza',
    size: 'Small : 6 inches',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80',
    qty: 1,
    itemPrice: 0,
    total: 0,
    note: 'Add Note'
  }
]
