import * as Phaser from 'phaser';

export default class Level1 extends Phaser.Scene
{
    constructor()
    {
        super('Level1');
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
        const sprite = this.add.sprite(400, 400, "noob").play({key:"Idle", repeat: -1});
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 1920,
    height: 1080,
    scene: Level1
};

const game = new Phaser.Game(config);
