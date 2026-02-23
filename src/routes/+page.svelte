<script>
  import RankingTable from '$components/rankingTable.svelte'
</script>

<div class="embed-space">
  <div class="embed-container">
    <h1 class="center">TTS Ranking list</h1>
    <p>
      This section is introducing the ranking list. Lorem ipsum dolor sit amet consectetur
      adipisicing elit. Aperiam asperiores numquam explicabo ex debitis, nulla laborum dicta eveniet
      assumenda esse beatae? Delectus explicabo autem repudiandae quos debitis, vitae aspernatur
      eveniet! Lorem ipsum dolor sit, amet consectetur adipisicing elit. Perspiciatis unde in autem
      fuga nobis totam neque impedit? Neque a rerum reprehenderit laboriosam tempora animi libero
      repellendus praesentium dicta. Assumenda, minus!
    </p>
    <p class="center">
      Clicking on a player's name or club will allow you to see their match history or their club's
      information (through RatingsCentral). Maybe we should "embed" our own match history without
      redirecting to RatingsCentral? Use the filters below to check out the different categories:
    </p>

    <hr />

    <RankingTable />

    <div class="spaceFiller"></div>
  </div>
</div>

<style>
  hr {
    margin: 4rem 0;
  }

  .spaceFiller {
    height: 5rem;
  }
</style>
