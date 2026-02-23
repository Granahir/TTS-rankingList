<script>
  import favicon from '$lib/assets/favicon.svg'
  import '$css/fonts.css'
  import '$css/colours.css'
  import '$css/base.css'
  import '$css/theme.css'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta charset="utf-8" />
</svelte:head>

<div class="cssReset">
  {@render children()}
</div>
