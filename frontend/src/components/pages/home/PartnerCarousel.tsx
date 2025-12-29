import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import PartnerCard from '../partners/PartnerCard'
import { Link } from 'react-router-dom'
import type { Partner } from '@/lib/types/partners'

interface PartnersCarouselProps {
  partners: Partner[]
  title?: string
  seeAllText?: string
}

const PartnersCarousel = ({
  partners,
  title = 'Our Partners',
  seeAllText = 'View All',
}: PartnersCarouselProps) => {
  if (!partners || partners.length === 0) return null

  return (
    <section>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header with elegant typography */}
        <div className="flex justify-between items-end px-6 mb-10">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 block">
              Trusted Network
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground text-balance">
              {title}
            </h2>
          </div>

          <Link
            to="/partners"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap flex items-center gap-2 group"
          >
            {seeAllText}
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        <Carousel opts={{ align: 'start', loop: true }} className="w-full px-6">
          <CarouselContent className="-ml-4">
            {partners.map(partner => (
              <CarouselItem
                key={partner.id}
                className="pl-4 cursor-pointer basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <PartnerCard partner={partner} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 bg-card border-border hover:bg-secondary hover:text-primary" />
          <CarouselNext className="hidden md:flex -right-4 bg-card border-border hover:bg-secondary hover:text-primary" />
        </Carousel>
      </div>
    </section>
  )
}

export default PartnersCarousel
