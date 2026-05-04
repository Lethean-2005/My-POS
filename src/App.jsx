import { useState } from 'react'
import Header from './components/Header.jsx'
import RecentOrders from './components/RecentOrders.jsx'
import MenuSection from './components/MenuSection.jsx'
import OrderPanel from './components/OrderPanel.jsx'

export default function App() {
  const [nav, setNav] = useState('pos')

  return (
    <div className="app-shell">
      <Header active={nav} onChange={setNav} />
      <main className="app-main">
        <div className="left-col">
          <RecentOrders />
          <MenuSection />
        </div>
        <OrderPanel />
      </main>
    </div>
  )
}
