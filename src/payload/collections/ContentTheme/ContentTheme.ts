import type { CollectionConfig } from 'payload/types'

const ContentTheme: CollectionConfig = {
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
  slug: 'content-themes',
}

export default ContentTheme
