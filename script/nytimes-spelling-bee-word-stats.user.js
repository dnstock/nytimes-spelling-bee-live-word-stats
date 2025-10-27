// ==UserScript==
// @name         Spelling Bee Word Stats (NY Times)
// @namespace    http://tampermonkey.net/
// @version      2025-02-22
// @description  Shows live word and letter statistics on the NYTimes Spelling Bee page.
// @author       Dan Harcsztark (dnstock)
// @source       https://github.com/dnstock/nytimes-spelling-bee-live-word-stats
// @match        https://www.nytimes.com/puzzles/spelling-bee*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nytimes.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

function generateWordStats() {
  const stats = { Total: 0, Lengths: {} }; // Uppercase for sorting purposes
  const words = document.querySelectorAll('.sb-anagram');

  words.forEach(span => {
    const word = span.textContent.trim();
    if (!word) return;
    const firstLetter = word[0].toLowerCase();
    const len = word.length;

    if(!stats.Lengths[len]) {
      stats.Lengths[len] = 0;
    }
    if (!stats[firstLetter]) {
      stats[firstLetter] = { words: [], total: 0 };
    }
    if (stats[firstLetter].words.includes(word)) return;
    stats[firstLetter][len] = (stats[firstLetter][len] || 0) + 1;
    stats[firstLetter].words.push(word);
    stats[firstLetter].total++;
    stats.Lengths[len]++;
    stats.Total++;
  });

  const sorted = Object.keys(stats).sort().reduce((acc, key) => {
    acc[key] = stats[key];
    return acc;
  }
  , {});

  return sorted;
}

// generateWordStats();

function createStatsTable(isVisible = true) {
  const stats = generateWordStats();
  const container = document.createElement('div');
  container.id = 'wordstats-container';
  const table = document.createElement('table');
  const headerRow = table.insertRow();
  headerRow.classList.add('wordstats-header');
  let letterCount = 0;

  // Create table headers
  const headers = ['Letter'];
  Object.keys(stats.Lengths).forEach(len => headers.push(len));
  headers.push('Total');
  headers.forEach(headerText => {
    const header = document.createElement('th');
    header.textContent = headerText;
    headerRow.appendChild(header);
  });

  // Populate table rows
  Object.keys(stats).forEach(letter => {
    if(letter.length > 1) return; // Skip non-letter keys
    const row = table.insertRow();

    const cellLetter = row.insertCell();
    cellLetter.classList.add('wordstats-letter');
    cellLetter.textContent = letter.toUpperCase();

    Object.keys(stats.Lengths).forEach(len => {
      const cell = row.insertCell();
      cell.textContent = stats[letter][len] || '-';
    });
    const cellTotal = row.insertCell();
    cellTotal.textContent = stats[letter].total;
    letterCount++;
  });

  // Create table footer
  const footerRow = table.insertRow();
  footerRow.classList.add('wordstats-footer');
  const footer = [letterCount];
  Object.keys(stats.Lengths).forEach(len => footer.push(stats.Lengths[len]));
  footer.push(stats.Total);
  footer.forEach(value => {
    const cell = footerRow.insertCell();
    cell.textContent = value;
  });

  // Add hover effect to highlight row and column
  table.addEventListener('mouseover', (event) => {
    const cell = event.target;
    if (cell.tagName !== 'TD' && cell.tagName !== 'TH') return;

    const row = cell.parentElement;
    const colIndex = Array.from(row.children).indexOf(cell);

    table.querySelectorAll('tr').forEach((tr, rowIndex) => {
      tr.children[colIndex].classList.add('wordstats-highlight');
      if (rowIndex === row.rowIndex) {
        tr.classList.add('wordstats-highlight');
      }
    });
  });

  table.addEventListener('mouseout', (event) => {
    const cell = event.target;
    if (cell.tagName !== 'TD' && cell.tagName !== 'TH') return;

    const row = cell.parentElement;
    const colIndex = Array.from(row.children).indexOf(cell);

    table.querySelectorAll('tr').forEach((tr, rowIndex) => {
      tr.children[colIndex].classList.remove('wordstats-highlight');
      if (rowIndex === row.rowIndex) {
        tr.classList.remove('wordstats-highlight');
      }
    });
  });

  // Print raw word stats to console
  console.log(stats);

  // Append word stats table to the DOM
  container.appendChild(table);
  container.style.display = isVisible ? 'block' : 'none';
  document.body.prepend(container);
}

function createMenu() {
  const menu = document.createElement('div');
  menu.id = 'wordstats-menu';

  const toggleButton = document.createElement('button');
  toggleButton.id = 'wordstats-button-toggle';
  toggleButton.textContent = '✦';
  toggleButton.style.border = '1px solid black';  // Initial state
  toggleButton.addEventListener('click', () => {
    const container = document.getElementById('wordstats-container');
    if(container.style.display === 'none') {
      toggleButton.style.border = '1px solid black';
      container.style.display = 'block';
    } else {
      toggleButton.style.border = 'none';
      container.style.display = 'none';
    }
  });
  menu.appendChild(toggleButton);

  const copyButton = document.createElement('button');
  copyButton.id = 'wordstats-button-copy';
  copyButton.textContent = '📎';
  copyButton.addEventListener('click', () => {
    const stats = generateWordStats();
    const statsString = JSON.stringify(stats, null, 2);
    navigator.clipboard.writeText(statsString).then(() => {
      console.log('Word stats copied to clipboard');
      alert('Word stats copied to clipboard');
    });
  });
  // menu.appendChild(copyButton);  // Uncomment to enable copy button

  document.body.appendChild(menu);
}

function createStylesheet() {
  // Add some basic styles to the word stats table
  const style = document.createElement('style');
  style.textContent = `
    #wordstats-menu {
      position: fixed;
      right: 0;
      top: 0;
      z-index: 9999;
      width: 35px;
      background-color: white;
      min-height: 56px;
      padding-right: 10px;
      padding-top: 10px;
    }

    #wordstats-menu button {
      min-height: 22px;
      width: 100%;
      font-size: 16px;
      border: none;
      cursor: pointer;
      background-color: #efefef;
    }

    #wordstats-menu button:hover {
      color: #efefef;
      background-color: #666;
    }

    #wordstats-container {
      position: fixed;
      overflow: auto;
      border: 1px solid black;
      right: 34px;
      top: 10px;
      z-index: 99999;
    }

    #wordstats-container table {
      border-collapse: collapse;
      background-color: white;
    }

    #wordstats-container th, #wordstats-container td {
      height: 22px;
      width: 60px;
      text-align: center;
      vertical-align: middle;
    }

    #wordstats-container th {
      border: 1px solid darkgray;
      border-bottom: 1px solid black;
      background-color: lightgray;
      font-weight: bold;
    }

    #wordstats-container td {
      border: 1px solid lightgray;
    }

    #wordstats-container .wordstats-footer td {
      color:#969696;
      border-top-width: 2px;
      background-color: #f7f7f7;
    }

    #wordstats-container .wordstats-highlight {
      background-color: yellow;
    }

    #wordstats-container .wordstats-highlight .wordstats-letter {
      font-weight: 700;
    }

    #wordstats-container .wordstats-header .wordstats-highlight {
      background-color: #333!important;
      border: 1px solid #333!important;
      border-bottom: 1px solid black!important;
      color: white;
    }

    #wordstats-container .wordstats-footer .wordstats-highlight {
      background-color: #e3e3e3!important;
      color: #666!important;
    }
  `;
  document.head.appendChild(style);
}

// Update stats table when new words are added
const observer = new MutationObserver(() => {
  console.log('Mutation detected');
  const container = document.getElementById('wordstats-container');
  let display = 'block';
  if(container) {
    display = container.style.display;
    container.remove();
  }
  createStatsTable(display === 'block');
});

const intervalId = setInterval(() => {
  const targetNode = document.querySelector('.sb-wordlist-summary');
  if (targetNode) {
    // Initial setup
    createStylesheet();
    createStatsTable();
    createMenu();
    // Observe for changes
    observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
    // Stop interval
    clearInterval(intervalId);
  }
}, 1000);

})();