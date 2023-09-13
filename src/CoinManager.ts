import * as Phaser from 'phaser';
import Player from './Player';
import GameLevel from './GameLevel';
import { SoundId } from './AudioManager';

export default class CoinManager {
    private gameLevel : GameLevel;

    constructor(gameLevel: GameLevel) {
        this.gameLevel = gameLevel;
    }

    public createCoins(player: Player, map: Phaser.Tilemaps.Tilemap) {
        const coinsLayer = map.getObjectLayer("Coins");

        for (var coin of coinsLayer.objects) {
            this.createCoin(player, coin.x, coin.y);
        }
    }

    private createCoin(player: Player, x: number, y: number) {
        const sprite = this.gameLevel.add.sprite(x, y, "coin");
        this.gameLevel.anims.createFromAseprite("coin", ["Idle", "Pick Up"], sprite);
        sprite.play({key: "Idle", repeat: -1});
        
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
            isPickingUp = true;
        })
    }
}