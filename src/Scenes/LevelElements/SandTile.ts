import * as Phaser from 'phaser';
import SceneKeys from 'src/Consts/SceneKeys';
import AudioScene from '../AudioScene';
import { SoundId } from 'src/Managers/AudioManager';

export default class SandTile {
    public isHidden : boolean;
    private sprite : Phaser.GameObjects.Sprite;
    private timer : number;
    private cooldown : number;
    private initPosition : {x:number, y:number};
    private shakeCooldown : number;
    private isShaking : boolean;

    constructor(sprite: Phaser.GameObjects.Sprite) {
        this.sprite = sprite;

        this.timer = -1;
        this.cooldown = -1;
        this.isHidden = false;
        this.initPosition = {x: sprite.x, y: sprite.y};
    }

    public startHide() : void {
        if (this.timer < 0) {
            this.timer = 0;
            this.shakeCooldown = 0;
            this.isShaking = true;

            (this.sprite.scene.scene.get(SceneKeys.Audio) as AudioScene)
                    .audioManager
                    .playSound(SoundId.SandTile);
        }
    }

    public update(delta: number) : void {
        if (this.isShaking) {
            this.shakeCooldown += delta;
            const offset = 0.1;

            if (this.shakeCooldown > 40) {
                this.sprite.setOrigin(
                    0.5 - offset / 2 + offset * Math.random(),
                    0.5 - offset / 2 + offset * Math.random()
                );
                this.shakeCooldown = 0;
            }
        }

        if (this.timer >= 0) {
            if (this.timer < 300) {
                this.timer += delta;
            } else {
                

                this.sprite.x = this.initPosition.x;
                this.sprite.y = this.initPosition.y;
                this.sprite.alpha = 1.0;
                this.sprite.scene.tweens.add({
                    targets: this.sprite,
                    y: this.sprite.y + 70,
                    alpha: 0,
                    ease: Phaser.Math.Easing.Cubic.In,
                    duration: 1000,
                    onComplete: () => {
                        this.sprite.visible = false;
                        this.cooldown = 0;
                        this.isShaking = false;
                    }
                });

                this.isHidden = true;
                this.timer = -1;
            }
        }

        if (this.cooldown >= 0) {
            if (this.cooldown < 2000) {
                this.cooldown += delta;
            } else {
                this.sprite.visible = true;
                this.sprite.alpha = 0.0;
                this.sprite.x = this.initPosition.x;
                this.sprite.y = this.initPosition.y - 10;
                this.sprite.setOrigin(0.5, 0.5);
                this.sprite.scene.tweens.add({
                    targets: this.sprite,
                    y: this.initPosition.y,
                    alpha: 1.0,
                    ease: Phaser.Math.Easing.Cubic.Out,
                    duration: 500,
                    onComplete: () => {
                        this.isHidden = false;
                    }
                });
                
                this.cooldown = -1;
            }
        }
    }
}
