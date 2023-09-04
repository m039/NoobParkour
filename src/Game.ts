import * as Phaser from 'phaser';
import Player, { PlayerAnimation } from "./Player";
import InputController from "./InputController";

export default class Level1 extends Phaser.Scene
{
    cursors : Phaser.Types.Input.Keyboard.CursorKeys;
    player : Player;
    inputController : InputController;

    constructor()
    {
        super();
    }

    preload()
    {
        this.load.tilemapTiledJSON("map", "assets/levels/maps/Level1.json");
        this.load.image("tiles", "assets/levels/tilesets/NoobParkourTileset.png");
        this.load.aseprite("noob", "assets/animations/NoobMain.png", "assets/animations/NoobMain.json");
    }

    create()
    {
        const map = this.make.tilemap({ key: "map"});
        const tileset = map.addTilesetImage("NoobParkourTileset", "tiles");
        const groundLayer = map.createLayer("Ground", tileset);
        const gateLayer = map.createLayer("Back", tileset);
        const tags = this.anims.createFromAseprite("noob");
        
        this.player = new Player(this);
        this.inputController = new InputController(this);

        groundLayer.setCollisionByExclusion([-1]);

        this.physics.add.collider(this.player.container, groundLayer);

        this.placeCharacterAtStart(this.player, map);
        this.centerCameraAtCharacter(this.player);
        this.cameras.main.setZoom(4, 4);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    private placeCharacterAtStart(
        player: Player, 
        map: Phaser.Tilemaps.Tilemap) {
        const startGate = map.findObject("Objects", o => o.name === "Start");
        const playerSize = player.bodySize;

        player.setPosition(startGate.x + startGate.width / 2, startGate.y + startGate.height - playerSize.height / 2);
    }

    private centerCameraAtCharacter(player: Player) {
        this.cameras.main.centerOn(player.getPosition().x, player.getPosition().y);
    }

    override update(time : number, delta : number) {
        if (this.inputController.isLeftDown()) {
            this.player.body.setVelocityX(-100);
            this.player.play(PlayerAnimation.Run);
            this.player.flipX = true;
        } else if (this.inputController.isRightDown()) {
            this.player.body.setVelocityX(100);
            this.player.play(PlayerAnimation.Run);
            this.player.flipX = false;
        } else {
            this.player.body.setVelocityX(0);
            this.player.play(PlayerAnimation.Idle);
        }
    }
}

const config : Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080,
    },
    backgroundColor: '#125555',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 600}
        }
    },
    scene: Level1
};

const game = new Phaser.Game(config);
