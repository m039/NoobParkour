import * as Phaser from 'phaser';
import Player from "./Player";

export default class Level1 extends Phaser.Scene
{
    constructor()
    {
        super();
    }

    preload()
    {
        this.load.tilemapTiledJSON("map", "assets/levels/maps/Level1.json");
        this.load.image("tiles", "assets/levels/tilesets/NoobParkourTileset.png");
        this.load.aseprite("noob", "assets/animations/NoobMain.png", "assets/animations/NoobMain.json");
    }

    create()
    {
        const map = this.make.tilemap({ key: "map"});
        const tileset = map.addTilesetImage("NoobParkourTileset", "tiles");
        const groundLayer = map.createLayer("Ground", tileset);
        const gateLayer = map.createLayer("Back", tileset);
        const tags = this.anims.createFromAseprite("noob");
        const player = new Player(this);

        this.placeCharacterAtStart(player, map);
        this.centerCameraAtCharacter(player);
        this.cameras.main.setZoom(4, 4);
    }

    private placeCharacterAtStart(
        player: Player, 
        map: Phaser.Tilemaps.Tilemap) {
        const startGate = map.findObject("Objects", o => o.name === "Start");

        player.setPosition(startGate.x + startGate.width / 2, startGate.y + startGate.height / 2);
    }

    private centerCameraAtCharacter(player: Player) {
        this.cameras.main.centerOn(player.getPosition().x, player.getPosition().y);
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080,
    },
    backgroundColor: '#125555',
    pixelArt: true,
    scene: Level1
};

const game = new Phaser.Game(config);
