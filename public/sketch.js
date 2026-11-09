var socket;

let connectBtn;
let disconnectBtn;
let settingsBtn;
let playBtn;
let pauseBtn;
let resetBtn;
let syncBtn;

let c = randomColor();

let playing = false;
let timer = 0;

let angle;
let originX;
let originY;
let radius;

function setup() {

  createCanvas(windowHeight / 2, (windowHeight - 20));

  background(c);

  connectBtn = makeConnectButton();
  disconnectBtn = makeDisconnectButton().hide();
  settingsBtn = makeSettingsButton();
  playBtn = makePlayButton();
  pauseBtn = makePauseButton().hide();

  resetBtn = createButton('Reset');
  resetBtn.position(windowWidth / 2 - windowHeight / 4 + 20, 30);
  resetBtn.mousePressed(() => {
    if (socket && socket.connected) {
      socket.emit('reset');
    } else {
      reset();
    }
  })

  syncBtn = createButton('Sync');
  syncBtn.position(windowWidth / 2 + windowHeight / 4 - 64, 30);
  syncBtn.mousePressed(() => {
    if (socket && socket.connected) {
      socket.emit('sync', {time : timer});
    }
  })

  originX = width / 2;
  originY = height / 2;
  radius = width * 0.4;
}

function draw() {
  background(c);
  drawWheel();

  if (playing) {
    updateTimer();
  }

  drawTimer();
}

function connect() {
  socket = io.connect(getURL());
  connectBtn.hide();
  disconnectBtn.show();

  socket.on('newConnect', (data) => {
    console.log(`Connected to server`);
    timer = data.time;
    if (data.state) {
      play();
    } else {
      pause();
    }
  })

  socket.on('play', play);
  socket.on('pause', pause);
  socket.on('sync', (data) => {
    timer = data.time;
  });
  socket.on('reset', reset);
}

function disconnect() {
  socket.disconnect();
  console.log(`Disconnected...`);
  disconnectBtn.hide();
  connectBtn.show();
}

function randomColor() {
  return [Math.random() * 255, Math.random() * 255, Math.random() * 255];
}

function makeConnectButton() {

  let btn = createButton('Connect');
  btn.position(windowWidth / 2 - windowHeight / 4 + 20, windowHeight - 50);
  btn.mousePressed(connect);

  return btn;
};

function makeDisconnectButton() {

  let btn = createButton('Disconnect');
  btn.position(windowWidth / 2 - windowHeight / 4 + 20, windowHeight - 50);
  btn.mousePressed(disconnect);

  return btn;
};

function makeSettingsButton() {
  let btn = createButton('Settings');
  btn.position(windowWidth / 2 + windowHeight / 4 - 80, windowHeight - 50);
  btn.mousePressed(() => {c = randomColor()});

  return btn;
}

function makePlayButton() {
  let btn = createButton('Play');
  let d = btn.size();
  btn.position((windowWidth - d.width) / 2, (windowHeight - d.height) / 2);
  btn.mousePressed(sendPlay);

  return btn;
}

function makePauseButton() {
  let btn = createButton('Pause');
  let d = btn.size();
  btn.position((windowWidth - d.width) / 2, (windowHeight - d.height) / 2);
  btn.mousePressed(sendPause);

  return btn;
}

function drawWheel() {
  noStroke();
  fill('white');
  circle(width / 2, height / 2, width * 0.8);
}

function updateTimer() {
  timer += deltaTime / 1000;
  if (socket && socket.connected) {
    socket.emit('timer', {time: timer});
  }
}

function drawTimer() {
  noStroke();
  fill('black');
  circle(originX + cos(getAngle()) * radius, originY + sin(getAngle()) * radius, 20);
}

function sendPlay() {
  if (socket && socket.connected) {
    socket.emit('play');
  } else {
    play();
  }
}

function sendPause() {
  if (socket && socket.connected) {
    socket.emit('pause');
  } else {
    pause();
  }
}

function play() {
  if (!playing) {
    playing = true;
    playBtn.hide();
    pauseBtn.show();
  }
}

function pause() {
  if (playing) {
    playing = false;
    pauseBtn.hide();
    playBtn.show();
  }
}

function reset() {
  pause();
  timer = 0;
}

function getAngle() {
  return -HALF_PI + timer * 2 * PI / 60;
}