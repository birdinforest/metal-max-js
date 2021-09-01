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
import '@babylonjs/core/Loading/loadingScreen'

/**
 * TODO: Create a separate file to import followings and toggle debug. For code split and side loading.
 * https://forum.babylonjs.com/t/how-to-use-inspector-with-es6-modules/8619/17
 * https://github.com/sebavan/BabylonjsInkSample/blob/master/src/debug/appDebug.ts
 *
 * A known issue about capture feature of inspector:
 * https://forum.babylonjs.com/t/inspectors-tools-n-color3-is-not-a-constructor/8777
 */
import '@babylonjs/inspector'
import '@babylonjs/core/Debug/debugLayer'


export { Texture, Vector2, Vector3, Sprites, Scene, Engine, AssetsManager, TextFileAssetTask, KeyboardEventTypes }
