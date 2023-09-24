import SceneKeys from "./Consts/SceneKeys";
import TextureKeys from "./Consts/TextureKeys";
import { SoundId } from "./Managers/AudioManager";
import AudioScene from "./Scenes/AudioScene";

interface CreateButtonConfig {
    hoveredTexture:TextureKeys,
    defaultTexture:TextureKeys,
    playSound?:boolean,
    onClick: () => void,
    isSelected?: () => boolean
}

export function getRandomElement(array: Array<string>) : string {
    return array[Math.floor(Math.random() * array.length)];
}

export function createButton(image:Phaser.GameObjects.Image, config:CreateButtonConfig) {
    image.setInteractive();
    image.on("pointerover", () => {
        image.setTexture(config.hoveredTexture);

        if ((config.playSound === undefined || config.playSound) && 
            config.isSelected === undefined || !config.isSelected()) {
            const audioScene = image.scene.scene.get(SceneKeys.Audio) as AudioScene;
            audioScene.audioManager.playSound(SoundId.Blip);
        }
    });
    image.on("pointerout", () => {
        if (config.isSelected === undefined || !config.isSelected()) {
            image.setTexture(config.defaultTexture);
        }
    });
    image.on("pointerup", () => {
         config.onClick();   
    });
}