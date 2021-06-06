import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import * as Sprites from "@babylonjs/core/Sprites";
import { SphereBuilder } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { GroundBuilder } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import {CreateSceneClass} from "../engine/createScene";

import playerTextureUrl from "../../assets/textures/mm1_player.png";

export class SpriteTestScene implements CreateSceneClass {

    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        // This creates and positions a free camera (non-mesh)
        const camera = new ArcRotateCamera(
            "my first camera",
            0,
            Math.PI / 3,
            10,
            new Vector3(0, 0, 0),
            scene
        );

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true, true);

        // Create a sprite manager
        const spriteManagerPlayer = new Sprites.SpriteManager("playerManager", playerTextureUrl, 1, 32, scene);

        const player = new Sprites.Sprite("player0", spriteManagerPlayer);

        // player.position =new Vector3(1, 1, 1);
        // player.angle = Math.PI/4;

        player.playAnimation(12, 15, true, 100, () => {
            console.log('Scene-spriteTestScene: Animation done.');
        });

        return scene;
    };
}

export default new SpriteTestScene();
