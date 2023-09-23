import * as Phaser from 'phaser';
import AudioManager from './AudioManager';
import CoinManager from './CoinManager';
import Player from './Player';
import CloudManager from './CloudManager';
import BaseScene from './Scenes/BaseScene';

export default abstract class GameLevel extends BaseScene {
    public audioManager : AudioManager;

    public map : Phaser.Tilemaps.Tilemap;

    public player : Player;

    public coinManager : CoinManager;

    private cloudManager : CloudManager;

    constructor(config? : string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);

        this.audioManager = new AudioManager(this);
        this.coinManager = new CoinManager(this);
        this.player = new Player(this);
        this.cloudManager = new CloudManager(this, {tilemap: () => this.map});
        this.gameManagers.push(this.player, this.audioManager, this.coinManager, this.cloudManager);
    }

    public override preload(): void {
        this.load.tilemapTiledJSON("map", "assets/levels/maps/Level1.json");

        super.preload();
    }

    public override create(): void {
        this.map = this.make.tilemap({ key: "map"});

        super.create();
    }
}