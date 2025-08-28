
const sheetURL = 'https://raw.githubusercontent.com/RJ-Flashcards/Flashcard-app3/main/vocab.csv';

let flashcards = [];
let currentCard = 0;
let isFlipped = false;

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
      flashcards = lines.slice(1).map(line => {
        const [term, definition] = line.split(',');
        return { term: term.trim(), definition: definition.trim() };
      });
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

  front.innerText = card.term;
  back.innerText = card.definition;

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



