import * as Phaser from 'phaser';
import TextureKeys from "src/Consts/TextureKeys";

export default class JumpTile {
    private sprite : Phaser.GameObjects.Sprite;
    private isAnimating : boolean;

    constructor(sprite: Phaser.GameObjects.Sprite) {
        this.sprite = sprite;
        this.sprite.setOrigin(0.5, 1);
        this.sprite.y += this.sprite.height / 2;
        this.isAnimating = false;
    }

    public squashAndStretch() {
        if (this.isAnimating) {
            return;
        }

        this.isAnimating = true;

        this.sprite.setTexture(TextureKeys.JumpTileHighlighted);
        this.sprite.scene.tweens.add({
            targets: this.sprite,
            scaleY: 0.3,
            scaleX: 1.2,
            duration: 200,
            ease: Phaser.Math.Easing.Quintic.Out,
            onComplete: () => {
                this.sprite.setTexture(TextureKeys.JumpTile);

                this.sprite.scene.tweens.add({
                    targets: this.sprite,
                    scaleY: 1.2,
                    scaleX: 0.8,
                    duration: 200,
                    ease: Phaser.Math.Easing.Back.Out,
                    onComplete: () => {
                        this.sprite.scaleY = 1;
                        this.sprite.scaleX = 1;
                        this.isAnimating = false;
                    }
                });
            }
        });
    }
}