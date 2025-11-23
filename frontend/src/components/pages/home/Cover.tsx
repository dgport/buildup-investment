import { Building2, Building, Home, Store, MapPin } from 'lucide-react'

export default function Cover() {
  return (
    <div className="w-full pt-6">
      <div
        className="relative w-full h-[500px] bg-cover bg-center rounded-3xl"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop)',
        }}
      >
        <div className="relative z-10 container mx-auto  h-full flex flex-col justify-center items-center text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Find Your Dream Property
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl drop-shadow-lg">
              Discover the perfect home, apartment, or commercial space that
              matches your vision
            </p>
          </div>
        </div>
      </div>

      <div className="w-full py-12">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <a
            href="/projects"
            className="group relative bg-linear-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-blue-200/50 hover:border-blue-300"
          >
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                Construction Projects
              </h3>
            </div>
          </a>

          <a
            href="/apartments"
            className="group relative bg-linear-to-br from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-emerald-200/50 hover:border-emerald-300"
          >
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Building className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                Developer Apartments
              </h3>
            </div>
          </a>

          <a
            href="/residential"
            className="group relative bg-linear-to-br from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-amber-200/50 hover:border-amber-300"
          >
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Home className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                Residential
              </h3>
            </div>
          </a>

          <a
            href="/commercial"
            className="group relative bg-linear-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-purple-200/50 hover:border-purple-300"
          >
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Store className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                Commercial
              </h3>
            </div>
          </a>

          <a
            href="/lands"
            className="group relative bg-linear-to-br from-teal-50 to-teal-100/50 hover:from-teal-100 hover:to-teal-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border border-teal-200/50 hover:border-teal-300"
          >
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                Land for Sale
              </h3>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
