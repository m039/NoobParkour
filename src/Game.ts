import * as Phaser from 'phaser';
import Player, { PlayerEvent }  from "./Player";
import InputController from "./InputController";
import GameLevel from './GameLevel';
import { CoinPickUpEvent } from './CoinManager';
import { GameLevelRestartEvent } from './Events';
import WelcomeScene from './Scenes/WelcomeScene';
import LevelSelectionScene from './Scenes/LevelSelectionScene';
import PreloadScene from './Scenes/PreloadScene';

class UIScene extends Phaser.Scene {
    private coinImage : Phaser.GameObjects.Image;
    private coinText : Phaser.GameObjects.Text;
    private viewport : Phaser.Geom.Rectangle;
    private gameLevel : GameLevel;

    constructor() {
        super({key:"UIScene", active: true});
    }

    preload() {
        this.load.image("coin_ui", "assets/images/CoinUI_16x16.png");
    }

    create() {
        this.gameLevel = this.scene.get("GameLevel") as GameLevel;
        this.viewport = new Phaser.Geom.Rectangle();
        this.coinImage = this.add.image(100, 100, "coin_ui").setScale(4.0, 4.0).setOrigin(0.5, 0.5);
        this.coinText = this.add.text(160, 100, "0/99", {fontFamily:"monocraft", fontSize: 36}).setOrigin(0.0, 0.5);
        this.updateUI();

        this.scale.on("resize", () => this.updateUI());
        this.gameLevel.events.on(CoinPickUpEvent, () => this.updateUI());
        this.gameLevel.events.on(GameLevelRestartEvent, () => this.updateUI());
    }

    private updateUI() {
        const viewPort = this.getViewport(this.scale, this.viewport);
        this.coinText.setPosition(viewPort.left + 160, viewPort.top + 100);
        this.coinImage.setPosition(viewPort.left + 100, viewPort.top + 100);
        this.coinText.setText(`${this.gameLevel.coinManager.pickedCoins}/${this.gameLevel.coinManager.coinsCount}`);
    }

    private getViewport (scaleManager : Phaser.Scale.ScaleManager, out : Phaser.Geom.Rectangle) {
        var bounds = scaleManager.canvasBounds;
        var scale = scaleManager.displayScale;
        var autoCenter = scaleManager.autoCenter;
    
        out.x = (bounds.x >= 0) ? 0 : -(bounds.x * scale.x);
        out.y = (bounds.y >= 0) ? 0 : -(bounds.y * scale.y);
        out.width = (bounds.width * scale.x) - out.x;
        out.height = (bounds.height * scale.y) - out.y;
        if ((autoCenter === 1) || (autoCenter === 2)) {
            out.width -= out.x;
        }
        if ((autoCenter === 1) || (autoCenter === 3)) {
            out.height -= out.y;
        }
        return out;
    };
}

export class Level1 extends GameLevel
{
    private inputController : InputController;
    private bottomLine1 : Phaser.Types.Tilemaps.TiledObject;
    private bottomLine2 : Phaser.Types.Tilemaps.TiledObject;
    private upKeyPressed : Phaser.Input.Keyboard.Key;
    private canDoubleJump : boolean = false;

    constructor()
    {
        super({key: "GameLevel"});
    }

    override preload()
    {
        super.preload();
        
        this.load.image("tiles", "assets/levels/tilesets/NoobParkourTileset.png");
        this.load.image("pixel", "assets/images/Pixel.png");
        this.load.glsl("portal", "assets/shaders/Portal.frag");
        this.load.glsl("lava", "assets/shaders/Lava.frag");
    }

    override create()
    {
        super.create();

        const tileset = this.map.addTilesetImage("NoobParkourTileset", "tiles");
        const groundLayer = this.map.createLayer("Ground", tileset);
        this.map.createLayer("Back", tileset);
        
        this.inputController = new InputController(this);

        this.createPortals();
        this.createLava();

        groundLayer.setCollisionByExclusion([-1]);

        this.player.emmiter.on(PlayerEvent.DeathInAir, () => {
            this.placeCharacterAtStart(this.player, this.map, true);
        })

        this.physics.add.collider(this.player.container, groundLayer);

        this.placeCharacterAtStart(this.player, this.map, false);
        this.centerCameraAtCharacter(this.player);
        this.cameras.main.setZoom(4, 4);
        this.bottomLine1 = this.map.findObject("Objects", o => o.name === "BottomLine1");
        this.bottomLine2 = this.map.findObject("Objects", o => o.name === "BottomLine2");
        this.cameras.main.startFollow(this.player.container);
    }

    private createPortals() {
        const startGate = this.map.findObject("Objects", o => o.name === "Start");
        const endGate = this.map.findObject("Objects", o => o.name === "End");

        for (var gate of [startGate, endGate]) {
            // Add vortex.
            this.add
                .shader("portal", gate.x, gate.y, gate.width, gate.height)
                .setOrigin(0, 0);

            // Add particles.
            this.add.particles(
                gate.x + gate.width / 2, 
                gate.y + gate.height / 2,
                "pixel", {
                    x: {min: -8, max: 8},
                    y: {min: -12, max: 12},
                    scale: { min: 1.0, max: 4.0},
                    speed: { min: 5, max: 20 },
                    alpha: {start: 1, end: 0},
                    rotate: {min: 0, max: 360},
                    color: [ 0xff6d2aa7, 0xffc354cd, 0xfff4a2bc ],
                    lifespan: 4000,
                    frequency: 100,
                    blendMode: "ADD",
                    advance: 3000
                });
        }
    }

    private createLava() {
        const offset = 10.0;

        for (var lava of this.map.getObjectLayer("Lava").objects) {
            // Add lava effect.
            const lavaObject = this.add
                .shader("lava", lava.x, lava.y, lava.width, lava.height)
                .setOrigin(0, 0);

            this.physics.add.existing(lavaObject, true);

            // Add particles.
            this.add.particles(
                lava.x + lava.width / 2, 
                lava.y + offset,
                "pixel", {
                    x: {min: -lava.width / 2, max: lava.width / 2},
                    y: {min: -offset, max: -offset/2},
                    scale: { min: 1.0, max: 2.0},
                    speed: { min: 1, max: 3 },
                    alpha: {start: 1, end: 0},
                    color: [ 0xffff00, 0xec1800 ],
                    lifespan: 500,
                    frequency: 100,
                    blendMode: "ADD",
                    advance: 3000,
                    gravityY: -20
                });

            // Collider.
            this.physics.add.collider(this.player.container, lavaObject, () => this.player.dieInAir());
        }
    }

    private placeCharacterAtStart(
        player: Player, 
        map: Phaser.Tilemaps.Tilemap,
        tint: boolean,
        ) {
        const startGate = map.findObject("Objects", o => o.name === "Start");

        player.setPosition(
            startGate.x + startGate.width / 2, 
            startGate.y + startGate.height / 2 - 3
            );
        player.restartLevel(tint);
        this.coinManager.restartLevel();
        this.events.emit(GameLevelRestartEvent);
    }

    private centerCameraAtCharacter(player: Player) {
        this.cameras.main.centerOn(player.getPosition().x, player.getPosition().y);
    }

    override update(time : number, delta : number) {
        super.update(time, delta);

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
            this.placeCharacterAtStart(this.player, this.map, true);
        } else if (this.player.getPosition().y > this.bottomLine1.y) {
            this.player.fly();
        }
    }
}

const config : Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080,
    },
    backgroundColor: '#92b9e3',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 600}
        }
    },
    //scene: [Level1, UIScene]
    scene: [PreloadScene, WelcomeScene, LevelSelectionScene]
};

const game = new Phaser.Game(config);
