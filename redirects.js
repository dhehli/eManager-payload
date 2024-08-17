module.exports = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        key: 'user-agent',
        type: 'header',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  try {
    const redirectsRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/redirects?limit=1000&depth=1`,
    )

    const contentType = redirectsRes.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      const redirectsData = await redirectsRes.json()
      const { docs } = redirectsData

      let dynamicRedirects = []

      if (docs) {
        docs.forEach((doc) => {
          const { from, to: { reference, type, url } = {} } = doc

          let source = from
            .replace(process.env.NEXT_PUBLIC_SERVER_URL, '')
            .split('?')[0]
            .toLowerCase()

          if (source.endsWith('/')) source = source.slice(0, -1) // a trailing slash will break this redirect

          let destination = '/'

          if (type === 'custom' && url) {
            destination = url.replace(process.env.NEXT_PUBLIC_SERVER_URL, '')
          }

          if (
            type === 'reference' &&
            typeof reference.value === 'object' &&
            reference?.value?._status === 'published'
          ) {
            destination = `${process.env.NEXT_PUBLIC_SERVER_URL}/${
              reference.relationTo !== 'pages' ? `${reference.relationTo}/` : ''
            }${reference.value.slug}`
          }

          const redirect = {
            destination,
            permanent: true,
            source,
          }

          if (source.startsWith('/') && destination && source !== destination) {
            return dynamicRedirects.push(redirect)
          }

          return
        })
      }

      const redirects = [internetExplorerRedirect, ...dynamicRedirects]
      return redirects
    } else {
      throw new Error('Non-JSON response received')
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`Error configuring redirects: ${error}`) // eslint-disable-line no-console
    }

    return [internetExplorerRedirect] // Return the IE redirect as a fallback
  }
}
