// === script.js (drop-in replacement) ===

const sheetURL = 'https://raw.githubusercontent.com/RJ-Flashcards/Flashcard-app3/main/vocab.csv';

let flashcards = [];
let currentCard = 0;
let isFlipped = false;

/* ---------------------------
   Duplicate detection helpers
---------------------------- */
// Build a case-insensitive frequency map of terms
function buildTermCounts(cards) {
  const counts = {};
  cards.forEach(({ term }) => {
    const key = (term || '').trim().toLowerCase();
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

// Return a new array with isDuplicate flag on each card
function tagDuplicates(cards) {
  const counts = buildTermCounts(cards);
  return cards.map(c => ({
    ...c,
    isDuplicate: counts[(c.term || '').trim().toLowerCase()] > 1
  }));
}

function fetchFlashcards() {
  fetch(sheetURL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch CSV');
      }
      return response.text();
    })
    .then(data => {
      const lines = data.trim().split('\n');

      // Expecting CSV with a header row: Word,Definition
      // If your header is different, this still ignores the first line.
      flashcards = lines.slice(1).map(line => {
        const [term, definition] = line.split(',');
        return {
          term: (term || '').trim(),
          definition: (definition || '').trim()
        };
      });

      // Tag duplicates BEFORE shuffling (ordering doesn’t matter for tagging)
      flashcards = tagDuplicates(flashcards);

      shuffleFlashcards();
      displayCard();
    })
    .catch(error => {
      document.getElementById('card-front').innerText = 'Error loading flashcards.';
      console.error('Error:', error);
    });
}

function shuffleFlashcards() {
  for (let i = flashcards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
  }
}

function displayCard() {
  const front = document.getElementById('card-front');
  const back = document.getElementById('card-back');
  const card = flashcards[currentCard];

  // FRONT: set text first
  front.textContent = card.term || '';

  // If duplicate, append a small triangle icon (⚠️)
  if (card.isDuplicate) {
    const icon = document.createElement('span');
    icon.className = 'dup-flag';
    icon.title = 'Duplicate word';
    icon.setAttribute('aria-label', 'Duplicate word');
    icon.textContent = '⚠️'; // triangle-style warning icon
    icon.style.marginLeft = '0.4rem'; // inline spacing so you don’t need CSS if you don’t want it
    icon.style.opacity = '0.9';
    front.appendChild(icon);
  }

  // BACK
  back.textContent = card.definition || '';

  // Keep the card in its current flipped state
  const flashcard = document.getElementById('flashcard');
  if (isFlipped) {
    flashcard.classList.add('flipped');
  } else {
    flashcard.classList.remove('flipped');
  }
}

// ✅ Flip only on card tap (never on button press)
document.getElementById('flashcard').addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'button') {
    e.stopPropagation();
    return;
  }
  const flashcard = document.getElementById('flashcard');
  flashcard.classList.toggle('flipped');
  isFlipped = !isFlipped;
});

// ✅ Move to next card, preserve flip state
document.getElementById('next-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  currentCard = (currentCard + 1) % flashcards.length;
  displayCard();
});

// ✅ Move to previous card, preserve flip state
document.getElementById('back-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  currentCard = (currentCard - 1 + flashcards.length) % flashcards.length;
  displayCard();
});

fetchFlashcards();
