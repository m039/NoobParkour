import * as Phaser from 'phaser';

import { MusicId, SoundId } from "../Managers/AudioManager";
import BaseScene from "./BaseScene";
import Player, { MovementConsts, PlayerEvent } from '../Managers/Player';
import CoinManager from '../Managers/CoinManager';
import CloudManager from '../Managers/CloudManager';
import SceneKeys from '../Consts/SceneKeys';
import InputController, { InputButton } from '../Managers/InputController';
import EventKeys from '../Consts/EventKeys';
import AudioScene from './AudioScene';
import TextureKeys from '../Consts/TextureKeys';
import { MaxLevels } from '../Consts/Consts';
import { Progress } from '../StaticManagers/ProgressStaticManager';
import LevelUIScene from './LevelUIScene';
import { Prefs } from '../StaticManagers/PrefsStaticManager';
import AsepriteKeys from 'src/Consts/AsepriteKeys';
import SawBlade from './LevelElements/SawBlade';
import JumpTile from './LevelElements/JumpTile';
import SandTile from './LevelElements/SandTile';
import TutorialSignPost from './LevelElements/TutorialSignPost';
import { Localization, LocalizationKey } from 'src/StaticManagers/LocalizationStaticManager';
import ArrowStatue from './LevelElements/ArrowStatue';
import ShaderKeys from 'src/Consts/ShaderKeys';
import MovingPlatform from './LevelElements/MovingPlatform';
import LevelElement from './LevelElements/LevelElement';

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

    private upKeyDownTimer : number = -1;

    private coyoteTimer : number = -1;
    
    private canDoubleJump : boolean = false;

    private isMobile : boolean = false;

    private debugGraphics : Phaser.GameObjects.Graphics;

    private rectangle1 : Phaser.Geom.Rectangle;

    private rectangle2 : Phaser.Geom.Rectangle;

    private performLongJump : boolean;

    private longJumpCooldown : number;

    private levelElements : Array<LevelElement>;

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
        this.isMobile = bridge.device.type === instantGamesBridge.DEVICE_TYPE.MOBILE;

        this.levelElements = [];
        this.map = this.make.tilemap({ key: "map" + this.level});

        (this.scene.get(SceneKeys.Audio) as AudioScene).audioManager.playMusic(MusicId.Game1);

        super.create();

        const tileset = this.map.addTilesetImage("NoobParkourTileset", TextureKeys.Tiles, 16, 16, 1, 2);
        const groundLayer = this.map.createLayer("Ground", tileset);
        
        this.map.createLayer("Back", tileset);
        
        this.inputController = (this.scene.get(SceneKeys.LevelUI) as LevelUIScene).inputController;

        this.createPortals();
        this.createLava();
        this.createTutorial();
        this.createSandTiles(groundLayer);
        this.createJumpTiles(groundLayer);
        this.createSpikes(tileset);
        this.createTrampolines(groundLayer);
        this.createSawBlades();
        this.createArrowStatues(groundLayer);
        this.createPlatforms();

        groundLayer.setCollisionByExclusion([-1]);

        this.player.emmiter.on(PlayerEvent.DeathInAir, () => {
            this.placeCharacterAtStart(this.player, this.map, true);
        });
        
        this.physics.add.collider(this.player.container, groundLayer);
        
        this.player.groundLayer = groundLayer;

        this.placeCharacterAtStart(this.player, this.map, false);
        this.centerCameraAtCharacter(this.player);
        this.cameras.main.setZoom(5, 5);
        this.bottomLine1 = this.map.findObject("Objects", o => o.name === "BottomLine1");
        this.bottomLine2 = this.map.findObject("Objects", o => o.name === "BottomLine2");
        this.cameras.main.startFollow(this.player.container);

        this.rectangle1 = new Phaser.Geom.Rectangle();
        this.rectangle2 = new Phaser.Geom.Rectangle();
        this.performLongJump = false;
    }

    private createSpikes(tileset : Phaser.Tilemaps.Tileset) : void {
        if (this.map.getLayer("Spikes")) {
            const spikesLayer = this.map.createLayer("Spikes", tileset);
            spikesLayer.setCollisionByExclusion([-1]);

            this.physics.add.overlap(this.player.container, spikesLayer, () => {
                this.player.dieInAir();
            }, this.processSpikes, this);
        }

        if (typeof debugConfig !== "undefined" && debugConfig.debugSpikes) {
            this.debugGraphics = this.add.graphics();
            this.debugGraphics.depth = 100;
        }
    }

    private processSpikes(
        player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
        tile : Phaser.Tilemaps.Tile
    ) : boolean {
        this.rectangle1.x = player.body.left;
        this.rectangle1.y = player.body.top;
        this.rectangle1.width = player.body.width;
        this.rectangle1.height = player.body.height;
        
        var spikesSize : number;

        if (tile.index >= 44 && tile.index <= 47) {
            spikesSize = 6;
        } else {
            spikesSize = 8;
        }

        if (tile.index === 44 || tile.index === 50) {
            // Bottom.
            this.rectangle2.x = tile.getLeft();
            this.rectangle2.width = tile.width;
            this.rectangle2.height = spikesSize;
            this.rectangle2.y = tile.getTop() + tile.height - spikesSize;
        } else if (tile.index === 45 || tile.index === 51) {
            // Left
            this.rectangle2.x = tile.getLeft();
            this.rectangle2.width = spikesSize;
            this.rectangle2.height = tile.height;
            this.rectangle2.y = tile.getTop();
        } else if (tile.index === 46 || tile.index === 52) {
            // Top
            this.rectangle2.x = tile.getLeft();
            this.rectangle2.width = tile.width;
            this.rectangle2.height = spikesSize;
            this.rectangle2.y = tile.getTop();
        } else if (tile.index === 47 || tile.index == 53) {
            // Right
            this.rectangle2.x = tile.getLeft() + tile.width - spikesSize;
            this.rectangle2.width = spikesSize;
            this.rectangle2.height = tile.height;
            this.rectangle2.y = tile.getTop();
        } else {
            return false;
        }

        this.rectangle2.x += 2;
        this.rectangle2.y += 2;
        this.rectangle2.width -= 4;
        this.rectangle2.height -= 4;
        
        if (typeof debugConfig !== "undefined" && debugConfig.debugSpikes) {
            this.debugGraphics.clear();

            this.debugGraphics.fillStyle(0x0000af, 1);
            this.debugGraphics.fillRect(this.rectangle1.x, this.rectangle1.y, this.rectangle1.width, this.rectangle1.height);

            this.debugGraphics.fillStyle(0x0000ff, 1);
            this.debugGraphics.fillRect(this.rectangle2.x, this.rectangle2.y, this.rectangle2.width, this.rectangle2.height);
        }

        return Phaser.Geom.Intersects.RectangleToRectangle(this.rectangle1, this.rectangle2);
    }

    private createPortals() {
        const startGate = this.map.findObject("Objects", o => o.name === "Start");
        const endGate = this.map.findObject("Objects", o => o.name === "End");

        for (var gate of [startGate, endGate]) {
            // Add vortex.
            const object = this.add
                .shader(ShaderKeys.Portal, gate.x, gate.y, gate.width, gate.height)
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
        Prefs.syncToCloud();
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
                .shader(ShaderKeys.Lava, lava.x, lava.y, lava.width, lava.height)
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

        for (var tiledObject of tutorialLayer.objects) {
            const signPost = new TutorialSignPost(
                this, tiledObject.x, tiledObject.y, this.getTextKeyProperty(tiledObject)
            );
            this.add.existing(signPost);
            this.levelElements.push(signPost);
        }
    }

    private createSandTiles(groundLayer:Phaser.Tilemaps.TilemapLayer) {
        const sandTilesGroup = this.add.group();

        var tiles = groundLayer.createFromTiles(32, -1, { key: TextureKeys.SandTile });
        if (tiles) {
            for (let tile of tiles) {
                tile.x += tile.width / 2;
                tile.y += tile.height / 2;

                const sandTile = new SandTile(tile);

                this.physics.add.existing(tile, true);
                tile.setData("data", sandTile);

                this.levelElements.push(sandTile);
                sandTilesGroup.add(tile);
            }
        }

        this.physics.add.collider(
            this.player.container, 
            sandTilesGroup, 
            undefined, 
            (player : any, tile : any) => {
                var sandTile = tile.getData("data") as SandTile;
                if (sandTile.isHidden) {
                    return false;
                }

                sandTile.startHide();

                return true;
            }, 
            this);
    }

    private createJumpTiles(groundLayer:Phaser.Tilemaps.TilemapLayer) {
        const jumpTilesGroup = this.add.group();
        
        let tiles = groundLayer.createFromTiles(48, -1, { key: TextureKeys.JumpTile });
        if (tiles) {
            for (let tile of tiles) {
                tile.x += tile.width / 2;
                tile.y += tile.height / 2;

                tile.setData("data", new JumpTile(tile));
                this.physics.add.existing(tile, true);
                jumpTilesGroup.add(tile);
            }
        }

        this.physics.add.collider(
            this.player.container, 
            jumpTilesGroup, 
            (player:any, tile:any) => {
                if (this.longJumpCooldown > 0) {
                    return;
                }

                const jumpTile = tile.getData("data") as JumpTile;
                jumpTile.squashAndStretch();
                this.performLongJump = true;

                const audioScene = this.scene.get(SceneKeys.Audio) as AudioScene;
                audioScene.audioManager.playSound(SoundId.LongJump);
            }, 
            undefined, 
            this);
    }

    private createTrampolines(groundLayer:Phaser.Tilemaps.TilemapLayer) {
        const trampolineGroup = this.add.group();
        
        let tiles = groundLayer.createFromTiles(54, -1, { key: AsepriteKeys.Trampoline });
        if (tiles) {
            for (let tile of tiles) {
                tile.y += 17;
                tile.setOrigin(0, 1);

                this.physics.add.existing(tile, true);

                const body = tile.body as Phaser.Physics.Arcade.Body;
                body.setSize(16, 8);
                body.setOffset(0, tile.height - 11);

                trampolineGroup.add(tile);

                tile.play({key:"Trampoline.Idle", repeat: -1});

                tile.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    tile.play({key:"Trampoline.Idle", repeat: -1});
                }, tile);
            }
        }

        this.physics.add.collider(
            this.player.container, 
            trampolineGroup, 
            (player:any, tile:any) => {
                if (this.longJumpCooldown > 0) {
                    return;
                }

                this.performLongJump = true;
                tile.play({key:"Trampoline.Jump", repeat: 0});

                const audioScene = this.scene.get(SceneKeys.Audio) as AudioScene;
                audioScene.audioManager.playSound(SoundId.LongJumpTrampoline);
            }, 
            undefined, 
            this);
    }

    private createSawBlades() {
        const sawsLayer = this.map.getObjectLayer("Saws");
        if (!sawsLayer) {
            return;
        }

        const sawsGroup = this.add.group();

        for (let tiledObject of sawsLayer.objects) {
            if (tiledObject.type === "Saw") {
                const sawBlade = new SawBlade(this, tiledObject);
                this.levelElements.push(sawBlade);

                this.physics.add.existing(sawBlade.blades, false);
                sawsGroup.add(sawBlade.blades);

                const body = sawBlade.blades.body as Phaser.Physics.Arcade.Body;
                body.setCircle(10);
                body.setOffset(4, 4);
            }
        }

        this.physics.add.overlap(
            this.player.container, 
            sawsGroup, 
            () => {
                this.player.dieInAir();
            }, 
            undefined, 
            this);
    }

    private createArrowStatues(groundLayer: Phaser.Tilemaps.TilemapLayer) {
        let arrowStatues : Array<ArrowStatue> = [];
        const arrowGroup = this.add.group();
        
        let tiles = groundLayer.createFromTiles(55, null);
        if (tiles) {
            for (let tile of tiles) {
                arrowStatues.push(new ArrowStatue(this, tile.x, tile.y, false));
                tile.destroy();
            }
        }

        tiles = groundLayer.createFromTiles(56, null);
        if (tiles) {
            for (let tile of tiles) {
                arrowStatues.push(new ArrowStatue(this, tile.x, tile.y, true));
                tile.destroy();
            }
        }

        for (let arrowStatue of arrowStatues) {
            this.physics.add.existing(arrowStatue.arrow, false);
            arrowStatue.arrow.setData("data", arrowStatue);
            arrowGroup.add(arrowStatue.arrow);
            this.levelElements.push(arrowStatue);
        }

        this.physics.add.collider(
            arrowGroup, 
            groundLayer, 
            (arrow:any, tile:any) => {
                let arrowStatue = arrow.getData("data") as ArrowStatue;
                arrowStatue.arrowCollided();
            }, 
            undefined,
            this
        );

        this.physics.add.overlap(
            this.player.container, 
            arrowGroup, 
            (player:any, arrow:any) => {
                let arrowStatue = arrow.getData("data") as ArrowStatue;
                arrowStatue.arrowCollided();
                this.player.dieInAir();
            }, 
            (player: any, arrow:any) => {
                let arrowStatue = arrow.getData("data") as ArrowStatue;
                return arrowStatue.isArrowActive;
            },
            this
        );
    }

    private createPlatforms() {
        const platformsLayer = this.map.getObjectLayer("Platforms");
        if (!platformsLayer) {
            return;
        }

        const movingPlatformsGroup = this.physics.add.group({allowGravity: false, immovable: true });

        for (let tiledObject of platformsLayer.objects) {
            if (tiledObject.type === "MovingPlatform") {
                const movingPlatform = new MovingPlatform(this, tiledObject);
                this.levelElements.push(movingPlatform);

                this.physics.add.existing(movingPlatform.platform, false);
                movingPlatformsGroup.add(movingPlatform.platform);
                movingPlatform.platform.setData("data", movingPlatform);
            }
        }

        this.physics.add.collider(
            this.player.container, 
            movingPlatformsGroup, 
            (player : any, platform : any) => {
                let movingPlatform = platform.getData("data") as MovingPlatform;
                movingPlatform.adjustPlayerPosition(this.player);
            }, 
            (player : any, platform : any) => {
                return player.body.y < platform.body.y;
            }, 
            this);
    }

    private getTextKeyProperty(tiledObject: Phaser.Types.Tilemaps.TiledObject) : string {
        for (let property of tiledObject.properties) {
            if (property.name === "TextKey") {
                const key = property.value + (this.isMobile? "_mobile" : "_desktop");
                if (Localization.getText(key as LocalizationKey)) {
                    return key;
                }

                if (Localization.getText(property.value as LocalizationKey)) {
                    return property.value;
                }

                throw new Error(`Can't find localization for '${property.value}'`);
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

        if (this.levelElements) {
            for (let levelElement of this.levelElements) {
                levelElement.reset();
            }
        }
    }

    private centerCameraAtCharacter(player: Player) {
        this.cameras.main.centerOn(player.getPosition().x, player.getPosition().y);
    }

    override update(time : number, delta : number) {
        super.update(time, delta);

        this.longJumpCooldown = Math.max(this.longJumpCooldown - delta, 0);

        if (this.inputController.isLeftDown) {
            this.player.moveLeft(this.inputController.strength);
        } else if (this.inputController.isRightDown) {
            this.player.moveRight(this.inputController.strength);
        } else {
            this.player.stay();
        }

        if (this.upKeyDownTimer >= 0) {
            this.upKeyDownTimer += delta;
        }

        if (this.inputController.isUpJustDown) {
            this.upKeyDownTimer = 0;
        }

        if (this.coyoteTimer >= 0) {
            this.coyoteTimer += delta;
        }

        if (this.player.body.blocked.down || 
            (this.player.isTouchingLeft || this.player.isTouchingRight)) {
            this.coyoteTimer = -1;
            this.canDoubleJump = true;
        } else if (this.coyoteTimer < 0) {
            this.coyoteTimer = 0;
        }

        if (this.performLongJump) {
            this.player.longJump();
            this.performLongJump = false;
            this.upKeyDownTimer = MovementConsts.JumpBufferTimeMs;
            this.longJumpCooldown = 50;
        } else if (this.upKeyDownTimer >= 0 && this.upKeyDownTimer < MovementConsts.JumpBufferTimeMs &&
            (this.coyoteTimer < 0 || this.coyoteTimer < MovementConsts.CoyoteTimeMs)) {
            if (this.player.isTouchingLeft && !this.player.body.blocked.down) {
                this.player.wallJump(1);
            } else if (this.player.isTouchingRight && !this.player.body.blocked.down) {
                this.player.wallJump(-1);
            } else {
                this.player.jump();
                this.upKeyPressed = this.inputController.upKeyPressed;
            }
            this.upKeyDownTimer = -1;
            this.coyoteTimer = -1;
            
        } else if (this.upKeyDownTimer == 0 && 
            this.canDoubleJump && 
            this.upKeyPressed === undefined && 
            !this.player.body.blocked.down) 
        {
            this.upKeyDownTimer = -1;
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

        // Update level elements.

        if (this.levelElements) {
            for (let levelElement of this.levelElements) {
                levelElement.update(time, delta);
            }
        }
    }
}