import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { FlyCamera } from "@babylonjs/core/Cameras/flyCamera";
import { FollowCamera } from "@babylonjs/core/Cameras/followCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/UniversalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import * as Sprites from "@babylonjs/core/Sprites";
import { SphereBuilder } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { GroundBuilder } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../engine/createScene";

import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";

import playerTextureUrl from "../../assets/textures/mm1_player.png";

import * as ECS from "../ecs/index"


/**
 * Test my customized simple ECS framework. Located at `/src/ecs/`.
 */
export class EcsPovScene implements CreateSceneClass {

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

        enum Direction { UP = 1, DOWN, LEFT, RIGHT }

        const world = new ECS.World('my_world', scene.registerBeforeRender.bind(scene), scene.registerAfterRender.bind(scene));

        const playerEntity = new ECS.Entity('player');
        playerEntity.addComponent(new ECS.Component('health', 100));
        playerEntity.addComponent(new ECS.Component('position', [0,0,0]));
        playerEntity.addComponent(new ECS.Component('spriteUrl', playerTextureUrl));
        playerEntity.addComponent(new ECS.Component('controller', { speed: 0.1, velocity: 0, direction: Direction.DOWN }));

        const render = new ECS.System((entity: ECS.Entity, component: ECS.BaseComponent) => {
            if(component.name === 'spriteUrl') {
                // Create a sprite manager
                let player = entity.getComponent('sprite')?.value?.sprite;
                if(!player) {
                    const spriteManagerPlayer = new Sprites.SpriteManager("playerManager", component.value, 1, 32, scene);
                    player = new Sprites.Sprite("player0", spriteManagerPlayer);

                    entity.addComponent(new ECS.Component('sprite', {
                        sprite: player,
                        animationClips: {
                            [Direction.UP]: [12, 15],
                            [Direction.DOWN]: [0, 3],
                            [Direction.LEFT]: [4, 7],
                            [Direction.RIGHT]: [8, 11],
                        }})
                    );

                    // player.playAnimation(12, 15, true, 100, () => {
                    //     console.log('Scene-spriteTestScene: Animation done.');
                    // });

                    // @ts-ignore
                    window.player = player;
                }

                const positionComponent = entity.getComponent('position');
                if(positionComponent && positionComponent.value !== player.position.asArray()) {
                    player.position = new Vector3(positionComponent.value[0], positionComponent.value[1], positionComponent.value[2]);
                }

                // Update animation depending on `playerController` component.
                const playerController = entity.getComponent('controller');
                if(playerController) {
                    if(playerController.value.velocity === 0) {
                        const isPlayingAnimation = player._animationStarted;
                        if(isPlayingAnimation) {
                            player.stopAnimation();
                        }
                    } else {
                        const fromIndex = player._fromIndex;
                        const toIndex = player._toIndex;
                        const animationClips = entity.getComponent('sprite')?.value?.animationClips;
                        const movingDirection = playerController.value.direction;
                        const desiredFromIndex = animationClips[movingDirection][0];
                        const desiredToIndex = animationClips[movingDirection][1];
                        if(desiredFromIndex !== fromIndex) {
                            // player.stopAnimation();
                            player.playAnimation(desiredFromIndex, desiredToIndex, true, 100, () => {
                                console.log('Scene-spriteTestScene: Animation updated.');
                            });
                        }
                    }
                }

                // console.log('render {System} run.');
            }
        });

        const walk = new ECS.System((entity: ECS.Entity, component: ECS.BaseComponent) => {
            if(component.name === 'position') {
                const position = component.value;
                const controller = entity.getComponent('controller')?.value;
                if(controller) {
                    if(controller.velocity > 0) {
                        switch (controller.direction) {
                            case Direction.UP:
                                position[1] += controller.velocity;
                                break;
                            case Direction.DOWN:
                                position[1] -= controller.velocity;
                                break;
                            case Direction.LEFT:
                                position[0] -= controller.velocity;
                                break;
                            case Direction.RIGHT:
                                position[0] += controller.velocity;
                                break;
                            default:
                                break;
                        }
                        console.log('walk {System}: direction ', controller.direction);
                    }
                }
                // // Play sprite animation
                // const sprite = component.value as Sprites.Sprite;
                // sprite.playAnimation(12, 15, true, 100, () => {
                //     console.log('Scene-spriteTestScene: Animation done.');
                // });
            }
        });

        // Detect key input events. Pass events to `playerController` component.
        const input = new ECS.System((entity: ECS.Entity, component: ECS.BaseComponent) => {
            const updateController = function(doMove: boolean, direction?: Direction) {
                // console.log('update comtroller: ', doMove, direction);
                if(entity.name === 'player' && component.name === 'controller') {
                    const isMoving = component.value.velocity === component.value.speed;
                    const changeDirection = component.value.direction !== direction;
                    if(isMoving !== doMove || changeDirection) {
                        component.value.velocity = doMove ? component.value.speed : 0;
                        if(direction !== undefined) {
                            component.value.direction = direction;
                        }
                        console.log('input[system] updateController: ', component.value);
                    }
                }
            }

            const pressingKeys: string[] = [];

            const addKeyDown = function (key: string) {
                if(pressingKeys.indexOf(key) === -1) {
                    pressingKeys.push(key);
                }
            }

            const removeKeyDown = function (key: string) {
                const index = pressingKeys.indexOf(key);
                if(index !== -1) {
                    pressingKeys.splice(index, 1);
                }
            }

            scene.onKeyboardObservable.add((kbInfo) => {
                switch (kbInfo.type) {
                    case KeyboardEventTypes.KEYDOWN:
                        // console.log("KEY DOWN: ", kbInfo.event.key);
                        addKeyDown(kbInfo.event.key);
                        break;
                    case KeyboardEventTypes.KEYUP:
                        // console.log("KEY UP: ", kbInfo.event.keyCode);
                        removeKeyDown(kbInfo.event.key);
                        break;
                }

                // console.log(pressingKeys);
                if(pressingKeys.length === 0) {
                    updateController(false);
                }

                if(pressingKeys.length > 0) {
                    switch (pressingKeys[pressingKeys.length - 1]) {
                        case "a":
                        case "A":
                            updateController(true, Direction.LEFT);
                            break
                        case "d":
                        case "D":
                            updateController(true, Direction.RIGHT);
                            break
                        case "w":
                        case "W":
                            updateController(true, Direction.UP);
                            break
                        case "s":
                        case "S":
                            updateController(true, Direction.DOWN);
                            break
                        default:
                            updateController(false, Direction.DOWN);
                            break;
                    }
                }
            });
        });

        world
            .addEntity(playerEntity)
            .addInitialSystem(input)
            .addLoopSystem(walk)
            .addLoopSystem(render)
            .run();

        playerEntity.print();

        return scene;
    };
}

export default new EcsPovScene();
