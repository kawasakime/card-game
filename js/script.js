const startContainer = document.querySelector('.start-container'),
      startBtn = startContainer.querySelector('.start-btn'),
      cardsContainer = document.querySelector('.cards-container'),
      modal = document.querySelector('.modal'),
      modalText = modal.querySelector('h1'),
      modalBtn = modal.querySelector('button'),
      timer = document.querySelector('.timer');

const count = 10,
      cards = ['1', '2', '3', '4', '5'],
      cardsPositions = [];

let timeIntervel = '';

let activeCards = 0,
    openCards = []

const time = '1'

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

// старт игры
startBtn.addEventListener('click', () => {
  displayContainer(startContainer, 'none')
  generateCards()
  placeCards()
  displayContainer(cardsContainer, 'flex')
  initTimer()
})

// нажатие на карту
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

// обработчик для кнопки модального окна
modalBtn.addEventListener('click', () => {
  resetGame()
})

// очистка временных данных
const resetData = () => {
  activeCards = 0;
  openCards = []
}

// генерация карт в массиве
const generateCards = () => {
  cards.map(e => {
    cardsPositions.push(e) 
    cardsPositions.push(e)
  })
  cardsPositions.sort(() => Math.random() - 0.1)
}

// создание карт на html странице
const placeCards = () => {
  cardsPositions.map((e, i) => {
    cardsContainer.innerHTML += card(e, i)
  })
}

// функция для изменения показа/скрытия определённых блоков
const displayContainer = (elem, param) => {
  elem.style.display = param
}

// развернуть карту
const rotateCard = (target, mode) => {
  const childs = [...target.childNodes].filter(e => e.nodeName !== '#text')

  let = deg1 = mode === 'open' ? '180' : '0', 
        deg2 = mode === 'open' ? '360' : '0';
  
  childs[0].style.transform = `rotateY(${deg1}deg)`
  childs[1].style.transform = `rotateY(${deg2}deg)`
  activeCards++;
}

// второстепенная функция, для получения позиции карты
const getCardsForPosition = (pos1, pos2) => {
  return [document.querySelector(`.card[data-position="${pos1}"]`),
          document.querySelector(`.card[data-position="${pos2}"]`)]
}

//устанавливает класс guessed, который показывает что карта отгадана
const setGuessedStatus = (pos1, pos2) => {
  const c = getCardsForPosition(pos1, pos2)
  c[0].classList.add('guessed')
  c[1].classList.add('guessed')
}

// проверка на карты, открыты ли все
const checkAllCards = () => {
  const allCards = document.querySelectorAll('.card')
  if (allCards.length === [...allCards].filter(e => e.classList.contains('guessed')).length) {
    showModal('win')
  }
}

// отображение и настройка модального окна (поражение/выигрыш)
const showModal = (res) => {
  let text = res === 'win' ? 'Вы выиграли' : 'Вы проиграли',
      color = res === 'win' ? '#42df42' : '#df4242'

  modalText.innerHTML = text;
  modalText.style.color = color;
  modalBtn.style = `color: ${color}; border-color: ${color};`;

  setTimeout(() => {
    displayContainer(modal, 'flex')
  }, 500)
  clearInterval(timeIntervel)
}

// обработка 
const handleCards = () => {
  if (activeCards === 2) {
    const pos1 = openCards[0][1], pos2 = openCards[1][1];
    if (openCards[0][0] == openCards[1][0]) {
      setGuessedStatus(pos1, pos2)
      resetData()
      checkAllCards()
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

// сброс игры
const resetGame = () => {
  displayContainer(modal, 'none')
  displayContainer(cardsContainer, 'none');
  displayContainer(timer, 'none')
  displayContainer(startContainer, 'flex');

  [...document.querySelectorAll('.card')].map((e) => {
    e.remove()
  })
}

// инициализация таймера
const initTimer = () => {
  const minutes = timer.querySelector('.minutes'),
        seconds = timer.querySelector('.seconds')

  displayContainer(timer, 'flex')

  let leftTime = time*60;

  function updateTimer() {
    const m = Math.floor(leftTime/60),
          s = Math.floor(leftTime%60)
      
    minutes.innerHTML = m < 10 ? `0${m}` : m
    seconds.innerHTML = s < 10 ? `0${s}` : s
    if (leftTime === 0) {
      clearInterval(timeIntervel)
      showModal('lose')
    }
    leftTime--;
  }
  updateTimer();
  timeIntervel = setInterval(updateTimer, 1000);
}

