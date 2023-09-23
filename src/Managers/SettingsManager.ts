import { GameWidth } from "../Consts/Consts";
import TextureKeys from "../Consts/TextureKeys";
import { GameManager } from "../Scenes/BaseScene";
import { createButton } from "../Utils";

export default class SettingsManager implements GameManager {
    private scene : Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    preload(): void {
        this.scene.load.image(TextureKeys.GearIconDefault, "assets/images/ui/GearIconDefault.png");
        this.scene.load.image(TextureKeys.GearIconHovered, "assets/images/ui/GearIconHovered.png");
    }

    create(): void {
        const gearButton = this.scene.add.image(GameWidth - 22, 22, TextureKeys.GearIconDefault);

        createButton(gearButton, {
            defaultTexture: TextureKeys.GearIconDefault,
            hoveredTexture: TextureKeys.GearIconHovered,
            onClick: () => {}
        })
    }

    update(time: number, delta: number): void {
        
    }
}