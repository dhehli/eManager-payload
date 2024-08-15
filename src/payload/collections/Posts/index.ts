import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { adminsOrPublished } from '../../access/adminsOrPublished'
import { Archive } from '../../blocks/ArchiveBlock'
import { CallToAction } from '../../blocks/CallToAction'
import { Content } from '../../blocks/Content'
import { ContentMedia } from '../../blocks/ContentMedia'
import { MediaBlock } from '../../blocks/MediaBlock'
import { hero } from '../../fields/hero'
import { slugField } from '../../fields/slug'
import { populateArchiveBlock } from '../../hooks/populateArchiveBlock'
import { populatePublishedDate } from '../../hooks/populatePublishedDate'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidatePost } from './hooks/revalidatePost'

export const Posts: CollectionConfig = {
  access: {
    create: admins,
    delete: admins,
    read: adminsOrPublished,
    update: admins,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) => `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/posts/${data?.slug}`,
    },
    preview: (doc) => {
      return `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/preview?url=${encodeURIComponent(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/posts/${doc?.slug as string}`,
      )}&secret=${process.env.PAYLOAD_PUBLIC_DRAFT_SECRET}`
    },
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      required: true,
      type: 'text',
    },
    {
      name: 'categories',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'categories',
      type: 'relationship',
    },
    {
      name: 'publishedOn',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
      type: 'date',
    },
    {
      name: 'authors',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
      required: false,
      type: 'relationship',
    },
    {
      name: 'type',
      admin: {
        position: 'sidebar',
      },
      label: 'Content Type',
      relationTo: 'content-types',
      required: true,
      type: 'relationship',
    },
    {
      name: 'themes',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      label: 'Content Themes',
      relationTo: 'content-themes',
      type: 'relationship',
    },
    {
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              blocks: [CallToAction, Content, ContentMedia, MediaBlock, Archive],
              required: true,
              type: 'blocks',
            },
            {
              name: 'enablePremiumContent',
              label: 'Enable Premium Content',
              type: 'checkbox',
            },
            {
              name: 'premiumContent',
              access: {
                read: ({ req }) => req.user,
              },
              blocks: [CallToAction, Content, MediaBlock, Archive],
              type: 'blocks',
            },
          ],
          label: 'Content',
        },
      ],
      type: 'tabs',
    },
    {
      name: 'relatedPosts',
      filterOptions: ({ id }) => ({ id: { not_in: [id] } }),
      hasMany: true,
      relationTo: 'posts',
      type: 'relationship',
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateArchiveBlock, populateAuthors],
    beforeChange: [populatePublishedDate],
  },
  slug: 'posts',
  versions: {
    drafts: true,
  },
}
