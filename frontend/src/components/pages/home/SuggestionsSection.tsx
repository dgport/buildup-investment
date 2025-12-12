import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

export default function SuggestSection() {
  const data = [
    {
      header: 'Premium Batumi Properties',
      text: 'Discover luxury apartments, seaside villas, and commercial spaces in the heart of Batumi. We specialize in prime Black Sea coast locations with stunning views.',
    },
    {
      header: 'Full Construction Services',
      text: 'From foundation to finish — our experienced construction team delivers high-quality residential and commercial projects across Georgia, meeting international standards.',
    },
    {
      header: 'Investment Opportunities',
      text: 'Navigate Georgia\'s thriving real estate market with confidence. We offer expert guidance on profitable investments, property management, and rental income optimization.',
    },
    {
      header: 'Turnkey Solutions',
      text: 'Comprehensive property development services including design, construction, legal support, and interior finishing — all handled by our dedicated team in Batumi.',
    },
  ]

  return (
    <section className="flex w-full flex-col items-start bg-[#F2F5FF] p-6 sm:px-16 md:px-20 lg:flex-row lg:items-center lg:py-12 xl:px-24">
      <div className="flex flex-col items-start lg:w-2/3">
        <h1 className="font-bgCaps text-2xl text-[#484848] lg:text-[28px]">
          Why Choose Us
        </h1>
      </div>

      {/* Mobile/Tablet Carousel */}
      <div className="w-full mt-6 lg:hidden">
        <Carousel 
          opts={{ 
            align: 'start', 
            loop: true,
          }} 
          className="w-full"
        >
          <CarouselContent className="ml-0 -ml-4">
            {data.map((item, index) => (
              <CarouselItem
                key={index}
                className="pl-4 basis-full sm:basis-1/2"
              >
                <div className="flex h-full min-h-[160px] w-full flex-col items-start rounded-xl bg-[#c0dbfc] p-6">
                  <p className="text-base font-semibold text-[#484848]">{item.header}</p>
                  <p className="mt-3 text-sm text-gray-700 leading-relaxed">{item.text}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="flex justify-center gap-2 mt-6">
            <CarouselPrevious 
              className="static translate-y-0 bg-white shadow-md hover:bg-gray-50 border border-gray-200 w-10 h-10" 
            />
            <CarouselNext 
              className="static translate-y-0 bg-white shadow-md hover:bg-gray-50 border border-gray-200 w-10 h-10" 
            />
          </div>
        </Carousel>
      </div>

      {/* Desktop Grid */}
      <div className="hidden w-full grid-cols-2 gap-6 mt-6 lg:grid lg:mt-0">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-start justify-start rounded-xl border-b-[3px] border-[#7D9BFD] bg-white py-8 pl-8 pr-14 hover:shadow-lg transition-shadow duration-300"
          >
            <h1 className="text-left text-lg font-semibold text-[#484848]">
              {item.header}
            </h1>
            <h2 className="mt-3 text-left text-gray-600 leading-relaxed">{item.text}</h2>
          </div>
        ))}
      </div>
    </section>
  )
}