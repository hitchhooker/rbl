import solid from "solid-start/vite";
import { defineConfig } from "vite";
import UnoCSS from '@unocss/vite'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetAttributify from '@unocss/preset-attributify'

export default defineConfig({
  plugins: [
    solid(),
    UnoCSS({
      shortcuts: [
        { logo: 'i-logos-solidjs-icon w-6em h-6em transform transition-800 hover:rotate-360' },
      ],
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
        }),
	presetWebFonts({
	  provider: 'google', // default provider
	  fonts: {
	    // these will extend the default theme
	    sans: 'Roboto',
	    mono: ['Fira Code', 'Fira Mono:400,700'],
	    // custom ones
	    lobster: 'Lobster',
	    lato: [
	      {
		name: 'Lato',
		weights: ['400', '700'],
		italic: true,
	      },
	      {
		name: 'sans-serif',
		provider: 'none',
	      },
	    ],
	  },
	})
      ],
    }), 
  ],

  ssr: {
    // Avoiding SSR for WebSocket and event-listener packages
    noExternal: ["@solid-primitives/websocket", "@solid-primitives/event-listener"],
  },

  server: {
    port: 6050,
    proxy: {
      // WebSocket proxying
      '/ws': {
        target: process.env.VITE_WS_URL,
        ws: true,
      },
    },
  },

  build: {
    target: 'esnext',
  }
});
