import type { CollectionConfig } from 'payload/types'

const ContentType: CollectionConfig = {
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      required: true,
      type: 'text',
      unique: true,
    },
  ],
  slug: 'content-types',
}

export default ContentType
