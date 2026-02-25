<script>
  import RankingTable from '$components/rankingTable.svelte'
</script>

<div class="embed-space">
  <div class="embed-container">
    <h1 class="center">TTS Ranking list</h1>
    <p>
      Table Tennis Scotland are launching a new player Ranking System, based on <a
        href="https://www.ratingscentral.com/GeneralInfo.php"
        target="_blank">Ratings Central</a> as the foundation for rating calculations. This ensures transparent,
      data-driven performance evaluation.
    </p>
    <p>
      Lists will be published after each national event. Although local results may be inputted in
      between times, national tournaments will take ratings from the last national event allowing
      national events to take priority.
    </p>
    <p>
      Players that have a Ratings Accuracy over 150 will not get a ranking position, players can
      play more frequently to keep their rating accurate
    </p>
    <p>
      <b>Full list</b> has all affiliated players that have played a competitive match<br /><b
        >Rating List</b>
      is a subset of the full list in which a player has played one eligible national event in the past
      12 months <br /><b>Ranking List</b> is a subset of the rating list of players that are eligible
      to play for Scotland and play in the National Championships (Self Selected by players - this needs
      to be checked)
    </p>
    <p>
      <br />
      Clicking on a player's name will allow you to see their match history (through RatingsCentral).
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
