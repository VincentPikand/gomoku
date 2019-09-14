/* initial declarations */

const socket = io();
const createGame = document.getElementById('create');
const joinGame = document.getElementById('join');
let s = '';
for (var i = 0; i < 15; i++) {
  for (var j = 0; j < 15; j++) {

    s += '<button class="btn ' + i.toString() + ' x' + j.toString() + '"onclick="game(' + j.toString() + ',' + i.toString() + ');"></button>';

  }
}
const content = document.getElementById('container');
content.innerHTML += s;
const buttons = document.getElementsByClassName('btn');
const stageTwo = document.getElementById('stageTwo');
const stageOne = document.getElementById('stageOne');
const gameDiv = document.getElementById('game');
const turnFalse = document.getElementById('turnFalse');
const turnTrue = document.getElementById('turnTrue');

let room;
let player;
/* buttons */

/* game class */

class Room {
  constructor() {
    this.arr = new Array(15);
    for (let y = 0; y < this.arr.length; y++) {
      this.arr[y] = new Array(15);
    }
  }
}

/* player class */

class Player {
  constructor(type, currentTurn) {
    this.type = type;
    this.currentTurn = currentTurn;
  }
}
/* CREATE GAME WITH UNIQUE ID */

createGame.addEventListener('click', () => {
  Room.prototype.Id = Math.floor(Math.random() * 1000);
  room = new Room();
  socket.emit('create', { roomId: room.Id });
  stageOne.style.display = 'none';
  const newContent = document.createElement('p');
  newContent.innerHTML = 'game id: ' + room.Id;
  newContent.classList.add('waiting');
  stageTwo.appendChild(newContent);
  stageTwo.style.display = 'block';
  player = new Player('y', true);
});
/* if player decides to cancel game */
const back = document.getElementById('back');
back.addEventListener('click', () => {
  stageOne.style.display = 'block';
  stageTwo.style.display = 'none';
  socket.emit('cancel', room.Id);

  const child = document.getElementsByClassName('waiting')[0];
  stageTwo.removeChild(child);
});
/* JOIN GAME */

joinGame.addEventListener('click', () => {
  const roomId = document.getElementById('roomId').value;
  socket.emit('join', roomId);


  socket.on('status', (data) => {
    if (data) { /* if connection is successful */
      room = new Room();
      room.Id = roomId;
      stageOne.style.display = 'none';
      gameDiv.style.display = 'block';
      turnFalse.style.display = 'block';

    }

  });
  player = new Player('x', false);
});
/* when other player connects, show game board and hide waiting text */

socket.on('ready', () => {
  gameDiv.style.display = 'block';
  stageTwo.style.display = 'none';
  turnTrue.style.display = 'block';

});
/* after game ends, return to home */
const home = document.getElementById('home');
home.addEventListener('click', () => {
  stageOne.style.display = 'block';
  gameDiv.style.display = 'none';
  socket.emit('leaveRoom', room.Id);
  window.location.reload();

});
/* Show, that the room is empty */

socket.on('err0', (data) => {
  let element = document.getElementById('wrongId');
  element.innerHTML = data;
  element.classList.add('fadeIn');

});
/* Show, that the room is full */

socket.on('err1', (data) => {
  let element = document.getElementById('wrongId');
  element.innerHTML = data;
  element.classList.add('fadeIn');
});
/* RECEIVE UPDATED GAME DATA */

socket.on('gameData', (data) => {
  player.currentTurn = true;
  turnTrue.style.display = 'block';
  turnFalse.style.display = 'none';

  const turnColor = document.getElementsByClassName(buttons[data[1]].classList[2]);
  if (player.type === 'x') {
    room.arr[data[0]][data[1]] = 'y';
    turnColor[data[0]].classList.add('yellow');
  } else {
    room.arr[data[0]][data[1]] = 'x';
    turnColor[data[0]].classList.add('red');
  }
  checkWinner();
});

/* TURN SYSTEM */
function game(a, b) {
  if (player.currentTurn) {
    if (room.arr[b][a] === undefined) {
      const turnColor = document.getElementsByClassName(buttons[a].classList[2]);
      if (player.type === 'y') {
        turnColor[b].classList.add('yellow');
      } else {
        turnColor[b].classList.add('red');
      }
      room.arr[b][a] = player.type;
      player.currentTurn = false;
      turnTrue.style.display = 'none';
      turnFalse.style.display = 'block';
      socket.emit('playedTurn', { arr: [b, a], roomId: room.Id });
      checkWinner();
      return;

    }
  }
}
/* CHECK WIN CONDITION */
function checkWinner() {
  const home = document.querySelector("#home");
  /* horizontal */
  for (y = 0; y <= 14; y++) {
    for (x = 0; x <= 10; x++) {
      let t = true;
      if (room.arr[y][x] === undefined) {
        continue;
      }
      for (k = 1; k < 5; k++) {
        if (room.arr[y][x] !== room.arr[y][x + k]) {
          t = false;
          break;
        }
      }
      if (t) {
        turnTrue.style.display = 'none';
        turnFalse.style.display = 'none';
        home.style.display = 'block';
        if (room.arr[y][x] === player.type) {
          document.getElementById("win").style.display = 'block';
        } else {
          document.getElementById("loss").style.display = 'block';
        }
      }
    }
  }
  /* vertical */
  for (x = 0; x <= 14; x++) {
    for (y = 0; y <= 10; y++) {
      let t = true;
      if (room.arr[y][x] === undefined) {
        continue;
      }
      for (k = 1; k < 5; k++) {
        if (room.arr[y][x] !== room.arr[y + k][x]) {
          t = false;
          break;
        }
      }
      if (t) {
        turnTrue.style.display = 'none';
        turnFalse.style.display = 'none';
        home.style.display = 'block';
        if (room.arr[y][x] === player.type) {
          document.getElementById("win").style.display = 'block';
        } else {
          document.getElementById("loss").style.display = 'block';
        }
      }
    }
  }
  /* right diagonal */
  for (x = 0; x <= 10; x++) {
    for (y = 0; y <= 10; y++) {
      let t = true;
      if (room.arr[y][x] === undefined) {
        continue;
      }
      for (k = 1; k < 5; k++) {
        if (room.arr[y][x] !== room.arr[y + k][x + k]) {
          t = false;
          break;
        }
      }
      if (t) {
        turnTrue.style.display = 'none';
        turnFalse.style.display = 'none';
        home.style.display = 'block';
        if (room.arr[y][x] === player.type) {
          document.getElementById("win").style.display = 'block';
        } else {
          document.getElementById("loss").style.display = 'block';
        }
      }
    }
  }
  /* left diagonal */
  for (x = 14; x >= 4; x--) {
    for (y = 0; y <= 10; y++) {
      let t = true;
      if (room.arr[y][x] === undefined) {
        continue;
      }
      for (k = 1; k < 5; k++) {
        if (room.arr[y][x] !== room.arr[y + k][x - k]) {
          t = false;
          break;
        }
      }
      if (t) {
        turnTrue.style.display = 'none';
        turnFalse.style.display = 'none';
        home.style.display = 'block';
        if (room.arr[y][x] === player.type) {
          document.getElementById("win").style.display = 'block';
        } else {
          document.getElementById("loss").style.display = 'block';
        }
      }
    }
  }
}



//VISUALIZATION
for (let i = 0; i < buttons.length; i++) {
  // mouseover
  buttons[i].addEventListener('mouseover', () => {

    if (player.type === 'x') {
      buttons[i].classList.add('pseudoRed');
    } else {
      buttons[i].classList.add('pseudoYellow');

    }
  });
  // mouseleave
  buttons[i].addEventListener('mouseleave', () => {
    buttons[i].classList.remove('pseudoRed');
    buttons[i].classList.remove('pseudoYellow');

  });

}