class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        this.load.image('startButton', 'assets/start.png');
        this.load.image('backgroundMenu', 'assets/background_menu.png');
    }

    create() {
        this.add.image(400, 300, 'backgroundMenu');
        this.add.text(250, 100, "Jogo do Labirinto", { fontSize: "48px", fill: "#fff" });
        let startButton = this.add.image(400, 400, 'startButton').setInteractive();
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
        this.score = 0;
        this.hasKey = false;
    }

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('key', 'assets/key.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('door', 'assets/door.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');
        this.load.image('tiles', 'assets/tileset.png');
        this.load.image('backgroundGame', 'assets/background_game.png');
    }

    create() {
        this.add.image(400, 300, 'backgroundGame');
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("tileset", "tiles");
        map.createLayer("Ground", tileset, 0, 0);
        
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        
        this.spawnKey();
        this.door = this.physics.add.sprite(500, 200, 'door');
        this.physics.add.overlap(this.player, this.door, this.enterDoor, null, this);
        
        this.enemy = this.physics.add.sprite(400, 200, 'enemy');
        this.enemy.setVelocity(100, 100);
        this.enemy.setBounce(1, 1);
        this.enemy.setCollideWorldBounds(true);

        this.scoreText = this.add.text(16, 16, 'Placar: 0', { fontSize: '32px', fill: '#fff' });

        this.physics.add.overlap(this.player, this.keyItem, this.collectKey, null, this);
        this.physics.add.overlap(this.player, this.enemy, () => {
            this.scene.start('GameOverScene');
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        }
    }

    spawnKey() {
        if (this.keyItem) {
            this.keyItem.destroy();
        }
        let x = Phaser.Math.Between(50, 750);
        let y = Phaser.Math.Between(50, 550);
        this.keyItem = this.physics.add.sprite(x, y, 'key');
        this.physics.add.overlap(this.player, this.keyItem, this.collectKey, null, this);
        this.hasKey = false;
    }

    collectKey(player, key) {
        this.score += 10;
        this.scoreText.setText('Placar: ' + this.score);
        key.destroy();
        this.hasKey = true;
    }

    enterDoor(player, door) {
        if (this.hasKey) {
            this.scene.start('GameScene2');
        }
    }
}

class GameScene2 extends Phaser.Scene {
        constructor() {
            super({ key: 'GameScene2' });
        }
    
        preload() {
            this.load.image('sapo', 'assets/sapo.png');  
            this.load.image('apple', 'assets/maca.png');  
            this.load.image('fundo', 'assets/fundo.jpg');
            this.load.image('cogumelo', 'assets/cogumelo.png');
        }
    
        create() {
    
            // Fundo
            this.fundo = this.add.image(400, 300, 'fundo').setDepth(-10);
            this.fundo.setScale(1.5);
    
            // Criando o sapo
            this.sapo = this.physics.add.image(400, 300, 'sapo')
                .setOrigin(0.5, 0.5)
                .setCollideWorldBounds(true);
            this.sapo.setScale(0.5);
    
            // Configurar colisão com borda
            this.sapo.body.onWorldBounds = true;
            this.physics.world.on('worldbounds', () => {
                this.scene.stop('GameScene2');
                this.scene.start('GameOverScene');
            });
    
            // Criando o cogumelo (barreira)
            this.cogumelo = this.physics.add.image(100, 500, 'cogumelo');
            this.cogumelo.setScale(0.5);
            this.cogumelo.setImmovable(true);
    
            // 🔥 **Recria os controles** para garantir que funcionem após restart
            this.cursors = this.input.keyboard.createCursorKeys();
    
            // Criando a maçã
            this.apple = this.physics.add.image(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 'apple');
            this.apple.setScale(0.2);
    
            // Pontuação
            this.score = 0;
            this.scoreText = this.add.text(16, 16, 'Pontuação: 0', { fontSize: '32px', fill: '#fff' });
    
            // Colisão entre o sapo e a maçã
            this.physics.add.overlap(this.sapo, this.apple, this.collectApple, null, this);
    
            // Colisão entre o sapo e o cogumelo (não faz nada)
            this.physics.add.collider(this.sapo, this.cogumelo);
        }
    
        update() {
            
            this.checkWin();

            let velocity = 160;
            this.sapo.setVelocity(0);
    
            if (this.cursors.left.isDown) {
                this.sapo.setVelocityX(-velocity);
            } else if (this.cursors.right.isDown) {
                this.sapo.setVelocityX(velocity);
            }
    
            if (this.cursors.up.isDown) {
                this.sapo.setVelocityY(-velocity);
            } else if (this.cursors.down.isDown) {
                this.sapo.setVelocityY(velocity);
            }
        }
    
        collectApple(sapo, apple) {
            // Muda a posição da maçã para um novo local
            apple.setPosition(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550));
        
            // Aumenta a pontuação
            this.score += 1;
            this.scoreText.setText('Pontuação: ' + this.score);
        
            // Aumenta o tamanho do sapo
            let newScale = this.sapo.scale + 0.03; // Aumenta um pouco a cada maçã
            if (newScale < 2) { // Limite para evitar crescimento infinito
                this.sapo.setScale(newScale);
            }
        }

        checkWin() {  
            if (this.score === 5) {
                this.scene.start('WinScene');
            }
        }
    }
    
    

class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    preload() {
        this.load.image('backgroundGameOver', 'assets/background_gameover.png');
    }

    create() {
        this.add.image(400, 300, 'backgroundGameOver');
        this.add.text(300, 100, "Game Over", { fontSize: "48px", fill: "#f00" });
        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

class WinScene extends Phaser.Scene {
    constructor() {
        super("WinScene");
    }

    preload() {
        this.load.image('backgroundWin', 'assets/background_win.png');
    }

    create() {
        this.add.image(400, 300, 'backgroundWin');
        this.add.text(300, 100, "Você Ganhou!", { fontSize: "48px", fill: "#0f0" });
        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [MenuScene, GameScene, GameScene2, GameOverScene, WinScene]
};

const game = new Phaser.Game(config);
