import * as Phaser from 'phaser';
import AudioManager from './AudioManager';
import CoinManager from './CoinManager';
import Player from './Player';
import CloudManager from './CloudManager';

export interface IGameLevel {
    map:Phaser.Tilemaps.Tilemap;
}

export interface GameManager {
    preload(): void;
    create(): void;
    update(time: number, delta: number): void;
}

export default abstract class GameLevel extends Phaser.Scene implements IGameLevel {
    public audioManager : AudioManager;

    public map : Phaser.Tilemaps.Tilemap;

    public player : Player;

    public coinManager : CoinManager;

    private cloudManager : CloudManager;

    private gameManagers : Array<GameManager>;

    constructor(config? : string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);

        this.audioManager = new AudioManager(this);
        this.coinManager = new CoinManager(this);
        this.player = new Player(this);
        this.cloudManager = new CloudManager(this, {tilemap: () => this.map});
        this.gameManagers = [this.player, this.audioManager, this.coinManager, this.cloudManager];
    }

    public preload(): void {
        this.load.tilemapTiledJSON("map", "assets/levels/maps/Level1.json");

        for (var gm of this.gameManagers) {
            gm.preload();
        }
    }

    public create(): void {
        this.map = this.make.tilemap({ key: "map"});

        for (var gm of this.gameManagers) {
            gm.create();
        }
    }

    public update(time: number, delta: number): void {
        for (var gm of this.gameManagers) {
            gm.update(time, delta);
        }
    }
}