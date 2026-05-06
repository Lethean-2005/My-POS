import { useCallback, useState } from 'react'
import Header from '../components/Header.jsx'
import RecentOrders from '../components/RecentOrders.jsx'
import MenuSection from '../components/MenuSection.jsx'
import OrderPanel from '../components/OrderPanel.jsx'
import { api } from '../api.js'

export default function PosPage() {
  const [nav, setNav] = useState('pos')
  const [cart, setCart] = useState([])
  const [orderType, setOrderType] = useState('dinein')
  const [customerName, setCustomerName] = useState('')
  const [placing, setPlacing] = useState(false)
  const [orderError, setOrderError] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [refreshTick, setRefreshTick] = useState(0)

  const addToCart = useCallback((menuItem) => {
    setCart(cur => {
      const existing = cur.find(i => i.id === menuItem.id)
      if (existing) {
        return cur.map(i => i.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [
        ...cur,
        {
          id: menuItem.id,
          name: menuItem.name,
          size: '',
          img: menuItem.image_url,
          qty: 1,
          itemPrice: Number(menuItem.price) || 0,
          note: 'Add Note'
        }
      ]
    })
  }, [])

  const updateCartQty = useCallback((id, delta) => {
    setCart(cur => cur.flatMap(i => {
      if (i.id !== id) return [i]
      const next = i.qty + delta
      return next <= 0 ? [] : [{ ...i, qty: next }]
    }))
  }, [])

  const removeFromCart = useCallback((id) => {
    setCart(cur => cur.filter(i => i.id !== id))
  }, [])

  const placeOrder = useCallback(async () => {
    if (cart.length === 0 || placing) return
    setPlacing(true)
    setOrderError(null)
    setOrderSuccess(null)
    try {
      const payload = {
        type: orderType,
        customer_name: customerName.trim() || null,
        items: cart.map(i => ({
          menu_item_id: i.id,
          quantity: i.qty,
          size: i.size || null,
          note: i.note && i.note !== 'Add Note' ? i.note : null
        }))
      }
      const result = await api.createOrder(payload)
      setOrderSuccess(`Order ${result.order_no} placed`)
      setCart([])
      setCustomerName('')
      setRefreshTick(t => t + 1)
      setTimeout(() => setOrderSuccess(null), 4000)
    } catch (err) {
      setOrderError(err.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }, [cart, customerName, orderType, placing])

  return (
    <div className="app-shell">
      <Header active={nav} onChange={setNav} />
      <main className="app-main">
        <div className="left-col">
          <RecentOrders refreshKey={refreshTick} />
          <MenuSection cart={cart} onAdd={addToCart} onRemove={updateCartQty} />
        </div>
        <OrderPanel
          items={cart}
          type={orderType}
          onTypeChange={setOrderType}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          onUpdateQty={updateCartQty}
          onRemoveItem={removeFromCart}
          onPlaceOrder={placeOrder}
          placing={placing}
          error={orderError}
          success={orderSuccess}
        />
      </main>
    </div>
  )
}
