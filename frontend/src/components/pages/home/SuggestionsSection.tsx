import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Building2,
  Hammer,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

export default function SuggestSection() {
  const data = [
    {
      header: 'Premium Batumi Properties',
      text: 'Discover luxury apartments, seaside villas, and commercial spaces in the heart of Batumi. We specialize in prime Black Sea coast locations with stunning views.',
      icon: Building2,
    },
    {
      header: 'Full Construction Services',
      text: 'From foundation to finish — our experienced construction team delivers high-quality residential and commercial projects across Georgia, meeting international standards.',
      icon: Hammer,
    },
    {
      header: 'Investment Opportunities',
      text: "Navigate Georgia's thriving real estate market with confidence. We offer expert guidance on profitable investments, property management, and rental income optimization.",
      icon: TrendingUp,
    },
    {
      header: 'Turnkey Solutions',
      text: 'Comprehensive property development services including design, construction, legal support, and interior finishing — all handled by our dedicated team in Batumi.',
      icon: CheckCircle2,
    },
  ]

  return (
    <section className="relative w-full bg-[#FAFAF8] py-5 px-6 sm:px-16 md:px-20 lg:py-16 xl:px-24 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-amber-400/40 rounded-full px-6 py-2.5 mb-6 shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-teal-800 font-semibold text-sm uppercase tracking-wider">
              Our Expertise
            </span>
          </div>
        </div>

        <div className="w-full lg:hidden">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="ml-0 -ml-4">
              {data.map((item, index) => {
                const Icon = item.icon
                return (
                  <CarouselItem
                    key={index}
                    className="pl-4 basis-full sm:basis-1/2"
                  >
                    <div className="group flex h-full min-h-[200px] w-full flex-col items-start rounded-2xl bg-white border border-teal-800/20 p-6 hover:border-amber-400 transition-all duration-300 hover:shadow-xl shadow-md">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-800 to-teal-900 border border-amber-400/30 group-hover:shadow-lg group-hover:shadow-amber-400/20 transition-all duration-300">
                          <Icon className="w-6 h-6 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-teal-900 leading-tight">
                          {item.header}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>

            <div className="flex justify-center gap-3 mt-8">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>

        <div className="hidden w-full grid-cols-2 gap-6 lg:grid">
          {data.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="group relative flex flex-col items-start justify-start rounded-2xl bg-white border border-teal-800/20 p-8 hover:border-amber-400 transition-all duration-300 hover:shadow-2xl shadow-md hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-800 to-teal-900 border border-amber-400/30 group-hover:shadow-lg group-hover:shadow-amber-400/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-teal-900 leading-tight pt-2">
                    {item.header}
                  </h3>
                </div>

                <p className="relative z-10 text-base text-gray-600 leading-relaxed">
                  {item.text}
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            )
          })}
        </div>
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNCwxMTYsMTQ0LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40 pointer-events-none" />
    </section>
  )
}
