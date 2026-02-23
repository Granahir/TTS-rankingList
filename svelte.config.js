import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		embedded: true,
		paths: { base: process.env.BASE_PATH || '' },
		alias: {
		$css: 'src/css',
		$components: 'src/components'
	}
	
	}
};

export default config;
