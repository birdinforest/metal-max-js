const path = require('path');
const fs = require('fs');

const chalk = require('chalk');

const TILESET = '../../assets/tileset/mm1_nes_location_general.json';
const SPRITE_NAME_PREFIX = 'mm1_nes_location_general.json';

const convert = function () {
  const tilesetData = JSON.parse(fs.readFileSync(TILESET));
  const tilecount = tilesetData.tilecount;
  const col = tilesetData.columns;
  const row = tilecount / tilesetData.columns;

  const image = tilesetData.image;
  const imagewidth = tilesetData.imagewidth;
  const imageheight = tilesetData.imageheight;

  const tilewidth = tilesetData.tilewidth;
  const tileheight = tilesetData.tileheight;

  const out = {
    frames: [],
    meta: {
      app: "tilemap",
      version: "0.1",
      image: "./mm1_gnd_world.png",
      format: "RGBA8888",
      size: {"w":imagewidth,"h":imageheight},
      scale: "1",
    }
  };

  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      const frame = {
        filename: `${SPRITE_NAME_PREFIX}_${j+col*i}`,
        frame: {
          x:j * tilewidth,
          y:i * tileheight,
          w:32,
          h:32
        },
        rotated: false,
        trimmed: false,
        spriteSourceSize: {x:0,y:0,w:32,h:32},
        sourceSize: {w:32,h:32}
      }

      out.frames.push(frame);
    }
  }

  const outPath = TILESET.replace('.json', '_convert.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(chalk.green(
    "Completed!\n" +
    "Saved into directory:\n" +
    outPath + "\n" +
    "Data:" + new Date()
  ));
}

convert();
