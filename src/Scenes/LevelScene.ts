import * as Phaser from 'phaser';

import AudioManager, { MusicId } from "../Managers/AudioManager";
import BaseScene from "./BaseScene";
import Player, { PlayerEvent } from '../Managers/Player';
import CoinManager from '../Managers/CoinManager';
import CloudManager from '../Managers/CloudManager';
import SceneKeys from '../Consts/SceneKeys';
import InputController from '../InputController';
import EventKeys from '../Consts/EventKeys';
import SettingsManager from '../Managers/SettingsManager';
import AudioScene from './AudioScene';

export default class LevelScene extends BaseScene {

    public audioManager : AudioManager;

    public map : Phaser.Tilemaps.Tilemap;

    public player : Player;

    public coinManager : CoinManager;

    private cloudManager : CloudManager;


    private inputController : InputController;

    private bottomLine1 : Phaser.Types.Tilemaps.TiledObject;

    private bottomLine2 : Phaser.Types.Tilemaps.TiledObject;

    private upKeyPressed : Phaser.Input.Keyboard.Key;
    
    private canDoubleJump : boolean = false;

    constructor() {
        super({key:SceneKeys.Level});

        this.audioManager = new AudioManager(this);
        this.coinManager = new CoinManager(this);
        this.player = new Player(this);
        this.cloudManager = new CloudManager(this, {tilemap: () => this.map});
        this.gameManagers.push(
            this.player, 
            this.audioManager, 
            this.coinManager, 
            this.cloudManager
        );
    }

    public override preload(): void {
        this.load.tilemapTiledJSON("map1", "assets/levels/maps/Level1.json");

        super.preload();

        this.load.image("tiles", "assets/levels/tilesets/NoobParkourTileset.png");
        this.load.image("pixel", "assets/images/Pixel.png");
        this.load.glsl("portal", "assets/shaders/Portal.frag");
        this.load.glsl("lava", "assets/shaders/Lava.frag");
    }

    public override create(): void {
        this.map = this.make.tilemap({ key: "map1"});

        (this.scene.get(SceneKeys.Audio) as AudioScene).audioManager.playMusic(MusicId.Game1);

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
        this.events.emit(EventKeys.LevelRestart);
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