import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import ReactCountryFlag from 'react-country-flag'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const languages = [
  { code: 'en', name: 'English', country: 'GB' },
  { code: 'ka', name: 'ქართული', country: 'GE' },
  { code: 'ru', name: 'Русский', country: 'RU' },
  { code: 'ar', name: 'العربية', country: 'SA' },
  { code: 'he', name: 'עברית', country: 'IL' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage')
    if (savedLanguage && languages.some(l => l.code === savedLanguage)) {
      i18n.changeLanguage(savedLanguage)
    }
  }, [i18n])

  const currentLanguage =
    languages.find(l => l.code === i18n.language) || languages[0]

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem('preferredLanguage', langCode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 gap-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/70 border border-gray-200 hover:border-blue-300 rounded-lg transition-all"
        >
          <ReactCountryFlag
            svg
            countryCode={currentLanguage.country}
            className="w-5 h-5 rounded-sm"
          />

          <span className="text-sm font-medium uppercase">
            {currentLanguage.code}
          </span>

          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-[190px] shadow-xl border-gray-200"
      >
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              'cursor-pointer py-2.5 px-3 flex items-center gap-3 transition-colors',
              i18n.language === lang.code
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'hover:bg-gray-50 text-gray-700'
            )}
          >
            <ReactCountryFlag
              svg
              countryCode={lang.country}
              className="w-5 h-5 rounded-sm"
            />

            <div className="flex flex-col">
              <span className="text-sm">{lang.name}</span>
              <span className="text-xs opacity-60 uppercase">{lang.code}</span>
            </div>

            {i18n.language === lang.code && (
              <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ')
