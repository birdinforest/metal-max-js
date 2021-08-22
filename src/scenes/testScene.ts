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
const mapSpriteSheetUrl = "/assets/textures/legends.png";
const mapSpriteJsonUrl = "/assets/textures/legends.json";

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
        -Math.PI/2,0,                    // Camera angle
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

        // TODO: Tiled map
        // Load the spritesheet (with appropriate settings) associated with the JSON Atlas.
        let spriteSheet = new MyEngine.Texture(mapSpriteSheetUrl, scene,
          false, //NoMipMaps
          false, //InvertY usually false if exported from TexturePacker
          MyEngine.Texture.NEAREST_NEAREST, //Sampling Mode
          null, //Onload, you could spin up the sprite map in a function nested here
          null, //OnError
          null, //CustomBuffer
          false, //DeleteBuffer
        );

        // Create an assets manager to load the JSON file
        const assetsManager = new MyEngine.AssetsManager(scene);
        const textTask = assetsManager.addTextFileTask("text task", mapSpriteJsonUrl);

        //Create the sprite map on succeful loading
        textTask.onSuccess = (task) => {
          console.log('onSuccess >> task', task)
          let atlasJSON = JSON.parse(task.text)
          let backgroundSize = new MyEngine.Vector2(8, 5);

          let background = new MyEngine.Sprites.SpriteMap('background', atlasJSON, spriteSheet,
            {
              stageSize: backgroundSize,
              baseTile: 36,     // The base tile to file whole sprite map.
              flipU: true,      //??Sometimes you need to flip, depending on the sprite format.
            },
            scene);

          // Transform
          background.position.x = 0
          background.position.y = -0.01
          background.position.z = 0
          background.rotation.x = Math.PI/2

          // Change a row of 8 tiles to Roman columns
          // Tile indices. (0,0) is the one at left bottom corner.
          const tiles = [];
          for(let i = 0; i < 8; i++){
            tiles.push(new MyEngine.Vector2(i, 3))
          }

          /**
           * pos - Tile indices, represent tiles which needs to change. (0,0) is the one at left bottom corner.
           * tile - the tile we want to replace to.
           */
          background.changeTiles(0, tiles, 18)
        };

        textTask.onError = (task, message, exception) => {
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
