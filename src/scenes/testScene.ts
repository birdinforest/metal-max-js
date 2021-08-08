import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";

import { CreateSceneClass } from "../engine/createScene";
import { GameManager } from "../managers/gameManager";

import playerTextureUrl from "../../assets/textures/mm1_player.png";

// import {World, System, ComponentData, TagComponent, Property, NumberProp, StringProp, ArrayProp, RefProp, number, string, array, ref, queries, after} from "../../lib/ecstra/dist/index.js";
// import { array, number, string, ref } from "../../lib/ecstra/dist/index.js";
import * as ecstra from "../../lib/ecstra/dist/index.js";
import * as MyEngine from "../engine";
import log from "../engine/log";

/** Components */
import RenderableComponent, { AnimationClipNames, AnimationClip } from "../components/renderableComponent"
import PlayerTagComponent from "../components/playerTagComponent"
import SceneComponent from "../components/sceneComponent"
import PositionComponent from "../components/positionComponent"
import ControllerComponent from '../components/controllerComponent'

/** Systems */
import PlayerTransformUpdateSystem from '../system/playerTransformUpdateSystem'
import PlayerControllerUpdateSystem from '../system/playerControllerUpdateSystem'
import RenderSystem from '../system/renderSystem'
import InputSystem from '../system/inputSystem'

/**
 * A test scene.
 */
export class TestScene implements CreateSceneClass {

    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {

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
            Math.PI/2,
            Math.PI/2,
            0,
            new MyEngine.Vector3(0, 0, 20),
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


        // This targets the camera to scene origin
        camera.setTarget(MyEngine.Vector3.Zero());

        // This attaches the camera to the canvas
        // camera.attachControl(canvas, true, true);
        camera.attachControl(canvas, true, true);

        /***********************************************
         * Assets meta
         **********************************************/

        const playerAnimationClips: {[key: string]: AnimationClip} = {
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
        let spriteSheet = new MyEngine.Texture("textures/spriteMap/none_trimmed/Legends_Level_A.png", scene,
            false, //NoMipMaps
            false, //InvertY usually false if exported from TexturePacker
            MyEngine.Texture.NEAREST_NEAREST, //Sampling Mode
            null, //Onload, you could spin up the sprite map in a function nested here
            null, //OnError
            null, //CustomBuffer
            false, //DeleteBuffer
            Engine.TEXTUREFORMAT_RGBA //ImageFormageType RGBA
    );

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
            .add(ControllerComponent, {speed: 0.1, buffSpeed: 0, velocity: new MyEngine.Vector2(0,0)})
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

        return scene;
    };
}

export default new TestScene();
