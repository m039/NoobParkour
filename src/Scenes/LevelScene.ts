import * as Phaser from 'phaser';

import AudioManager, { MusicId } from "../Managers/AudioManager";
import BaseScene from "./BaseScene";
import Player, { PlayerEvent } from '../Managers/Player';
import CoinManager from '../Managers/CoinManager';
import CloudManager from '../Managers/CloudManager';
import SceneKeys from '../Consts/SceneKeys';
import InputController, { InputButton } from '../Managers/InputController';
import EventKeys from '../Consts/EventKeys';
import AudioScene from './AudioScene';
import { InstantGamesBridge } from '../instant-games-bridge';
import TextureKeys from '../Consts/TextureKeys';
import { MaxLevels } from '../Consts/Consts';
import { Progress } from '../StaticManagers/ProgressStaticManager';
import LevelUIScene from './LevelUIScene';

class TutorialSignPost extends Phaser.GameObjects.Image {
    arcadeBody : Phaser.Physics.Arcade.Body;
    overlap : boolean;
    wasOverlap : boolean;
    textKey : string;
    player : Player;
    bounds : Phaser.Geom.Rectangle;

    constructor(levelScene: LevelScene, x:number, y:number, textKey:string) {
        super(levelScene, Math.round(x), Math.round(y), TextureKeys.SignPostDefault);

        this.setOrigin(0.5, 1);
        this.textKey = textKey;

        this.player = levelScene.player;
        this.bounds = new Phaser.Geom.Rectangle(x - 25, y - 25, 50, 50);

        this.on("overlapstart", () => {
            this.setTexture(TextureKeys.SignPostHovered);
            levelScene.events.emit(EventKeys.ShowHelpBox, this.textKey);
        });
        this.on("overlapend", () => {
            this.setTexture(TextureKeys.SignPostDefault);
            levelScene.events.emit(EventKeys.HideHelpBox);
        });
    }

    update() {
        if (this.overlap && !this.wasOverlap) {
            this.emit("overlapstart");
        }

        if (!this.overlap && this.wasOverlap) {
            this.emit("overlapend");
        }

        this.wasOverlap = this.overlap;
        this.overlap = Phaser.Geom.Intersects.RectangleToRectangle(this.bounds, this.player.container.getBounds());
    }
}

export default class LevelScene extends BaseScene {
    public map : Phaser.Tilemaps.Tilemap;

    public player : Player;

    public coinManager : CoinManager;

    private cloudManager : CloudManager;

    public level : number;


    private inputController : InputController;

    private bottomLine1 : Phaser.Types.Tilemaps.TiledObject;

    private bottomLine2 : Phaser.Types.Tilemaps.TiledObject;

    private upKeyPressed : InputButton;
    
    private canDoubleJump : boolean = false;

    private isMobile : boolean = false;

    private tutorialSignPosts : Array<TutorialSignPost>

    constructor() {
        super({key:SceneKeys.Level});

        this.coinManager = new CoinManager(this);
        this.player = new Player(this);
        this.cloudManager = new CloudManager(this, {tilemap: () => this.map});
        this.gameManagers.push(
            this.player, 
            this.coinManager, 
            this.cloudManager
        );
    }

    public init(config: {level:number}) {
        if (!config) {
            this.level = 1;
        } else {
            this.level = config.level;
        }

        if (this.level > MaxLevels) {
            this.level = 1;
        }
    }

    public override create(): void {
        this.isMobile = bridge.device.type === InstantGamesBridge.DEVICE_TYPE.MOBILE;

        this.map = this.make.tilemap({ key: "map" + this.level});

        (this.scene.get(SceneKeys.Audio) as AudioScene).audioManager.playMusic(MusicId.Game1);

        super.create();

        const tileset = this.map.addTilesetImage("NoobParkourTileset", TextureKeys.Tiles);
        const groundLayer = this.map.createLayer("Ground", tileset);
        this.map.createLayer("Back", tileset);
        
        this.inputController = (this.scene.get(SceneKeys.LevelUI) as LevelUIScene).inputController;

        this.createPortals();
        this.createLava();
        this.createTutorial();

        groundLayer.setCollisionByExclusion([-1]);

        this.player.emmiter.on(PlayerEvent.DeathInAir, () => {
            this.placeCharacterAtStart(this.player, this.map, true);
        });

        this.physics.add.collider(this.player.container, groundLayer);

        this.placeCharacterAtStart(this.player, this.map, false);
        this.centerCameraAtCharacter(this.player);
        this.cameras.main.setZoom(4, 4).setRoundPixels(true);
        this.bottomLine1 = this.map.findObject("Objects", o => o.name === "BottomLine1");
        this.bottomLine2 = this.map.findObject("Objects", o => o.name === "BottomLine2");
        this.cameras.main.startFollow(this.player.container);
    }

    private createPortals() {
        const startGate = this.map.findObject("Objects", o => o.name === "Start");
        const endGate = this.map.findObject("Objects", o => o.name === "End");

        for (var gate of [startGate, endGate]) {
            // Add vortex.
            const object = this.add
                .shader("portal", gate.x, gate.y, gate.width, gate.height)
                .setOrigin(0, 0);

            if (gate === endGate) {
                this.physics.add.existing(object, true);

                const gateBody = object.body as Phaser.Physics.Arcade.Body;
                gateBody.setSize(gate.width / 4, gate.height);

                const collider = this.physics.add.overlap(object, this.player.container, () => {
                    this.onEndReached();
                    collider.destroy();
                });
            }

            if (!this.isMobile) {
                // Add particles.
                this.add.particles(
                    gate.x + gate.width / 2, 
                    gate.y + gate.height / 2,
                    TextureKeys.Pixel, {
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
    }

    private onEndReached() {
        this.inputController.enabled = false;
        this.events.emit(EventKeys.LevelCompleted);

        Progress.setLevelCompleted(this.level);
        if (this.coinManager.coinsCount === this.coinManager.pickedCoins) {
            Progress.setLevelCompletedFully(this.level);
        }
    }

    private createLava() {
        const lavaLayer = this.map.getObjectLayer("Lava");
        if (!lavaLayer) {
            return;
        }

        const offset = 10.0;

        for (var lava of lavaLayer.objects) {
            // Add lava effect.
            const lavaObject = this.add
                .shader("lava", lava.x, lava.y, lava.width, lava.height)
                .setOrigin(0, 0);

            this.physics.add.existing(lavaObject, true);

            if (!this.isMobile) {
                // Add particles.
                this.add.particles(
                    lava.x + lava.width / 2, 
                    lava.y + offset,
                    TextureKeys.Pixel, {
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
            }

            // Collider.
            this.physics.add.collider(this.player.container, lavaObject, () => this.player.dieInAir());
        }
    }

    private createTutorial() {
        const tutorialLayer = this.map.getObjectLayer("Tutorial");
        if (!tutorialLayer) {
            return;
        }

        this.tutorialSignPosts = [];

        for (var tiledObject of tutorialLayer.objects) {
            const signPost = new TutorialSignPost(
                this, tiledObject.x, tiledObject.y, this.getTextKeyProperty(tiledObject)
            );
            this.add.existing(signPost);
            this.tutorialSignPosts.push(signPost);
        }
    }

    private getTextKeyProperty(tiledObject: Phaser.Types.Tilemaps.TiledObject) : string {
        for (var property of tiledObject.properties) {
            if (property.name === "TextKey") {
                return property.value + (this.isMobile? "_mobile" : "_desktop");
            }
        }

        return undefined;
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
        this.events.emit(EventKeys.LevelRestart);
    }

    private centerCameraAtCharacter(player: Player) {
        this.cameras.main.centerOn(player.getPosition().x, player.getPosition().y);
    }

    override update(time : number, delta : number) {
        super.update(time, delta);

        if (this.inputController.isLeftDown) {
            this.player.moveLeft(this.inputController.strength);
        } else if (this.inputController.isRightDown) {
            this.player.moveRight(this.inputController.strength);
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

        // Update sign posts.

        if (this.tutorialSignPosts) {
            for (var signPost of this.tutorialSignPosts) {
                signPost.update();
            }
        }
    }
}