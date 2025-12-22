import type { Handler } from '@netlify/functions'

const API_URL = 'https://api.unitedcompany.ge/api'
const IMAGE_URL = 'https://api.unitedcompany.ge'
const SITE_URL = 'https://unitedcompany.ge'

const handler: Handler = async event => {
  const path = event.queryStringParameters?.path || ''

  // Check if project or apartment page
  const projectMatch = path.match(/\/projects\/(\d+)/)
  const apartmentMatch = path.match(/\/apartments\/(\d+)/)

  if (!projectMatch && !apartmentMatch) {
    return { statusCode: 404, body: 'Not found' }
  }

  try {
    let title = 'United Construction'
    let description = 'Premium real estate in Georgia'
    let imageUrl = `${SITE_URL}/og-default.jpg`
    let pageUrl = SITE_URL

    if (projectMatch) {
      const id = projectMatch[1]
      const response = await fetch(`${API_URL}/projects/${id}`)
      const project = await response.json()

      title =
        project.translation?.projectName || project.projectName || 'Project'
      description =
        project.translation?.description?.substring(0, 160) ||
        `Explore ${title} in ${project.regionName || 'Batumi'}`

      if (project.priceFrom) {
        description += ` Starting from $${project.priceFrom.toLocaleString()}.`
      }

      const image = project.image || project.gallery?.[0]
      if (image) {
        imageUrl = image.startsWith('http') ? image : `${IMAGE_URL}${image}`
      }

      pageUrl = `${SITE_URL}/projects/${id}`
    } else if (apartmentMatch) {
      const id = apartmentMatch[1]
      const response = await fetch(`${API_URL}/apartments/${id}`)
      const apartment = await response.json()

      title = `Apartment ${apartment.apartmentNumber} | ${apartment.projectName || 'United Construction'}`
      description =
        apartment.translation?.description?.substring(0, 160) ||
        `${apartment.rooms || ''} rooms, ${apartment.area || ''}m²`

      if (apartment.price) {
        description += ` - $${apartment.price.toLocaleString()}`
      }

      if (apartment.image) {
        imageUrl = apartment.image.startsWith('http')
          ? apartment.image
          : `${IMAGE_URL}${apartment.image}`
      }

      pageUrl = `${SITE_URL}/apartments/${id}`
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}" />
  <meta name="description" content="${description}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${pageUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  
  <!-- Redirect regular users to React app -->
  <script>
    if (!/bot|crawler|spider|facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp/i.test(navigator.userAgent)) {
      window.location.href = '${pageUrl}';
    }
  </script>
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p>Loading...</p>
</body>
</html>`

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
      body: html,
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: 'Error generating page',
    }
  }
}

export { handler }
