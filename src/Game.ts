import * as Phaser from 'phaser';
import Player, { PlayerEvent }  from "./Player";
import InputController from "./InputController";

export default class Level1 extends Phaser.Scene
{
    private player : Player;
    private inputController : InputController;
    private bottomLine1 : Phaser.Types.Tilemaps.TiledObject;
    private bottomLine2 : Phaser.Types.Tilemaps.TiledObject;
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

        this.player.emmiter.on(PlayerEvent.DeathInAir, () => {
            this.placeCharacterAtStart(this.player, this.map, false);
        })

        this.physics.add.collider(this.player.container, groundLayer);
        this.physics.add.collider(this.player.container, lavaLayer, () => this.player.dieInAir());

        this.placeCharacterAtStart(this.player, this.map, true);
        this.centerCameraAtCharacter(this.player);
        this.cameras.main.setZoom(4, 4);
        this.bottomLine1 = this.map.findObject("Objects", o => o.name === "BottomLine1");
        this.bottomLine2 = this.map.findObject("Objects", o => o.name === "BottomLine2");
        this.cameras.main.startFollow(this.player.container);
    }

    private placeCharacterAtStart(
        player: Player, 
        map: Phaser.Tilemaps.Tilemap,
        onGround: boolean) {
        const startGate = map.findObject("Objects", o => o.name === "Start");
        const playerSize = player.bodySize;

        player.restartLevel();
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

        if (this.player.body.blocked.down) {
            this.canDoubleJump = true;
        }

        if (this.inputController.isUpDown && this.player.body.blocked.down) {
            this.player.jump();
            this.upKeyPressed = this.inputController.upKeyPressed;
        } else if (this.inputController.isUpDown && 
            this.canDoubleJump && 
            this.player.body.velocity.y !== 0 && 
            this.upKeyPressed === undefined) 
        {
            this.canDoubleJump = false;
            this.player.doubleJump();
        }

        if (this.upKeyPressed && this.upKeyPressed.isUp) {
            this.player.stopJump();
            this.upKeyPressed = undefined;
        }

        if (this.player.getPosition().y > this.bottomLine2.y) {
            this.placeCharacterAtStart(this.player, this.map, false);
        } else if (this.player.getPosition().y > this.bottomLine1.y) {
            this.player.fly();
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
