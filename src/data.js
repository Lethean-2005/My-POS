// Initial cart contents shown in the right-side OrderPanel.
// Real menu/categories/orders now come from the Laravel API (see api.js).
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
