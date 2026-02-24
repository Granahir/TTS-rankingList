<script>
  import { SvelteMap } from 'svelte/reactivity'

  const spreadsheetId = '1s-f2RdWFbBhl7T3Hrxpsc845gY6zTPVPb9kGDtvjdGc'
  const sheetName = 'Full List'

  let tableHeaders = ['Rank', 'Name', 'Rating', 'Gender', 'Club']

  let fetchedData = $state([])
  let playerData = $state([])

  let genderGroups = ['Female', 'Male', 'Mixed']
  let ageGroups = ['Open', 'U13', 'U15', 'U17', 'U19', 'U21', 'O40', 'O50', 'O60', 'O70', 'O75']
  let lists = ['Full', 'Rating', 'Ranking']

  let selectedGenderGroup = $state('Mixed')
  let selectedAgeGroup = $state('Open')
  let selectedList = $state('Full')

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
    let counter = 0

    playerData = fetchedData
      .filter(player => {
        if (selectedGenderGroup === 'Mixed') {
          return true
        } else if (selectedGenderGroup === 'Female') {
          return player['Gender'] === 'Female'
        } else if (selectedGenderGroup === 'Male') {
          return player['Gender'] === 'Male'
        }
      })
      .filter(player => {
        if (selectedAgeGroup === 'Open') {
          return true
        } else {
          return player[selectedAgeGroup]
        }
      })
      .filter(player => {
        if (selectedList === 'Full') {
          return true
        } else if (selectedList === 'Rating') {
          return player['played in 12 months']
        } else if (selectedList === 'Ranking') {
          return player['played in 12 months'] && player['Scottish eligibility']
        }
      })
      .toSorted((a, b) => b.Rating - a.Rating)
      .map((player, i) => {
        counter += +player['StDev'] > 150 ? 0 : 1

        return {
          Rank: +player['StDev'] > 150 ? '' : counter,
          Name: player['Name'],
          Rating: player['Rating'],
          Age: undefined,
          Gender: player['Gender'],
          Club: player['PrimaryClub'],
          stDev: +player['StDev'],
          playerID: player['ID']
        }
      })
  }

  $effect(() => {
    ;(selectedGenderGroup, selectedAgeGroup, selectedList, processRankingList())
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
    <h3>List</h3>
    <div class="button-container">
      <button class:selected={selectedList === 'Full'} onclick={() => (selectedList = 'Full')}
        >Full</button>
      <button class:selected={selectedList === 'Rating'} onclick={() => (selectedList = 'Rating')}
        >Rating</button>
      <button class:selected={selectedList === 'Ranking'} onclick={() => (selectedList = 'Ranking')}
        >Ranking</button>
    </div>
  </div>

  <div class="nav-container">
    <h3>Age Divisions</h3>
    <div class="dropdown-container">
      <select bind:value={selectedAgeGroup}>
        {#each ageGroups as ageGroup}
          <option value={ageGroup}>{ageGroup}</option>
        {/each}
      </select>
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
      <caption id="tableCaption_01">Player ranking of Table-Tennis Scotland</caption>
      <colgroup>
        <col class="col-rank" />
        <col class="col-name" />
        <col class="col-rating" />
        <!-- <col class="col-age" /> -->
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
  table col.col-age {
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
  tbody td:last-child {
    font-size: calc(var(--TTS-font-size) * 0.85);
  }

  /* tbody tr:nth-child(even),
  thead tr:nth-child(even) {
    background: var(--TTS-purple-light);
  } */
</style>
