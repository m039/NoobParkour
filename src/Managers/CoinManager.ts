import * as Phaser from 'phaser';
import Player from './Player';
import { SoundId } from './AudioManager';
import { GameManager } from '../Scenes/BaseScene';
import LevelScene from '../Scenes/LevelScene';
import EventKeys from '../Consts/EventKeys';
import SceneKeys from '../Consts/SceneKeys';
import AudioScene from '../Scenes/AudioScene';

export default class CoinManager implements GameManager {
    private levelScene : LevelScene;

    public coinsCount : number;

    public pickedCoins : number;

    private coins: Array<Phaser.GameObjects.Sprite>;

    constructor(levelScene: LevelScene) {
        this.levelScene = levelScene;
        this.coins = [];
    }

    preload(): void {
    }

    create(): void {
    }

    update(time: number, delta: number): void {
    }

    public restartLevel() {
        for (var coin of this.coins) {
            coin.destroy();
        }

        this.coins.length = 0;

        this.createCoins(this.levelScene.player, this.levelScene.map);
        this.pickedCoins = 0;
    }

    private createCoins(player: Player, map: Phaser.Tilemaps.Tilemap) {
        const coinsLayer = map.getObjectLayer("Coins");
        this.coinsCount = coinsLayer.objects.length;

        for (var coin of coinsLayer.objects) {
            this.createCoin(player, coin.x, coin.y);
        }
    }

    private createCoin(player: Player, x: number, y: number) {
        const sprite = this.levelScene.add.sprite(x, y, "coin");
        this.levelScene.anims.createFromAseprite("coin", ["Idle", "Pick Up"], sprite);
        sprite.play({key: "Idle", repeat: -1});
        sprite.depth = 1;
        
        this.levelScene.physics.add.existing(sprite);
        
        const body = sprite.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setSize(8, 8);

        var isPickingUp = false;

        sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            if (isPickingUp) {
                sprite.destroy();
            }
        });

        this.levelScene.physics.add.overlap(player.container, sprite, () => {
            if (isPickingUp) {
                return;
            }
            sprite.play("Pick Up");
            const audioScene = this.levelScene.scene.get(SceneKeys.Audio) as AudioScene;
            audioScene.audioManager.playSound(SoundId.PickUpCoin);
            this.pickedCoins++;
            this.levelScene.events.emit(EventKeys.CoinPickUp);
            isPickingUp = true;
        });

        // Add up and down movement.
        this.levelScene.tweens.add({
            y: sprite.y - 4,
            targets: sprite,
            ease: Phaser.Math.Easing.Sine.InOut,
            duration: Phaser.Math.Between(1000, 2000),
            yoyo: true,
            repeat: -1,
        });

        this.coins.push(sprite);
    }
}