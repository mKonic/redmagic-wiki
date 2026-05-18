import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Red Magic Wiki',
  description: 'Community knowledge base for Red Magic / Nubia (ZTE) device modding: bootloader unlock, root, EDL recovery, kernel work',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: 'localhostLinks',

  head: [
    ['meta', { name: 'theme-color', content: '#dc2626' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Red Magic Wiki' }],
    ['meta', { property: 'og:description', content: 'Community knowledge base for Red Magic / Nubia (ZTE) device modding' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Devices',
        items: [
          { text: 'Red Magic 10 Pro (NX789J)', link: '/rm10pro/' },
          { text: 'Red Magic 11 Pro — cross-reference', link: '/rm11pro/toolbox-cross-reference' },
        ],
      },
      { text: 'Contributing', link: '/contributing' },
    ],

    sidebar: {
      '/rm10pro/': [
        {
          text: 'Red Magic 10 Pro (NX789J)',
          items: [
            { text: 'Overview', link: '/rm10pro/overview' },
          ],
        },
        {
          text: 'Bootloader unlock',
          collapsed: false,
          items: [
            { text: 'Status & history', link: '/rm10pro/bootloader-unlock-status' },
            { text: 'ZTE Family Toolbox', link: '/rm10pro/zte-family-toolbox' },
          ],
        },
        {
          text: 'Firmware & flashing',
          collapsed: false,
          items: [
            { text: 'ROM / firmware releases', link: '/rm10pro/rom-firmware' },
            { text: 'EDL / 9008 mode', link: '/rm10pro/edl-9008' },
            { text: 'BD_Security EDL root guide', link: '/rm10pro/bd-security-edl-root' },
          ],
        },
        {
          text: 'Root & recovery',
          collapsed: false,
          items: [
            { text: 'Magisk / KernelSU', link: '/rm10pro/root-magisk' },
            { text: 'Partitions, AVB, vbmeta', link: '/rm10pro/partitions-avb' },
            { text: 'Custom recovery (TWRP)', link: '/rm10pro/recovery-twrp' },
            { text: 'De-Googling without root', link: '/rm10pro/degoogling-no-root' },
          ],
        },
        {
          text: 'Deeper',
          collapsed: false,
          items: [
            { text: 'Kernel source', link: '/rm10pro/kernel-source' },
            { text: 'Reverse engineering', link: '/rm10pro/reverse-engineering' },
          ],
        },
        {
          text: 'Reference',
          collapsed: false,
          items: [
            { text: 'Known issues & bricks', link: '/rm10pro/known-issues' },
            { text: 'Contributors', link: '/rm10pro/contributors' },
          ],
        },
      ],

      '/rm11pro/': [
        {
          text: 'Red Magic 11 Pro',
          items: [
            { text: 'Toolbox cross-reference', link: '/rm11pro/toolbox-cross-reference' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mKonic/redmagic-wiki' },
    ],

    editLink: {
      pattern: 'https://github.com/mKonic/redmagic-wiki/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the CC BY-SA 4.0 license.',
      copyright: 'Compiled by community contributors. Not affiliated with ZTE / Nubia / RedMagic.',
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },
  },
})
