import * as Phaser from 'phaser';
import Player from './Player';
import GameLevel from './GameLevel';
import { SoundId } from './AudioManager';
import { GameManager } from './Scenes/BaseScene';

export const CoinPickUpEvent = "coin_pick_up";

export default class CoinManager implements GameManager {
    private gameLevel : GameLevel;

    public coinsCount : number;

    public pickedCoins : number;

    private coins: Array<Phaser.GameObjects.Sprite>;

    constructor(gameLevel: GameLevel) {
        this.gameLevel = gameLevel;
        this.coins = [];
    }

    preload(): void {
        this.gameLevel.load.aseprite("coin", "assets/animations/Coin.png", "assets/animations/Coin.json");
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

        this.createCoins(this.gameLevel.player, this.gameLevel.map);
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
        const sprite = this.gameLevel.add.sprite(x, y, "coin");
        this.gameLevel.anims.createFromAseprite("coin", ["Idle", "Pick Up"], sprite);
        sprite.play({key: "Idle", repeat: -1});
        sprite.depth = 1;
        
        this.gameLevel.physics.add.existing(sprite);
        
        const body = sprite.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setSize(8, 8);

        var isPickingUp = false;

        sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            if (isPickingUp) {
                sprite.destroy();
            }
        });

        this.gameLevel.physics.add.overlap(player.container, sprite, () => {
            if (isPickingUp) {
                return;
            }
            sprite.play("Pick Up");
            this.gameLevel.audioManager.play(SoundId.PickUpCoin);
            this.pickedCoins++;
            this.gameLevel.events.emit(CoinPickUpEvent);
            isPickingUp = true;
        });

        // Add up and down movement.
        this.gameLevel.tweens.add({
            y: sprite.y - 4,
            targets: sprite,
            ease: Phaser.Math.Easing.Sine.InOut,
            duration: 1000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
        });

        this.coins.push(sprite);
    }
}