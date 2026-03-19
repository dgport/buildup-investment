export const getImageUrl = (
  imagePath?: string,
  apiUrl: string = import.meta.env.VITE_API_IMAGE_URL
): string => {
  if (!imagePath) return '/placeholder.svg'

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${apiUrl}${cleanPath}`
}
