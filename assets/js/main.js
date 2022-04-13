var config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'slots-game',
    width: window.screen.width *2,
    height: window.screen.height *2
  },
  physics: {
    default: 'arcade',
    arcade: {
      // gravity: { y: 300 },
      debug: true
    }
  },
  scene: {
    preload: preload,
    create: create
  }
};

var game = new Phaser.Game(config);

function preload() {
  // this.load.setBaseURL('http://labs.phaser.io');

  this.load.image('bg', 'assets/images/bg.jpg');
  // this.load.image('bg_operate', 'assets/images/bg_operate.jpg');
  // this.load.image('num1', 'assets/images/num_1.jpg');
  // this.load.image('bet_btn', 'assets/images/bet_btn.jpg');
  this.load.image('bet_btn', 'assets/images/bet-btn.jpg');
  this.load.image('light_on', 'assets/images/unnamed_54.jpg');
  for (let i = 1; i <= 8; i++) {
    this.load.image(`bet_opt_${i}`, `assets/images/bet-opt-${i}.jpg`);
  }
}

let bg;
function create() {
  const matrix = [
    [1, 3, 2, 5, 4, 6, 1],
    [2, 0, 0, 0, 0, 0, 8],
    [5, 0, 0, 0, 0, 0, 5],
    [7, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 4],
    [3, 0, 0, 0, 0, 0, 1],
    [8, 3, 4, 1, 6, 3, 7]
  ];

  bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height/2, 'bg');
  for (var x = 1; x < 9; x++) {
    this.add.image(x * 72, this.cameras.main.height - 113, 'bet_btn').setInteractive()
  }

  // running animation

  // var text = this.add.text(200, 200, '1212', { font: '32px Courier', fill: '#00ff00' });
  // text.setText(Phaser.Utils.Array.Matrix.MatrixToString(matrix));
  // Phaser.Utils.Array.Matrix.MatrixToString(matrix)
  // for(let i=1; i<=8;i++) {
  //   this.add.image(100+i*50, 250, `bet_opt_${i}`);
  //   (`bet_opt_${i}`, `assets/images/bet-opt-${i}.jpg`);
  // }
  // let itemArr = [];
  // matrix.forEach((el, index) => {
  //   let arr = [];
  //   el.forEach((subel, subindex) => {
  //     if (subel !== 0) {
  //       arr.push(this.add.sprite(0, 0, `bet_opt_${subel}`).setDisplaySize(73, 80))
  //     } else {
  //       arr.push(0)
  //     }
  //   })
  //   Phaser.Actions.GridAlign(arr, {
  //     width: 36,
  //     height: 36,
  //     cellWidth: 73,
  //     cellHeight: 80,
  //     x: 105,
  //     y: 185+(index+1)* 76
  //   });
  // })

  this.input.on('gameobjectdown', function (pointer, gameObject) {
    gameObject.setTint(0x000000);
    gameObject.setAlpha(0.5);
  }, this);
  this.input.on('gameobjectup', function (pointer, gameObject) {
    gameObject.clearTint();
    gameObject.setAlpha(1);
  }, this);
  this.input.on('gameobjectout', function (pointer, gameObject) {
    gameObject.clearTint();
    gameObject.setAlpha(1);
  }, this);

  // rectangle test
  const rect = new Phaser.Geom.Rectangle(95, 235, 456, 456);
  const group = this.add.group({ key: 'bet_opt_1', frameQuantity: 28 });
  Phaser.Actions.PlaceOnRectangle(group.getChildren(), rect);

  // resize 
  this.scale.on('resize', resize, this);
}

function resize (gameSize, baseSize, displaySize, resolution)
{
    var width = window.screen.width*2>750?750:window.screen.width*2;
    var height = window.screen.height*2>1650?1650:window.screen.height*2;

    this.cameras.resize(width, height);

    // bg.setSize(width, height);
}