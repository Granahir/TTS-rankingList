<script>
  import AccurateCircle from '$components/AccurateCircle.svelte'
  import FairlyAccurateCircle from '$components/FairlyAccurateCircle.svelte'
  import MediumAccuracyCircle from '$components/MediumAccuracyCircle.svelte'
  import LowAccuracyCircle from '$components/LowAccuracyCircle.svelte'
  import NoAccuracyCircle from '$components/NoAccuracyCircle.svelte'
  import { match } from '$app/paths'

  const spreadsheetId = '1s-f2RdWFbBhl7T3Hrxpsc845gY6zTPVPb9kGDtvjdGc'
  const sheetName = 'Full List'
  let width = $state()

  let tableHeaders = ['Rank', 'Name', 'Rating', 'Gender', 'Club']

  let fetchedData = $state([])
  let playerData = $state([])

  let genderGroups = ['Female', 'Male', 'Mixed']
  let ageGroups = ['Open', 'U13', 'U15', 'U17', 'U19', 'U21', 'O40', 'O50', 'O60', 'O70', 'O75']
  let lists = ['Full', 'Rating', 'Ranking']

  let selectedGenderGroup = $state('Mixed')
  let selectedAgeGroup = $state('Open')
  let selectedList = $state('Full')

  let searchInput = $state('')

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
      .filter(player => {
        if (searchInput === '') {
          return true
        } else {
          return player['Name'].toLowerCase().includes(searchInput.toLowerCase())
        }
      })
  }

  const resetFilters = () => {
    selectedGenderGroup = 'Mixed'
    selectedAgeGroup = 'Open'
    selectedList = 'Full'
    searchInput = ''
  }

  $effect(() => {
    ;(selectedGenderGroup, selectedAgeGroup, selectedList, searchInput, processRankingList())
  })
</script>

<div class="tableNav-container" bind:clientWidth={width}>
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
</div>

<div class="legend-container">
  <h3 class="center">Rating accuracy</h3>
  <!-- <div class="colourKey">
      <div class="colourKey-container">
        <AccurateCircle />
        <span>Accurate</span>
      </div>
      <div class="colourKey-container">
        <FairlyAccurateCircle />
        <span>Fairly accurate</span>
      </div>
      <div class="colourKey-container">
        <MediumAccuracyCircle />
        <span>Medium accuracy</span>
      </div>
      <div class="colourKey-container">
        <LowAccuracyCircle />
        <span>Low accuracy</span>
      </div>
      <div class="colourKey-container">
        <NoAccuracyCircle />
        <span> Not enough games played</span>
      </div>
    </div> -->

  <div class="pattern-container">
    <span>Less accurate</span>
    <span>◀</span>
    <NoAccuracyCircle />
    <LowAccuracyCircle />
    <MediumAccuracyCircle />
    <FairlyAccurateCircle />
    <AccurateCircle />
    <span>▶</span>
    <span>More accurate </span>
  </div>
</div>

<div class="table-nav">
  <input
    bind:value={searchInput}
    type="text"
    id="searchInput"
    placeholder={width > 600 ? 'Search for players...' : 'Search...'} />
  <div />
  <button id="resetButton" onclick={resetFilters}>Reset filters</button>
</div>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="table-container" tabindex="0" role="region" aria-labelledby="tableCaption_01">
  {#if playerData.length > 0}
    <table>
      <caption id="tableCaption_01">Player ranking of Table-Tennis Scotland</caption>
      <colgroup>
        <col class="col-rank Rank-cell" />
        <col class="col-name Name-cell" />
        <col class="col-rating Rating-cell" />
        <col class="col-gender Gender-cell" />
        <col class="col-club Club-cell" />
      </colgroup>

      <thead>
        <tr>
          {#each tableHeaders as header}
            <th scope="column" class="{header}-cell">{header}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each playerData as player, i}
          <tr>
            {#each tableHeaders as header}
              {#if header === 'Name'}
                <th scope="row" class="{header}-cell">
                  <a
                    href={`https://www.ratingscentral.com/Player.php?PlayerID=${player['playerID']}`}
                    target="_blank">{player[header]}</a>
                </th>
              {:else}
                <td class="{header}-cell">
                  {player[header]}
                  {#if header === 'Rating'}
                    {#if player['stDev'] <= 50}<AccurateCircle />{:else if player['stDev'] > 50 && player['stDev'] <= 75}
                      <FairlyAccurateCircle />
                    {:else if player['stDev'] > 75 && player['stDev'] <= 100}<MediumAccuracyCircle />
                    {:else if player['stDev'] > 100 && player['stDev'] <= 150}
                      <LowAccuracyCircle />
                    {:else}
                      <NoAccuracyCircle />{/if}
                    <!-- <div
                      class="colourRect"
                      class:accurateColour={player['stDev'] <= 50}
                      class:fairlyAccurateColour={player['stDev'] > 50 && player['stDev'] <= 75}
                      class:mediumAccuracyColour={player['stDev'] > 75 && player['stDev'] <= 100}
                      class:lowAccuracyColour={player['stDev'] > 100 && player['stDev'] <= 150}
                      class:noAccuracyColour={player['stDev'] > 150}>
                    </div> -->
                  {/if}
                </td>
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>
      {#if fetchedData.length === 0}
        Loading...
      {:else}
        No match
      {/if}
    </p>
  {/if}
</div>

<style>
  /* Nav */
  .tableNav-container {
    display: grid;
    grid-template-columns: 33.333% 33.333% 33.333%;
    padding: 1rem 0 2rem 0;
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
  /* .colourKey-container span {
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
  } */

  .legend-container {
    padding-bottom: 4rem;
  }
  .pattern-container {
    display: grid;
    padding: 0 1rem;
    grid-template-columns: 1fr 2rem 2rem 2rem 2rem 2rem 2rem 2rem 1fr;
    margin: 0 auto;
    justify-items: center;
  }
  .pattern-container span:first-child {
    justify-self: end;
    text-align: end;
  }
  .pattern-container span:last-child {
    justify-self: start;
    text-align: start;
  }

  .table-nav {
    display: grid;
    border-radius: 1rem 1rem 0 0;
    grid-template-columns: 12rem auto 8rem;
    background-color: var(--TTS-purple);
    border: 2px solid var(--TTS-purple-light);
    border-bottom-color: var(--TTS-purple);
    padding: 0.5rem;
  }
  .table-nav input {
    color: white;
    border-radius: 1.5rem;
    padding: 0.5rem;
    background-color: var(--TTS-purple);
    border-color: white;

    padding-left: 40px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: 12px center;
    background-size: 20px;
  }
  .table-nav input::placeholder {
    color: white;
  }
  .table-nav input:focus {
    outline: white;
  }
  #resetButton {
    width: 5rem;
    color: white;
    padding: 0.5rem 1rem;
    border-color: white;
    text-align: center;
    justify-self: end;
  }
  #resetButton:hover {
    color: white;
    font-weight: bold;
  }

  /* Table CSS */
  .table-container {
    overflow: auto;
    max-height: 80vh;
    border: 1px solid var(--TTS-purple-light);
    border-radius: 0 0 1rem 1rem;
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
  }

  table col.col-rank,
  table col.col-rating,
  table col.col-gender {
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
    z-index: 2;
  }
  thead th {
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
    vertical-align: middle;
  }
  th:first-of-type {
    width: 10rem;
  }
  tbody td:last-child {
    font-size: calc(var(--TTS-font-size) * 0.85);
  }

  @media screen and (max-width: 600px) {
    .pattern-container {
      padding: 0;
      grid-template-columns: 1fr 1.5rem 1.5rem 1.5rem 1.5rem 1.5rem 1.5rem 1.5rem 1fr;
    }

    .tableNav-container {
      display: block;
    }

    .table-nav {
      grid-template-columns: 7rem auto 6rem;
    }

    table col.col-rank {
      width: 2.5rem;
    }

    table col.col-rating {
      width: 4rem;
    }

    table .Name-cell {
      padding: 0 0.5rem;
    }
    table .Gender-cell {
      display: none;
    }

    th,
    td {
      padding: 0.5rem 0.1rem;
    }
  }
</style>
