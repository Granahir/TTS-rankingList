<svg width="1rem" height="1rem">
  <defs>
    <!-- High: 3px cross-hatch for density without blur -->
    <pattern
      id="hatch-high"
      width="3"
      height="3"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="3" y2="3" stroke="var(--TTS-purple)" stroke-width="0.75" />
      <line x1="0" y1="3" x2="3" y2="0" stroke="var(--TTS-purple)" stroke-width="0.75" />
    </pattern>
  </defs>

  <circle
    cx="0.5rem"
    cy="0.5rem"
    r="0.45rem"
    stroke="var(--TTS-purple)"
    stroke-width="2px"
    fill="url(#hatch-high)" />
</svg>
