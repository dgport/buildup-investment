import { useState, useEffect } from 'react'
import { Users, Building, Home, Image, LogOut, Calculator } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PartnersPanel from '@/components/pages/admin/partners/PartnersPanel'
import ProjectsPanel from '@/components/pages/admin/projects/ProjectsPanel'
import ApartmentsPanel from '@/components/pages/admin/apartments/ApartmentsPanel'
import SlidesPanel from '@/components/pages/admin/slides/SlidesPanel'
import CalculatorPanel from '@/components/pages/admin/calculator/CalculatorPanel'
import PropertiesPanel from '@/components/pages/admin/properties/PropertiesPanel'
import { Button } from '@/components/ui/button'

type MenuType =
  | 'partners'
  | 'projects'
  | 'apartments'
  | 'properties'
  | 'slides'
  | 'calculator'

export default function Admin() {
  const navigate = useNavigate()

  const [activeMenu, setActiveMenu] = useState<MenuType>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab') as MenuType
      if (
        tab === 'partners' ||
        tab === 'projects' ||
        tab === 'apartments' ||
        tab === 'properties' ||
        tab === 'slides' ||
        tab === 'calculator'
      ) {
        return tab
      }
    }
    return 'partners'
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
      if (
        tab === 'partners' ||
        tab === 'projects' ||
        tab === 'apartments' ||
        tab === 'properties' ||
        tab === 'slides' ||
        tab === 'calculator'
      ) {
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
    localStorage.removeItem('admin_token') // clear token
    navigate('/') // redirect to main page
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed left-0 top-0 h-screen flex flex-col shadow-2xl z-40">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-gray-400 text-sm mt-1">Management Dashboard</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {/* Menu Buttons */}
          <Button
            onClick={() => setActiveMenu('partners')}
            className={`w-full flex justify-start items-center group px-4 py-3 rounded-md transition-all duration-200 ${
              activeMenu === 'partners'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/50 border-l-4 border-blue-400'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Users
              className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                activeMenu === 'partners'
                  ? 'scale-110'
                  : 'group-hover:scale-105'
              }`}
            />
            <span
              className={`font-medium ${
                activeMenu === 'partners' ? 'font-semibold' : ''
              }`}
            >
              Partners
            </span>
          </Button>

          <Button
            onClick={() => setActiveMenu('projects')}
            className={`w-full flex justify-start items-center group px-4 py-3 rounded-md transition-all duration-200 ${
              activeMenu === 'projects'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/50 border-l-4 border-blue-400'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Building
              className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                activeMenu === 'projects'
                  ? 'scale-110'
                  : 'group-hover:scale-105'
              }`}
            />
            <span
              className={`font-medium ${
                activeMenu === 'projects' ? 'font-semibold' : ''
              }`}
            >
              Projects
            </span>
          </Button>

          <Button
            onClick={() => setActiveMenu('apartments')}
            className={`w-full flex justify-start items-center group px-4 py-3 rounded-md transition-all duration-200 ${
              activeMenu === 'apartments'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/50 border-l-4 border-blue-400'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Home
              className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                activeMenu === 'apartments'
                  ? 'scale-110'
                  : 'group-hover:scale-105'
              }`}
            />
            <span
              className={`font-medium ${
                activeMenu === 'apartments' ? 'font-semibold' : ''
              }`}
            >
              Apartments
            </span>
          </Button>

          <Button
            onClick={() => setActiveMenu('properties')}
            className={`w-full flex justify-start items-center group px-4 py-3 rounded-md transition-all duration-200 ${
              activeMenu === 'properties'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/50 border-l-4 border-blue-400'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Home
              className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                activeMenu === 'properties'
                  ? 'scale-110'
                  : 'group-hover:scale-105'
              }`}
            />
            <span
              className={`font-medium ${
                activeMenu === 'properties' ? 'font-semibold' : ''
              }`}
            >
              Properties
            </span>
          </Button>

          <Button
            onClick={() => setActiveMenu('slides')}
            className={`w-full flex justify-start items-center group px-4 py-3 rounded-md transition-all duration-200 ${
              activeMenu === 'slides'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/50 border-l-4 border-blue-400'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Image
              className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                activeMenu === 'slides' ? 'scale-110' : 'group-hover:scale-105'
              }`}
            />
            <span
              className={`font-medium ${activeMenu === 'slides' ? 'font-semibold' : ''}`}
            >
              Slides
            </span>
          </Button>

          <Button
            onClick={() => setActiveMenu('calculator')}
            className={`w-full flex justify-start items-center group px-4 py-3 rounded-md transition-all duration-200 ${
              activeMenu === 'calculator'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-400/50 border-l-4 border-blue-400'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Calculator
              className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                activeMenu === 'calculator'
                  ? 'scale-110'
                  : 'group-hover:scale-105'
              }`}
            />
            <span
              className={`font-medium ${
                activeMenu === 'calculator' ? 'font-semibold' : ''
              }`}
            >
              Calculator
            </span>
          </Button>
        </nav>

        {/* Logout Button */}
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
            {activeMenu === 'partners' && <PartnersPanel />}
            {activeMenu === 'projects' && <ProjectsPanel />}
            {activeMenu === 'apartments' && <ApartmentsPanel />}
            {activeMenu === 'properties' && <PropertiesPanel />}
            {activeMenu === 'slides' && <SlidesPanel />}
            {activeMenu === 'calculator' && <CalculatorPanel />}
          </div>
        </div>
      </main>
    </div>
  )
}
