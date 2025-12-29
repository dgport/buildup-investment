import { useState, useEffect } from 'react'
import { Users, Home, Image, LogOut, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PartnersPanel from '@/components/pages/admin/partners/PartnersPanel'
import SlidesPanel from '@/components/pages/admin/slides/SlidesPanel'
import PropertiesPanel from '@/components/pages/admin/properties/PropertiesPanel'
import { Button } from '@/components/ui/button'

type MenuType = 'partners' | 'properties' | 'slides' | 'calculator'

interface MenuItem {
  id: MenuType
  label: string
  icon: LucideIcon
  component: React.ComponentType
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'partners',
    label: 'Partners',
    icon: Users,
    component: PartnersPanel,
  },
  {
    id: 'properties',
    label: 'Properties',
    icon: Home,
    component: PropertiesPanel,
  },
  {
    id: 'slides',
    label: 'Slides',
    icon: Image,
    component: SlidesPanel,
  },
]

const VALID_TABS = MENU_ITEMS.map(item => item.id)

export default function Admin() {
  const navigate = useNavigate()

  const [activeMenu, setActiveMenu] = useState<MenuType>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab') as MenuType
      if (VALID_TABS.includes(tab)) {
        return tab
      }
    }
    return MENU_ITEMS[0].id
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      params.set('tab', activeMenu)
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, '', newUrl)
    }
  }, [activeMenu])

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab') as MenuType
      if (VALID_TABS.includes(tab)) {
        setActiveMenu(tab)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      window.requestAnimationFrame(() => {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
  }, [activeMenu])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/')
  }

  const ActiveComponent = MENU_ITEMS.find(
    item => item.id === activeMenu
  )?.component

  return (
    <div className="flex min-h-screen pt-24 bg-gray-50">
      <aside className="w-64 pt-24 bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed left-0 top-0 h-screen flex flex-col shadow-2xl z-40">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-gray-400 text-sm mt-1">Management Dashboard</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {MENU_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeMenu === item.id

            return (
              <Button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex justify-start items-center group px-4 py-3 rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/50 border-l-4 border-blue-400'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />
                <span
                  className={`font-medium ${isActive ? 'font-semibold' : ''}`}
                >
                  {item.label}
                </span>
              </Button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Button
            className="w-full flex justify-start text-gray-300 hover:bg-red-600/20 hover:text-red-400 group"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </aside>

      <main
        id="main-content"
        className="flex-1 ml-64 min-h-screen overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-white rounded-xl shadow-sm p-8 min-h-[calc(100vh-4rem)]">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </main>
    </div>
  )
}
