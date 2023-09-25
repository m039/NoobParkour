import * as Phaser from 'phaser';
import WelcomeScene from './Scenes/WelcomeScene';
import LevelSelectionScene from './Scenes/LevelSelectionScene';
import PreloadScene from './Scenes/PreloadScene';
import AudioScene from './Scenes/AudioScene';
import LevelScene from './Scenes/LevelScene';
import LevelUIScene from './Scenes/LevelUIScene';

const config : Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080,
    },
    backgroundColor: '#92b9e3',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 600}
        }
    },
    scene: [
        PreloadScene,
        WelcomeScene, 
        LevelSelectionScene, 
        AudioScene, 
        LevelScene,
        LevelUIScene
    ]
};

const game = new Phaser.Game(config);
