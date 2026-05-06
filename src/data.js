// Initial cart contents shown in the right-side OrderPanel.
// Real menu/categories/orders now come from the Laravel API (see api.js).
export const orderItems = [
  {
    id: 1,
    name: 'Wireless Earbuds',
    size: 'Black',
    img: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=200&q=80',
    qty: 2,
    itemPrice: 80,
    total: 160,
    note: 'Add Note',
    highlighted: true
  },
  {
    id: 2,
    name: 'Smart Watch',
    size: '44mm Silver',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80',
    qty: 1,
    itemPrice: 44,
    total: 44,
    note: 'Add Note'
  },
  {
    id: 3,
    name: 'Mechanical Keyboard',
    size: 'Wireless RGB',
    img: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=200&q=80',
    qty: 1,
    itemPrice: 45,
    total: 45,
    note: 'View Note'
  },
  {
    id: 4,
    name: 'Bluetooth Speaker',
    size: 'Portable',
    img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&q=80',
    qty: 1,
    itemPrice: 80,
    total: 80,
    note: 'Add Note'
  }
]
