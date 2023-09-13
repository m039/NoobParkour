import * as Phaser from 'phaser';
import AudioManager from './AudioManager';
import CoinManager from './CoinManager';
import Player from './Player';

export interface GameManager {
    preload(): void;
    create(): void;
    update(time: number, delta: number): void;
}

export default abstract class GameLevel extends Phaser.Scene {
    public audioManager : AudioManager;

    public map : Phaser.Tilemaps.Tilemap;

    public player : Player;

    private coinManager : CoinManager;

    private gameManagers : Array<GameManager>;

    constructor() {
        super();

        this.audioManager = new AudioManager(this);
        this.coinManager = new CoinManager(this);
        this.player = new Player(this);
        this.gameManagers = [this.player, this.audioManager, this.coinManager];
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