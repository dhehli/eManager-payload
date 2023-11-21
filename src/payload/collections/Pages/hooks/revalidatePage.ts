import type { AfterChangeHook } from 'payload/dist/collections/config/types'

import { revalidate } from '../../../utilities/revalidate'

// Revalidate the page in the background, so the user doesn't have to wait
// Notice that the hook itself is not async and we are not awaiting `revalidate`
// Only revalidate existing docs that are published
// Don't scope to `operation` in order to purge static demo pages
export const revalidatePage: AfterChangeHook = async ({ doc, req: { payload } }) => {
  console.log(doc)
  if (doc._status === 'published') {
    try {
      await revalidate({ collection: 'pages', payload, slug: doc.slug })
    } catch (error) {
      // do not output error on build
    }
  }

  return doc
}
