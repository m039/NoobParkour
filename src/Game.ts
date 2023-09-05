import * as Phaser from 'phaser';
import Player  from "./Player";
import InputController from "./InputController";

export default class Level1 extends Phaser.Scene
{
    private player : Player;
    private inputController : InputController;
    private bottomLine : Phaser.Types.Tilemaps.TiledObject;
    private map : Phaser.Tilemaps.Tilemap;
    private upKeyPressed : Phaser.Input.Keyboard.Key;
    private canDoubleJump : boolean = false;

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
        this.map = this.make.tilemap({ key: "map"});
        const tileset = this.map.addTilesetImage("NoobParkourTileset", "tiles");
        const groundLayer = this.map.createLayer("Ground", tileset);
        const lavaLayer = this.map.createLayer("Lava", tileset);
        const gateLayer = this.map.createLayer("Back", tileset);
        const tags = this.anims.createFromAseprite("noob");
        
        this.player = new Player(this);
        this.inputController = new InputController(this);

        groundLayer.setCollisionByExclusion([-1]);
        lavaLayer.setCollisionByExclusion([-1]);

        this.physics.add.collider(this.player.container, groundLayer);
        this.physics.add.collider(this.player.container, lavaLayer, () => {
            this.placeCharacterAtStart(this.player, this.map, false);
        })

        this.placeCharacterAtStart(this.player, this.map, true);
        this.centerCameraAtCharacter(this.player);
        this.cameras.main.setZoom(4, 4);
        this.bottomLine = this.map.findObject("Objects", o => o.name === "BottomLine");
        this.cameras.main.startFollow(this.player.container);
    }

    private placeCharacterAtStart(
        player: Player, 
        map: Phaser.Tilemaps.Tilemap,
        onGround: boolean) {
        const startGate = map.findObject("Objects", o => o.name === "Start");
        const playerSize = player.bodySize;

        player.flipX = false;
        player.setPosition(
            startGate.x + startGate.width / 2, 
            startGate.y + (onGround? startGate.height - playerSize.height / 2 : startGate.height / 2)
            );
    }

    private centerCameraAtCharacter(player: Player) {
        this.cameras.main.centerOn(player.getPosition().x, player.getPosition().y);
    }

    override update(time : number, delta : number) {
        if (this.inputController.isLeftDown) {
            this.player.moveLeft();
        } else if (this.inputController.isRightDown) {
            this.player.moveRight();
        } else {
            this.player.stay();
        }

        if (this.inputController.isUpDown && this.player.body.blocked.down) {
            this.player.jump();
            this.upKeyPressed = this.inputController.upKeyPressed;
            this.canDoubleJump = false;
        } else if (this.inputController.isUpDown && this.canDoubleJump) {
            this.canDoubleJump = false;
            this.player.doubleJump();
        }

        if (this.upKeyPressed && this.upKeyPressed.isUp) {
            this.player.stopJump();
            this.upKeyPressed = undefined;
            this.canDoubleJump = true;
        }

        if (this.player.getPosition().y > this.bottomLine.y) {
            this.placeCharacterAtStart(this.player, this.map, false);
        }

        this.player.update();
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
