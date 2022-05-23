'use strict'

const startContainer = document.querySelector('.start-container'),
      startBtn = startContainer.querySelector('.start-btn'),
      cardsContainer = document.querySelector('.cards-container'),
      modal = document.querySelector('.modal'),
      modalText = modal.querySelector('h1'),
      modalBtn = modal.querySelector('button'),
      timer = document.querySelector('.timer'), 
      table = document.querySelector('.results'),
      getNameModal = document.querySelector('.get-name'),
      editNameBtn = document.querySelector('.edit-name-btn')

const options = {
  easy: { // уровень сложности
    height: 190, // высота карты
    width: 190, // ширина карты
    size: 800, // ширина контейнера с картами
    count: 16, // количество карт
    time: 1, // время на игру в минутах
    name: 'Легко'

  },
  normal: {
    height: 140,
    width: 140,
    size: 1000,
    count: 24,
    time: 1.5,
    name: 'Средне'
  },
  hard: {
    height: 140,
    width: 140,
    size: 1000,
    count: 30,
    time: 2,
    name: 'Сложно'
  }
}

const cards = [];

let timeIntervel = '',
    mode = 'easy',
    username = '',
    leftTime = options[mode].time*60,
    players = [];

let activeCards = 0,
    openCards = []

const card = (id, position) => {
  return `
  <div class="card" id="${id}" 
       data-position="${position}" 
       style="height: ${options[mode].height}px; 
       width: ${options[mode].width}px">
    <div class="front">
      <div class="inner-front"></div>
    </div>
    <div class="back">
      <img src="img/${id}.png" alt="">
    </div>
  </div>
  `
}

// получение результатов игроков из LocalStorage
const getPlayersResults = () => {
  if (localStorage.getItem('players') !== null) {
    players = JSON.parse(localStorage.getItem('players'))
  }
}

// запись в LocalStorage
const setData = (param1, param2) => {
  localStorage.setItem(param1, param2)
}

// функция для изменения показа/скрытия определённых блоков
const displayContainer = (elem, param) => {
  elem.style.display = param
}

// проверка имени в LocalStorage
const checkUserName = () => {
  if (localStorage.getItem('name') !== null) {
    displayContainer(getNameModal, 'none')
    username = localStorage.getItem('name')
    showWelcome()
  } else {
    displayContainer(getNameModal, 'flex')
  }
}

checkUserName()

// сортировка игроков по времени
const sortPlayers = () => {
  players.sort((a, b) => a.time > b.time ? 1 : -1)
}

// очистка таблицы
const clearTable = () => {
  [...document.querySelectorAll('.results .player')].map((e, i) => {
    e.remove()
  })
}

// обновление таблицы лучших результатов
const updateTable = () => {
  if (players.length > 0) displayContainer(table.querySelector('.empty-row'), 'none')
  clearTable()
  sortPlayers()
  players.map((e, i) => {
    if (i < 10) {
      const elem = document.createElement('tr');
      elem.classList.add('player')
      elem.innerHTML = `
        <td>${i+1}</td>
        <td>${e.name}</td>
        <td>${e.mode}</td>
        <td>${e.time}</td>
      `
      table.append(elem)
    }
  })
}

getPlayersResults()
updateTable()

// старт игры
startBtn.addEventListener('click', () => {
  displayContainer(startContainer, 'none')
  displayContainer(table, 'none')
  getMode()
  setSizeCardsContainer()
  generateCards()
  placeCards()
  displayContainer(cardsContainer, 'flex')
  initTimer()
})

// нажатие на карту
cardsContainer.addEventListener('click', (e) => {
  const openCard = e.target.parentNode.parentNode;
  if (openCard.className === 'card' && !openCard.classList.contains('guessed') && activeCards < 2) {
    rotateCard(openCard, 'open')
    openCards.push([openCard.id, openCard.dataset.position])
    handleCards()
  }
})

// обработчик для кнопки модального окна
modalBtn.addEventListener('click', () => {
  resetGame()
})

editNameBtn.addEventListener('click', () => {
  displayContainer(getNameModal, 'flex')
})

// очистка временных данных
const resetData = () => {
  activeCards = 0;
  openCards = []
}

// получение выбранного уровеня сложности
const getMode = () => {
  const modes = document.querySelectorAll('input[type="radio"]');
  mode = [...modes].filter((e) => e.checked)[0].id
}

// установка ширины для контейнера с картами
const setSizeCardsContainer = () => {
  cardsContainer.style = `
    width: ${options[mode].size}px;
  `
}

// генерация карт в массиве
const generateCards = () => {
  let counter = 1;
  for (let i = 1; i <= options[mode].count/2; i++) {
    if (counter === 9) counter = 1
    cards.push(`${counter}`, `${counter}`)
    counter++
  }
  cards.sort(() => Math.random() - 0.5)
}

// создание карт на html странице
const placeCards = () => {
  cards.map((e, i) => {
    cardsContainer.innerHTML += card(e, i)
  })
}

// развернуть карту
const rotateCard = (target, mode) => {
  const childs = [...target.childNodes].filter(e => e.nodeName !== '#text')

  let deg1 = mode === 'open' ? '180' : '0', 
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

// устанавливает класс guessed, который показывает что карта отгадана
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
    saveResults()
    updateTable()
    setData('players', JSON.stringify(players))
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
  displayContainer(table, 'table')
  cards.length = 0;
  resetData();

  [...document.querySelectorAll('.card')].map((e) => {
    e.remove()
  })
}

// если минуты и секунды меньше 10, то добавляет перед ними 0
function convertTime(t) {
  const m = Math.floor(t/60),
        s = Math.floor(t%60);
  const minutes = m < 10 ? `0${m}` : m,
        seconds = s < 10 ? `0${s}` : s
  return [minutes, seconds]
}

// инициализация таймера
const initTimer = () => {
  const minutes = timer.querySelector('.minutes'),
        seconds = timer.querySelector('.seconds')

  displayContainer(timer, 'flex')
  leftTime = options[mode].time*60
  function updateTimer() {
    const t = convertTime(leftTime)
    minutes.innerHTML = t[0]
    seconds.innerHTML = t[1]
    if (leftTime === 0) {
      clearInterval(timeIntervel)
      showModal('lose')
    }
    leftTime--;
  }
  updateTimer();
  timeIntervel = setInterval(updateTimer, 1000);
}

// кнопка сохранения имени
document.querySelector('.save-name-btn').addEventListener('click', (e) => {
  getPlayerName()
  displayContainer(getNameModal, 'none')
  showWelcome()
  localStorage.setItem('name', username)
})

// получение имени с инпута модального окна
const getPlayerName = () => {
  const nameInput = document.querySelector('.name-input'),
        errorMsg = document.querySelector('.error-name-msg')

  if (nameInput.value !== '') {
    username = nameInput.value
  }
  else {
    nameInput.style.color = "#d34545"
    errorMsg.innerHTML = 'Поле не может быть пустым!'
    setTimeout(() => {
      nameInput.style.color = "#131a46"
      errorMsg.innerHTML = ''
    }, 1500)
  }
}

// отображение блока с ником и кнопкой его редактирвоания
function showWelcome() {
  const welcomeBlock = document.querySelector('.welcome')
  welcomeBlock.querySelector('span').innerHTML = `${username}`
  displayContainer(welcomeBlock, 'block')
}

// сохранение результатов игры 
const saveResults = () => {
  let timePassed = options[mode].time*60 - leftTime;
  const t = convertTime(timePassed)
  if (players.filter(e => e.name === username).length > 0) {
    players.map(e => {
      if (e.name === username) 
        e.time = `${t[0]}:${t[1]}`
        e.mode = options[mode].name
    })
  } else {
    players.push({
      name: username,
      time: `${t[0]}:${t[1]}`,
      mode: options[mode].name
    })
  }
}