import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { Apartment } from '@/lib/types/apartments'

import { ProjectApartmentCard } from '../projects/ProjectApartmentCard'

interface ApartmentsCarouselProps {
  apartments?: Apartment[]
}

const ApartmentsCarousel = ({ apartments }: ApartmentsCarouselProps) => {
  const { t } = useTranslation()

  if (!apartments || apartments.length === 0) {
    return null
  }

  return (
    <div className="py-8">
      <div className="w-full">
        <div className="flex justify-between items-center px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Apartments from developers
          </h1>
          <Link
            to="/apartments"
            className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
          >
            {t('common.seeAll')} →
          </Link>
        </div>

        <Carousel opts={{ align: 'start', loop: true }} className="w-full">
          <CarouselContent className="my-7">
            {apartments.map(apartment => (
              <CarouselItem
                key={apartment.id}
                className="cursor-default basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <Link to={`/apartments/${apartment.id}`}>
                  <ProjectApartmentCard apartment={apartment} />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="md:flex bg-gray-100" />
          <CarouselNext className="md:flex bg-gray-100" />
        </Carousel>
      </div>
    </div>
  )
}

export default ApartmentsCarousel
