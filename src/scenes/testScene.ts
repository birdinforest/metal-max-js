import {Engine} from "@babylonjs/core/Engines/engine";
import {Scene} from "@babylonjs/core/scene";
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";

import {CreateSceneClass} from "../engine/createScene";
import {GameManager} from "../managers/gameManager";

// import {World, System, ComponentData, TagComponent, Property, NumberProp, StringProp, ArrayProp, RefProp, number, string, array, ref, queries, after} from "../../lib/ecstra/dist/index.js";
// import { array, number, string, ref } from "../../lib/ecstra/dist/index.js";
import * as ecstra from "../../lib/ecstra/dist/index.js";
import * as MyEngine from "../engine";
import log from "../engine/log";

/** Components */
import RenderableComponent, {AnimationClipNames, AnimationClip} from "../components/renderableComponent"
import PlayerTagComponent from "../components/playerTagComponent"
import SceneComponent from "../components/sceneComponent"
import PositionComponent from "../components/positionComponent"
import ControllerComponent from '../components/controllerComponent'

/** Systems */
import PlayerTransformUpdateSystem from '../system/playerTransformUpdateSystem'
import PlayerControllerUpdateSystem from '../system/playerControllerUpdateSystem'
import RenderSystem from '../system/renderSystem'
import InputSystem from '../system/inputSystem'

const playerTextureUrl = "/assets/textures/mm1_player.png";

// const mapSpriteSheetUrl = "/assets/textures/legends.png";
// const mapSpriteJsonUrl = "/assets/textures/legends.json";

const map_laduo_json = "/assets/map/laduo.json";

const mm1_nes_gnd_world_url = "/assets/textures/mm1_nes/mm1_gnd_world.png";
const mm1_nes_gnd_world_json = "/assets/tileset/mm1_nes_gnd_world_convert.json";

const mm1_nes_location_general_url = '/assets/textures/mm1_nes/mm1_locate_general.png'
const mm1_nes_location_general_json = "/assets/tileset/mm1_nes_location_general_convert.json";

// const mm1WorldGeneralTilesetUrl = "/assets/tileset/tp_mm1_nes_location_general.png"
// const mm1WorldGeneralTilesetJsonUrl = "/assets/tileset/tp_mm1_nes_location_general.json"

/**
 * A test scene.
 */
export class TestScene implements CreateSceneClass {

  createScene = async (
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> => {

    return new Promise((resolve, reject) => {
      /***********************************************
       * Scene
       **********************************************/

        // This creates a basic Babylon Scene object (non-mesh)
      const scene = new Scene(engine);

      /***********************************************
       * Camera
       **********************************************/

        // This creates and positions a free camera (non-mesh)
      const camera = new ArcRotateCamera(
        "my first camera",
        -Math.PI / 2, 0,                    // Camera angle
        20,                                  // Camera distance
        new MyEngine.Vector3(0, 0, 0),     // Camera center
        scene
        );

      // camera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;

      // var distance = 20;
      // // @ts-ignore
      // var aspect = scene.getEngine().getRenderingCanvasClientRect().height / scene.getEngine().getRenderingCanvasClientRect().width;
      // camera.orthoLeft = -distance / 2;
      // camera.orthoRight = distance / 2;
      // camera.orthoBottom = camera.orthoLeft * aspect;
      // camera.orthoTop = camera.orthoRight * aspect;

      // camera.alpha = 1.571
      // camera.beta = 0

      // This attaches the camera to the canvas
      // camera.attachControl(canvas, true, true);
      camera.attachControl(canvas, true, true);

      /***********************************************
       * Assets meta
       **********************************************/

      const playerAnimationClips: { [key: string]: AnimationClip } = {
        [AnimationClipNames.WALK_UP]: {name: AnimationClipNames.WALK_UP, frames: [12, 15]},
        [AnimationClipNames.WALK_DOWN]: {name: AnimationClipNames.WALK_DOWN, frames: [0, 3]},
        [AnimationClipNames.WALK_LEFT]: {name: AnimationClipNames.WALK_LEFT, frames: [4, 7]},
        [AnimationClipNames.WALK_RIGHT]: {name: AnimationClipNames.WALK_RIGHT, frames: [8, 11]},
        [AnimationClipNames.STAND_UP]: {name: AnimationClipNames.STAND_UP, frames: [12, 12]},
        [AnimationClipNames.STAND_DOWN]: {name: AnimationClipNames.STAND_DOWN, frames: [1, 1]},
        [AnimationClipNames.STAND_LEFT]: {name: AnimationClipNames.STAND_LEFT, frames: [4, 4]},
        [AnimationClipNames.STAND_RIGHT]: {name: AnimationClipNames.STAND_RIGHT, frames: [8, 8]},
      }

      console.log(playerAnimationClips)

      // Create an assets manager to load the JSON file
      const assetsManager = new MyEngine.AssetsManager(scene);

      // TODO: How to ensure map data have been loaded before tiles?

      // TODO: Tileset background
      // Load the spritesheet (with appropriate settings) associated with the JSON Atlas.
      let backgroundSpriteSheet = new MyEngine.Texture(mm1_nes_gnd_world_url, scene,
        false, //NoMipMaps
        false, //InvertY usually false if exported from TexturePacker
        MyEngine.Texture.NEAREST_NEAREST, //Sampling Mode
        null, //Onload, you could spin up the sprite map in a function nested here
        null, //OnError
        null, //CustomBuffer
        false, //DeleteBuffer
      );

      // NODE: It's better to be `CLAMP_ADDRESSMODE`, otherwise in the initialization of large size map, you will
      // see the texture being wrap.
      backgroundSpriteSheet.wrapV = MyEngine.Texture.CLAMP_ADDRESSMODE;
      backgroundSpriteSheet.wrapU = MyEngine.Texture.CLAMP_ADDRESSMODE; //Or Wrap, its up to you...

      // TODO: Tileset prop
      // Load the spritesheet (with appropriate settings) associated with the JSON Atlas.
      let propSpriteSheet = new MyEngine.Texture(mm1_nes_location_general_url, scene,
        false, //NoMipMaps
        false, //InvertY usually false if exported from TexturePacker
        MyEngine.Texture.NEAREST_NEAREST, //Sampling Mode
        null, //Onload, you could spin up the sprite map in a function nested here
        null, //OnError
        null, //CustomBuffer
        false, //DeleteBuffer
        MyEngine.Engine.TEXTUREFORMAT_RGBA
      );

      propSpriteSheet.wrapV = MyEngine.Texture.CLAMP_ADDRESSMODE;
      propSpriteSheet.wrapU = MyEngine.Texture.CLAMP_ADDRESSMODE; //Or Wrap, its up to you...

      // [height][width]
      let tilesBackground: number[][];
      // [height][width]
      let tilesProps: number[][];
      let mapWidth = 0;
      let mapHeight = 0;
      let tileWidth = 32;
      let tileHeight = 32;

      const mapLoadTask = assetsManager.addTextFileTask("map_load_task", map_laduo_json);
      mapLoadTask.onSuccess = (task) => {
        console.log('onSuccess >> map_load_task', task)
        const map = JSON.parse(task.text)

        mapWidth = map.width;
        mapHeight = map.height;
        // mapWidth = 10
        // mapHeight = 10

        tileWidth = map.tilewidth;
        tileHeight = map.tileheight;

        // Todo: type of tiled map exported json.
        const backgroundLayer = map.layers.find((layer: { name: string; }) => {return layer.name === 'background'});
        let width: number = backgroundLayer.width;
        let height: number = backgroundLayer.height;
        let count = width * height;
        let data: number[] = backgroundLayer.data;

        // Fill array by tile 0
        tilesBackground = new Array(height).fill(0).map(() => new Array(width).fill(0));

        console.log('BEFORE')
        console.log('backgroundLayer.data', backgroundLayer.data.length)
        console.log('width', backgroundLayer.width, width)
        console.log('height', backgroundLayer.height, height)
        console.log('tilesBackground', tilesBackground)

        // Tiled map index tiles from left top.
        // BabylonJS index tiles from left bottom.
        for (let h = 0; h < height; h++) {
          for (let w = width - 1; w >= 0; w--) {
            // NOTE: In TiledEditor, tile id start from 1.
            // In Babylon tiled map, tile id start from 0.
            tilesBackground[h][w] = data[count-1] - 1;
            // console.log('tilesBackground', h, w, data[count - 1], tilesBackground[h][w])
            --count;
          }
        }

        console.log('AFTER')
        console.log('tilesBackground', tilesBackground)

        // Fill array by tile 0
        tilesProps = new Array(height).fill(0).map(() => new Array(width).fill(0));

        const propLayer = map.layers.find((layer: { name: string; }) => {return layer.name === 'props'});
        width = propLayer.width;
        height = propLayer.height;
        count = width * height;
        data = propLayer.data;

        console.log('BEFORE PROPS:')
        console.log('data', data, 'width', width, 'height', height)

        // Tiled map index tiles from left top.
        // BabylonJS index tiles from left bottom.
        for (let h = 0; h < height; h++) {
          for (let w = width - 1; w >= 0; w--) {
            tilesProps[h][w] = data[count-1] - 1;
            --count;
            // console.log('tilesBackground', h, w, data[count - 1], tilesProps[h][w])
          }
        }

        console.log('AFTER PROPS:')
        console.log('tilesProps', tilesProps)

      };

      const backgroundTextTask = assetsManager.addTextFileTask("text task", mm1_nes_gnd_world_json);
      //Create the sprite map on successful loading
      backgroundTextTask.onSuccess = (task) => {
        console.log('onSuccess >> backgroundTextTask', task)
        let atlasJSON = JSON.parse(task.text)

        // Stage size is tiled count of width and height
        // let backgroundSize = new MyEngine.Vector2(mapWidth, mapHeight);
        let backgroundSize = new MyEngine.Vector2(mapWidth, mapHeight);

        // TODO: Set base tile in tilemap script
        const baseTile = 10;
        let mapBackground = new MyEngine.Sprites.SpriteMap('map_background', atlasJSON, backgroundSpriteSheet,
          {
            stageSize: backgroundSize,
            outputSize: backgroundSize,
            baseTile: baseTile,     // The base tile to file whole sprite map.
            flipU: true,            //??Sometimes you need to flip, depending on the sprite format.
          },
          scene);

        // NOTE: Size of player sprite is 1. Set position.y = -0.5 makes map
        // being the bottom of player sprite.
        // Transform
        mapBackground.position.x = 0
        mapBackground.position.y = -0.5
        mapBackground.position.z = 0
        mapBackground.rotation.x = Math.PI / 2

        console.log('Background on success')
        console.log('tilesBackground', tilesBackground)

        const tilesToChangeMap: Map<number, MyEngine.Vector2[]> = new Map();
        for (let h = 0; h < mapHeight; h++) {
          for (let w = 0; w < mapWidth; w++) {
            const tileID = tilesBackground[h][w];
            // Default tile is 10
            if(tileID !== baseTile) {
              const tiles = tilesToChangeMap.get(tileID) || [];
              tiles.push(new MyEngine.Vector2(w, h))
              tilesToChangeMap.set(tileID, tiles)
            }
          }
        }

        /**
         * pos - Tile indices, represent tiles which needs to change. (0,0) is the one at left bottom corner.
         * tile - the tile we want to replace to.
         */
        for (let [key, value] of tilesToChangeMap) {
          const tilesToChange = value
          const tileID = key
          mapBackground.changeTiles(0, tilesToChange, tileID)
        }
      };
      backgroundTextTask.onError = (task, message, exception) => {
        console.log('onError >>', task, message, exception)
      }

      const propTextTask = assetsManager.addTextFileTask("text task", mm1_nes_location_general_json);
      //Create the sprite map on successful loading
      propTextTask.onSuccess = (task) => {
        console.log('onSuccess >> propTextTask', task)
        let atlasJSON = JSON.parse(task.text)
        let backgroundSize = new MyEngine.Vector2(mapWidth, mapHeight);

        // TODO: Set base tile in tilemap script
        const baseTile = 0;
        let mapProps = new MyEngine.Sprites.SpriteMap('map_props', atlasJSON, propSpriteSheet,
          {
            stageSize: backgroundSize,
            outputSize: backgroundSize,
            baseTile: baseTile,     // The base tile to file whole sprite map.
            flipU: true,            //??Sometimes you need to flip, depending on the sprite format.
            layerCount: 1,
          },
          scene);

        // Transform
        mapProps.position.x = 0
        mapProps.position.y = -0.5
        mapProps.position.z = 0
        mapProps.rotation.x = Math.PI / 2

        const tilesToChangeMap: Map<number, MyEngine.Vector2[]> = new Map();
        for (let h = 0; h < mapHeight; h++) {
          for (let w = 0; w < mapWidth; w++) {
            const tileID = tilesProps[h][w];
            // Default tile is 10
            if(tileID !== baseTile) {
              const tiles = tilesToChangeMap.get(tileID) || [];
              tiles.push(new MyEngine.Vector2(w, h))
              tilesToChangeMap.set(tileID, tiles)
            }
          }
        }

        console.log('PROP: ', tilesProps, tilesToChangeMap)

        /**
         * pos - Tile indices, represent tiles which needs to change. (0,0) is the one at left bottom corner.
         * tile - the tile we want to replace to.
         */
        for (let [key, value] of tilesToChangeMap) {
          const tilesToChange = value
          const tileID = key
          mapProps.changeTiles(0, tilesToChange, tileID)
        }
      };
      propTextTask.onError = (task, message, exception) => {
        console.log('onError >>', task, message, exception)
      }

      //load the assets manager
      assetsManager.load();

      /***********************************************
       * ECS
       **********************************************/

      const world = new ecstra.World();

      /** Generate entities and add components to entities */
      const playerEntity = world
        .create('player')
        .add(PlayerTagComponent)
        .add(SceneComponent, {scene: scene, name: 'testScene'})
        .add(PositionComponent)
        .add(ControllerComponent, {speed: 4, buffSpeed: 0, velocity: new MyEngine.Vector2(0, 0)})
        .add(RenderableComponent, {
          spriteUrl: playerTextureUrl,
          animationClips: playerAnimationClips,
          playingAnimationClip: playerAnimationClips[AnimationClipNames.STAND_DOWN],
          animationFrameDelay: 100
        });

      /** Register system */
      world
        .register(InputSystem)
        .register(PlayerControllerUpdateSystem)
        .register(PlayerTransformUpdateSystem)
        .register(RenderSystem);

      /** Register world update to BabylonJS */
      GameManager.RegisterBeforeRender((delta: number) => {
        world.execute(delta);
      });

      // Show inspector.
      scene.debugLayer.show({
        embedMode: true,
      });

      resolve(scene);
    })
  };
}

export default new TestScene();
