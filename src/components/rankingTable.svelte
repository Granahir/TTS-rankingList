<script>
  const spreadsheetId = '1s-f2RdWFbBhl7T3Hrxpsc845gY6zTPVPb9kGDtvjdGc'
  const sheetName = 'All events players have played in'

  let tableHeaders = ['Rank', 'Name', 'Rating', 'Age', 'Gender', 'Club']

  let fetchedData = $state([])
  let playerData = $state([])

  let genderGroups = ['Female', 'Male', 'Mixed']
  let ageGroups = ['Juniors', 'Seniors', 'Open']

  let selectedGenderGroup = $state('Mixed')
  let selectedAgeGroup = $state('Open')

  fetch(
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`
  )
    .then(response => response.text())
    .then(data => {
      const jsonStart = data.indexOf('google.visualization.Query.setResponse(') + 39
      const jsonEnd = data.lastIndexOf(');')
      const jsonString = data.slice(jsonStart, jsonEnd)
      const json = JSON.parse(jsonString)

      // Extract headers
      const headers = json.table.cols.map(col => col.label)

      // Transform rows to objects
      const dataObjects = json.table.rows.map(row => {
        const obj = {}
        row.c.forEach((cell, index) => {
          obj[headers[index]] = cell ? cell.v : null // Handle null/empty cells
        })
        return obj
      })

      fetchedData = dataObjects
    })
    .catch(error => console.error('Error:', error))

  const processRankingList = () => {
    playerData = fetchedData
      .filter(player => {
        if (selectedGenderGroup === 'Mixed') {
          return true
        } else if (selectedGenderGroup === 'Female') {
          return player['Sex'] === 'F'
        } else if (selectedGenderGroup === 'Male') {
          return player['Sex'] === 'M'
        }
      })
      .filter(player => {
        // Data unavailable for now
        return true
      })
      .toSorted((a, b) => b.Rating - a.Rating)
      .map((player, i) => ({
        Rank: i + 1,
        Name: player['Name'],
        Rating: player['Rating'],
        Age: undefined,
        Gender: player['Sex'],
        Club: player['PrimaryClub'],
        stDev: +player['StDev'],
        playerID: player['ID']
      }))
  }

  $effect(() => {
    ;(selectedGenderGroup, selectedAgeGroup, processRankingList())
  })
</script>

<div class="tableNav-container">
  <div class="nav-container">
    <h3>Gender Groups</h3>
    <div class="button-container">
      <button
        class:selected={selectedGenderGroup === 'Female'}
        onclick={() => (selectedGenderGroup = 'Female')}>Female</button>
      <button
        class:selected={selectedGenderGroup === 'Male'}
        onclick={() => (selectedGenderGroup = 'Male')}>Male</button>
      <button
        class:selected={selectedGenderGroup === 'Mixed'}
        onclick={() => (selectedGenderGroup = 'Mixed')}>Mixed</button>
    </div>
  </div>

  <div class="nav-container">
    <h3>Age Divisions</h3>
    <div class="button-container">
      <button
        class:selected={selectedAgeGroup === 'Juniors'}
        onclick={() => (selectedAgeGroup = 'Juniors')}
        disabled>Juniors</button>
      <button
        class:selected={selectedAgeGroup === 'Seniors'}
        onclick={() => (selectedAgeGroup = 'Seniors')}
        disabled>Seniors</button>
      <button
        class:selected={selectedAgeGroup === 'Open'}
        onclick={() => (selectedAgeGroup = 'Open')}
        disabled>Open</button>
    </div>
  </div>

  <div class="nav-container">
    <h3>Accuracy</h3>
    <div class="colourKey">
      <div class="colourKey-container">
        <div class="colourRect accurateColour"></div>
        <span>Accurate</span>
      </div>
      <div class="colourKey-container">
        <div class="colourRect fairlyAccurateColour"></div>
        <span>Fairly accurate</span>
      </div>
      <div class="colourKey-container">
        <div class="colourRect mediumAccuracyColour"></div>
        <span>Medium accuracy</span>
      </div>
      <div class="colourKey-container">
        <div class="colourRect lowAccuracyColour"></div>
        <span>Low accuracy</span>
      </div>
      <div class="colourKey-container">
        <div class="colourRect noAccuracyColour"></div>
        <span> Not enough games played</span>
      </div>
    </div>
  </div>
</div>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="table-container" tabindex="0" role="region" aria-labelledby="tableCaption_01">
  {#if playerData.length > 0}
    <table>
      <caption id="tableCaption_01">Player ranking list of Table-Tennis Scotland</caption>
      <colgroup>
        <col class="col-rank" />
        <col class="col-name" />
        <col class="col-rating" />
        <col class="col-age" />
        <col class="col-gender" />
        <col class="col-club" />
      </colgroup>

      <thead>
        <tr>
          {#each tableHeaders as header}
            <th scope="column">{header}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each playerData as player, i}
          <tr>
            {#each tableHeaders as header}
              {#if header === 'Name'}
                <th scope="row">
                  <a
                    href={`https://www.ratingscentral.com/Player.php?PlayerID=${player['playerID']}`}
                    target="_blank">{player[header]}</a>
                </th>
              {:else}
                <td>
                  {player[header]}
                  {#if header === 'Rating'}
                    <div
                      class="colourRect"
                      class:accurateColour={player['stDev'] <= 50}
                      class:fairlyAccurateColour={player['stDev'] > 50 && player['stDev'] <= 75}
                      class:mediumAccuracyColour={player['stDev'] > 75 && player['stDev'] <= 100}
                      class:lowAccuracyColour={player['stDev'] > 100 && player['stDev'] <= 150}
                      class:noAccuracyColour={player['stDev'] > 150}>
                    </div>
                  {/if}
                </td>
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>Loading...</p>
  {/if}
</div>

<style>
  /* Nav */
  .tableNav-container {
    display: grid;
    grid-template-columns: 33.333% 33.333% 33.333%;
    padding: 1rem 0 4rem 0;
    text-align: center;
  }

  .colourKey {
    margin: 0 auto;
  }
  .colourKey-container {
    display: grid;
    grid-template-columns: 1rem auto;
    padding: 0.25rem 0;
    text-align: start;
  }
  .colourRect {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    display: inline-block;
  }
  .colourKey-container span {
    padding: 0 1rem;
  }

  .accurateColour {
    background-color: var(--TTS-accurate-rating);
  }

  .fairlyAccurateColour {
    background-color: var(--TTS-fairly-accurate-rating);
  }

  .mediumAccuracyColour {
    background-color: var(--TTS-medium-accuracy-rating);
  }

  .lowAccuracyColour {
    background-color: var(--TTS-low-accuracy-rating);
  }

  .noAccuracyColour {
    background-color: var(--TTS-no-accuracy-rating);
  }

  /* Table CSS */
  .table-container {
    overflow: auto;
    max-height: 80vh;
    border: 1px solid var(--TTS-purple-light);
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
  }

  table col.col-rank,
  table col.col-rating,
  table col.col-gender,
  table col.col-age,
  table col.col-club {
    width: 5rem;
  }

  table col.col-rating {
    width: 7rem;
  }

  caption {
    display: none;
  }

  th,
  caption {
    text-align: start;
  }

  caption {
    margin-block: 0.75rem;
  }

  thead {
    border: 1px solid var(--TTS-purple);
    background: var(--TTS-purple);
    color: white;
    position: sticky;
    top: 0;
  }
  thead th {
    vertical-align: bottom;
    text-align: center;
  }

  thead,
  td {
    text-align: center;
  }

  th,
  td {
    border: 1px solid lightgrey;
    padding: 0.25rem 0.75rem;
    vertical-align: baseline;
  }
  th:first-of-type {
    width: 10rem;
  }

  /* tbody tr:nth-child(even),
  thead tr:nth-child(even) {
    background: var(--TTS-purple-light);
  } */
</style>
