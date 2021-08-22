import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import * as Sprites from "@babylonjs/core/Sprites";
import { Scene } from "@babylonjs/core/scene";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { Engine } from "@babylonjs/core/Engines/engine";
import { AssetsManager, TextFileAssetTask } from "@babylonjs/core/Misc/assetsManager";

/**
 * Default loading screen from Babylon
 * TODO: Assign it in engine. Config it when engine init.
 */
import '@babylonjs/core/Loading/loadingScreen';

import "@babylonjs/inspector";


export { Texture, Vector2, Vector3, Sprites, Scene, Engine, AssetsManager, TextFileAssetTask, KeyboardEventTypes }
