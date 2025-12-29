import { useEffect, useRef, useState } from 'react'

const switchingTexts = [
  'Premium Properties',
  'Strategic Investments',
  'Luxury Developments',
  'Global Opportunities',
  'Secure Returns',
]

export default function VideoCover() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.currentTime >= 15) {
        video.currentTime = 0
        video.play()
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentTextIndex(prev => (prev + 1) % switchingTexts.length)
        setIsAnimating(false)
      }, 500)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[60vh] pt-20 sm:h-screen overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/Video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/70 via-teal-800/50 to-teal-950/80" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />

      {/* Content centered */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-8 text-center max-w-full pb-20 sm:pb-0">
        {/* Switching text */}
        <div className="relative h-12 sm:h-24 md:h-28 w-full flex items-center justify-center overflow-hidden">
          <h1
            className={`text-xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white transition-all duration-500 px-2 ${
              isAnimating
                ? 'opacity-0 translate-y-8'
                : 'opacity-100 translate-y-0'
            }`}
            style={{ wordBreak: 'break-word', hyphens: 'auto' }}
          >
            {switchingTexts[currentTextIndex]}
          </h1>
        </div>

        {/* Subtitle */}
        <p className="mt-3 sm:mt-6 text-sm sm:text-lg md:text-xl text-amber-100/80 max-w-xs sm:max-w-lg md:max-w-2xl leading-relaxed px-2">
          Your gateway to exceptional real estate opportunities in Georgia's
          most desirable locations
        </p>

        {/* Indicator dots */}
        <div className="flex gap-1.5 sm:gap-2 mt-4 sm:mt-8">
          {switchingTexts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTextIndex(index)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentTextIndex
                  ? 'bg-amber-400 w-4 sm:w-8'
                  : 'bg-amber-100/40 hover:bg-amber-100/60'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 mt-5 sm:mt-12 w-full sm:w-auto px-4 sm:px-0">
          <button className="px-5 sm:px-8 py-2.5 sm:py-4 bg-amber-400 hover:bg-amber-300 text-teal-950 font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-400/20 text-xs sm:text-base">
            Explore Properties
          </button>
        </div>
      </div>

      {/* Wave transition */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-24 sm:h-28 md:h-32">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,0 C300,80 600,80 900,40 C1050,20 1150,0 1200,0 L1200,120 L0,120 Z"
            fill="#FAFAF8"
            opacity="0.9"
          />
          <path
            d="M0,20 C300,100 600,100 900,60 C1050,40 1150,20 1200,20 L1200,120 L0,120 Z"
            fill="#FAFAF8"
          />
        </svg>
      </div>

      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
        <span className="text-amber-400/60 text-xs tracking-widest rotate-[-90deg] origin-center whitespace-nowrap">
          SINCE 2022
        </span>
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
      </div>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 items-center">
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
        <span className="text-amber-400/60 text-xs tracking-widest rotate-90 origin-center whitespace-nowrap">
          GEORGIA
        </span>
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
      </div>
    </div>
  )
}
