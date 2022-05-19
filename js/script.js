const startContainer = document.querySelector('.start-container'),
      startBtn = startContainer.querySelector('.start-btn'),
      cardsContainer = document.querySelector('.cards-container')

const count = 10;
const cards = ['1', '2', '3', '4', '5']
const cardsPositions = []

const card = (id, position) => {
  return `
  <div class="card" id="${id}" data-position="${position}">
    <div class="front">
      <div class="inner-front"></div>
    </div>
    <div class="back">
      <h1>${id}</h1>
    </div>
  </div>
  `
}

const generateCards = () => {
  cards.map(e => {
    cardsPositions.push(e) 
    cardsPositions.push(e)
  })
  cardsPositions.sort(() => Math.random() - 0.1)
  console.log(cardsPositions)
}

const placeCards = () => {
  cardsPositions.map((e, i) => {
    cardsContainer.innerHTML += card(e, i)
  })
}

const showCardsContainer = () => {
  cardsContainer.style.visibility = 'visible'
}

const rotateCard = (target, mode) => {
  const elems = target.childNodes,
        childs = [].filter.call(elems, e => e.nodeName !== '#text')

  let = deg1 = '', deg2 = '';
  if (mode === 'open') {deg1 = '180', deg2 = '360'}
  else {deg1 = '0', deg2 = '0'}
  
  childs[0].style.transform = `rotateY(${deg1}deg)`
  childs[1].style.transform = `rotateY(${deg2}deg)`
  activeCards++;
}

const getCardsForPosition = (pos1, pos2) => {
  return [document.querySelector(`.card[data-position="${pos1}"]`),
          document.querySelector(`.card[data-position="${pos2}"]`)]
}

const setGuessedStatus = (pos1, pos2) => {
  const c = getCardsForPosition(pos1, pos2)
  c[0].classList.add('guessed')
  c[1].classList.add('guessed')
}

let activeCards = 0;
let openCards = []

const resetData = () => {
  activeCards = 0;
  openCards = []
}

startBtn.addEventListener('click', () => {
  startContainer.style.display = "none";
  generateCards()
  placeCards()
  showCardsContainer()
})

cardsContainer.addEventListener('click', (e) => {
  const openCard = e.target.parentNode.parentNode;
  if (openCard.className === 'card' && !openCard.classList.contains('guessed')) {
    if (activeCards !== 2) {
      rotateCard(openCard, 'open')
      openCards.push([openCard.id, openCard.dataset.position])
    }
    handleCards()
  }
})

const checkAllCards = () => {
  const allCards = document.querySelectorAll('.card')
  return allCards.length !== [...allCards].filter(e => e.classList.contains('guessed')).length
}

const handleCards = () => {
  if (activeCards === 2) {
    const pos1 = openCards[0][1], pos2 = openCards[1][1];
    if (openCards[0][0] == openCards[1][0]) {
      setGuessedStatus(pos1, pos2)
      resetData()
      if (checkAllCards()) {
        console.log('Молодец')
      }
    } else {
      setTimeout(() => {
        const c = getCardsForPosition(pos1, pos2);
        rotateCard(c[0], 'close')
        rotateCard(c[1], 'close')
        resetData()
      }, 500)
    }
  }
}

