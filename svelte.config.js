import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({fallback: '404.html'}),
		embedded: true,
		paths: { base: process.argv.includes('dev') ? '' : '/TTS-rankingList' },
		alias: {
		$css: 'src/css',
		$components: 'src/components'
	}
	
	}
};

export default config;
