import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { FlyCamera } from "@babylonjs/core/Cameras/flyCamera";
import { FollowCamera } from "@babylonjs/core/Cameras/followCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/UniversalCamera";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import * as Sprites from "@babylonjs/core/Sprites";
import { SphereBuilder } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { GroundBuilder } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";

import { CreateSceneClass } from "../engine/createScene";
import { GameManager } from "../managers/gameManager";

import playerTextureUrl from "../../assets/textures/mm1_player.png";


// import {World, System, ComponentData, TagComponent, Property, NumberProp, StringProp, ArrayProp, RefProp, number, string, array, ref, queries, after} from "../../lib/ecstra/dist/index.js";
// import { array, number, string, ref } from "../../lib/ecstra/dist/index.js";
import * as ecstra from "../../lib/ecstra/dist/index.js";
import log from "../engine/log";


/**
 * A test scene.
 */
export class TestScene implements CreateSceneClass {

    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        // This creates and positions a free camera (non-mesh)
        const camera = new ArcRotateCamera(
            "my first camera",
            Math.PI/2,
            Math.PI/2,
            0,
            new Vector3(0, 0, 10),
            scene
        );

        camera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;

        var distance = 10;
        // @ts-ignore
        var aspect = scene.getEngine().getRenderingCanvasClientRect().height / scene.getEngine().getRenderingCanvasClientRect().width;
        camera.orthoLeft = -distance/2;
        camera.orthoRight = distance / 2;
        camera.orthoBottom = camera.orthoLeft * aspect;
        camera.orthoTop = camera.orthoRight * aspect;


        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        // camera.attachControl(canvas, true, true);
        camera.attachControl(canvas, true, true);

        // player.position =new Vector3(1, 1, 1);
        // player.angle = Math.PI/4;

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
            .add(ControllerComponent, {speed: 1, buffSpeed: 0, velocity: new Vector2(0,0)})
            .add(RenderableComponent, {
                spriteUrl: playerTextureUrl,
                animationClips: playerAnimationClips,
                playingAnimationClip: playerAnimationClips[AnimationClipNames.STAND_DOWN]
            });

        /** Register system */
        world
            .register(InputSystem)
            .register(PlayerControllerUpdateSystem)
            .register(RenderSystem);

        /** Register world update to BabylonJS */
        GameManager.RegisterBeforeRender((delta: number) => {
            world.execute(delta);
        });

        return scene;
    };
}

/***********************************************
 * Enum and types
 **********************************************/

enum Direction { DOWN = 1,UP,  LEFT, RIGHT }
enum AnimationClipNames {
    STAND_DOWN = 'stand_down', STAND_UP = 'stand_up', STAND_LEFT = 'stand_left', STAND_RIGHT = 'stand_right',
    WALK_DOWN = 'walk_down', WALK_UP = 'walk_up', WALK_LEFT = 'walk_left', WALK_RIGHT = 'walk_right'
}

type Vector = Vector2 | Vector3;
interface AnimationClip {name: AnimationClipNames, frames: number[]}

/***********************************************
 * Components
 **********************************************/

class PlayerTagComponent extends ecstra.TagComponent {}

class PositionComponent extends ecstra.ComponentData {
    @ecstra.array([0,0,0])
    position!: number[];
}

class ControllerComponent extends ecstra.ComponentData {
    /**
     * Speed per second in moving.
     */
    @ecstra.number(0)
    readonly speed!: number;

    /**
     * Buff of speed per second
     */
    @ecstra.number(0)
    buffSpeed!: number;

    /**
     * Moving velocity.
     */
    @ecstra.ref()
    velocity!: Vector;

    /**
     * Facing to direction.
     */
    @ecstra.number(1)
    facing: Direction = Direction.DOWN;
}

/**
 * All rendering necessary.
 */
class RenderableComponent extends ecstra.ComponentData {
    @ecstra.string('')
    spriteUrl!: string;

    /**
     * Generated by BabylonJS sprite manager at scene initialization.
     * Used to render entity and play animation clips.
     */
    @ecstra.ref(null)
    sprite!: Sprites.Sprite;

    /**
     * Animation clips.
     * Key: direction. Value: Array of starting frame index and ending frame index.
     */
    @ecstra.ref(undefined)
    animationClips?: {[key: string]: AnimationClip};

    /**
     * Current playing animation clips.
     */
    @ecstra.ref()
    playingAnimationClip?: AnimationClip;

    /**
     * Delay time between frames by ms.
     */
    @ecstra.number(200)
    animationFrameDelay!: number;
}

/** Global variable in this scene */
class SceneComponent extends ecstra.ComponentData {
    /** Host scene */
    @ecstra.ref(undefined)
    scene!: Scene;

    /** Host scene name */
    @ecstra.string('')
    name?: string;

    /** Input keys */
    @ecstra.array<string>([])
    pressingKeys!: Array<string>;
}


/***********************************************
 * Systems
 **********************************************/

/** Entity containing  */
@ecstra.queries({
    scene: [SceneComponent]
})
class InputSystem extends ecstra.System {

    private addKeyDown (key: string, pressingKeys: string[]) {
        if(pressingKeys.indexOf(key) === -1) {
            pressingKeys.push(key);
        }
    }

    private removeKeyDown (key: string, pressingKeys: string[]) {
        const index = pressingKeys.indexOf(key);
        if(index !== -1) {
            pressingKeys.splice(index, 1);
        }
    }

    init() {
       super.init && super.init();
       this.queries.scene.execute(entity => {
           const sceneComponent = entity.read(SceneComponent);
           const pressingKeys = sceneComponent?.pressingKeys;
           const scene = sceneComponent?.scene;

           // Todo: Validation of component and its properties.
           if(!sceneComponent) {
               throw new Error('InputSystem initialization failed. Can not find scene component.');
               return;
           }
           if(!scene) {
               throw new Error('InputSystem initialization failed. In scene component, `scene` property is undefined');
               return;
           }
           if(!pressingKeys) {
               throw new Error('InputSystem initialization failed. In scene component, `pressingKeys` property is undefined');
               return;
           }

           scene.onKeyboardObservable.add((kbInfo) => {
               switch (kbInfo.type) {
                   case KeyboardEventTypes.KEYDOWN:
                       // console.log("KEY DOWN: ", kbInfo.event.key);
                       this.addKeyDown(kbInfo.event.key, pressingKeys);
                       // console.log('Input addKeyDown >> ', pressingKeys);
                       break;
                   case KeyboardEventTypes.KEYUP:
                       // console.log("KEY UP: ", kbInfo.event.keyCode);
                       this.removeKeyDown(kbInfo.event.key, pressingKeys);
                       // console.log('Input >> removeKeyDown >> ', pressingKeys);
                       break;
               }
           });

           log.infoECS('InputSystem init in scene. Name: ', sceneComponent?.name);
       })
    }

    execute() {}
}

@ecstra.queries({
    playerController: [
        PlayerTagComponent, ControllerComponent,
        SceneComponent, RenderableComponent]
})
class PlayerControllerUpdateSystem extends ecstra.System {
    // Refactor
    private updateController(playerController: ControllerComponent, doMove: boolean, direction: Direction) {
        playerController.facing = direction;

        const isMoving = playerController.velocity.lengthSquared() > 0;
        const changeDirection = playerController.facing !== direction;
        if (isMoving !== doMove || changeDirection) {
            const velocity = playerController.velocity;
            const speed = playerController.speed;
            const buffSpeed = playerController.buffSpeed;
            if(!doMove) {
                velocity.x = 0;
                velocity.y = 0;
                if(velocity instanceof Vector3) {
                    velocity.z = 0;
                }
            } else {
                if(velocity instanceof Vector2) {
                    switch(direction) {
                        case Direction.UP:
                            velocity.x = 0;
                            velocity.y = speed + buffSpeed;
                            break;
                        case Direction.DOWN:
                            velocity.x = 0;
                            velocity.y = -(speed + buffSpeed);
                            break;
                        case Direction.LEFT:
                            velocity.x = speed + buffSpeed;
                            velocity.y = 0;
                            break;
                        case Direction.RIGHT:
                            velocity.x = -(speed + buffSpeed);
                            velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                } else {
                    // Todo: 3D
                }
            }

            console.log('PlayerControllerUpdateSystem >> velocity: ', velocity, ' facing: ', playerController.facing);
        }
    }

    private getDirection(pressingKeys: string[], currentDirection: Direction): Direction {
        let direction = currentDirection;
        if(pressingKeys.length > 0) {
            switch (pressingKeys[pressingKeys.length - 1]) {
                case "a":
                case "A":
                    direction = Direction.LEFT;
                    break
                case "d":
                case "D":
                    direction = Direction.RIGHT;
                    break
                case "w":
                case "W":
                    direction = Direction.UP;
                    break
                case "s":
                case "S":
                    direction = Direction.DOWN;
                    break
                default:
                    break;
            }
        }

        return direction;
    }

    init() {
        super.init && super.init();
        this.queries.playerController.execute(entity => {
            const playerController = entity.read(ControllerComponent);
            console.log(playerController);
        });
    }

    // Todo: Do query in every frame?
    execute(delta: number) {
        this.queries.playerController.execute(entity => {
            const playerControllerComponent = entity.read(ControllerComponent);
            const sceneComponent = entity.read(SceneComponent);
            if(!playerControllerComponent) {
                throw new Error('ControllerUpdate execute failed. Can not find player controller.');
            }
            if(!sceneComponent) {
                throw new Error('ControllerUpdate execute failed. Can not find player controller.');
            }

            const pressingKeys = sceneComponent.pressingKeys;
            const doMove = pressingKeys.length > 0;

            let direction = this.getDirection(pressingKeys, playerControllerComponent.facing);

            this.updateController(playerControllerComponent, doMove, direction);
        })
    }
}

/** Entity containing renderable component and scene component*/
@ecstra.queries({
    renderable: [RenderableComponent, SceneComponent, ControllerComponent]
})
class RenderSystem extends ecstra.System {
    init() {
        super.init && super.init();
        // Create sprite.
        this.queries.renderable.execute(entity => {
            const sceneComponent = entity.read(SceneComponent);
            const scene = sceneComponent?.scene;
            const renderableComponent = entity.read(RenderableComponent);
            const spriteUrl = renderableComponent && renderableComponent.spriteUrl;
            if(scene && spriteUrl) {
                const spriteManager = new Sprites.SpriteManager(
                    "spriteManager",
                    spriteUrl, 1, 32,
                    scene
                );

                if(renderableComponent) {
                    renderableComponent.sprite = new Sprites.Sprite("playerSprite", spriteManager);
                }
            } else {
                if(!scene) {
                    throw new Error('RenderSystem initialization failed. Can not find scene component.');
                } else if(!renderableComponent) {
                    throw new Error('RenderSystem initialization failed. Can not find renderable component.');
                } else if(!spriteUrl) {
                    throw new Error('RenderSystem initialization failed. Can not find spriteUrl property in renderable component.');
                }
            }
            log.infoECS('RenderSystem init in scene. Name: ', sceneComponent?.name);
        })
    }

    execute(delta: number) {
        this.queries.renderable.execute(entity => {
            const controllerComponent = entity.read(ControllerComponent);
            const renderableComponent = entity.read(RenderableComponent);

            const sprite = renderableComponent?.sprite;
            const animationClips = renderableComponent?.animationClips;
            const frameDelay = renderableComponent?.animationFrameDelay || 200;

            if (!sprite || !animationClips || !controllerComponent) {
                return;
            }

            let isPlayingAnimation = sprite.animationStarted;
            let isMoving = controllerComponent.velocity.lengthSquared() > 0;

            let animationNameToPlay = AnimationClipNames.STAND_DOWN;

            // Update animation playing
            switch (controllerComponent.facing) {
                case Direction.UP:
                    animationNameToPlay = isMoving
                        ? AnimationClipNames.WALK_UP
                        : AnimationClipNames.STAND_UP;
                    break;
                case Direction.DOWN:
                    animationNameToPlay = isMoving
                        ? AnimationClipNames.WALK_DOWN
                        : AnimationClipNames.STAND_DOWN;
                    break;
                case Direction.LEFT:
                    animationNameToPlay = isMoving
                        ? AnimationClipNames.WALK_LEFT
                        : AnimationClipNames.STAND_LEFT;
                    break;
                case Direction.RIGHT:
                    animationNameToPlay = isMoving
                        ? AnimationClipNames.WALK_RIGHT
                        : AnimationClipNames.STAND_RIGHT;
                    break;
                default:
                    break;
            }

            let needAnimationUpdate = false;
            if (isPlayingAnimation) {
                const currentPlayingFrames = [sprite.fromIndex, sprite.toIndex];
                const animationClipToPlay = animationClips[animationNameToPlay].frames;
                needAnimationUpdate = currentPlayingFrames[0] !== animationClipToPlay[0] || currentPlayingFrames[1] !== animationClipToPlay[1];
            } else {
                needAnimationUpdate = true;
            }

            if(animationNameToPlay && needAnimationUpdate) {
                sprite.playAnimation(
                    animationClips[animationNameToPlay].frames[0],
                    animationClips[animationNameToPlay].frames[1],
                    true, frameDelay);
            }
        });
    }

    dispose() {
        super.dispose && super.dispose();
        console.log('TestSystem >> dispose.');
    }
}


export default new TestScene();
