import * as Phaser from 'phaser';

import WelcomeScene from './Scenes/WelcomeScene';
import LevelSelectionScene from './Scenes/LevelSelectionScene';
import PreloadScene from './Scenes/PreloadScene';
import AudioScene from './Scenes/AudioScene';
import LevelScene from './Scenes/LevelScene';
import LevelUIScene from './Scenes/LevelUIScene';
import AdScene from './Scenes/AdScene';

const config : Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080,
    },
    input: {
        gamepad: true,
        activePointers: 3
    },
    backgroundColor: '#92b9e3',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },
    scene: [
        PreloadScene,
        WelcomeScene, 
        LevelSelectionScene, 
        AudioScene, 
        LevelScene,
        LevelUIScene,
        AdScene
    ]
};

const game = new Phaser.Game(config);
