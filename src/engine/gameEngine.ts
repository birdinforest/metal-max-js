import { getSceneModuleWithName } from "./createScene";
import { Engine } from "@babylonjs/core/Engines/engine";
import log from "./log";
import {before} from "../../lib/ecstra/dist";

const getModuleToLoad = (): string | undefined => {
    // ATM using location.search
    if(!location.search) {
        return;
    } else {
        return location.search.substr(location.search.indexOf('scene=') + 6);
    }
}

const babylonInit = async (
    options?: GameEngineOptions,
    beforeSceneRender?: Function,
    afterSceneRender?: Function,
): Promise<void>  => {
    // get the module to load
    const moduleName = getModuleToLoad();
    const createSceneModule = await getSceneModuleWithName(options?.sceneDirectoryPath, moduleName);

    // Execute the pretasks, if defined
    await Promise.all(createSceneModule.preTasks || []);
    // Get the canvas element
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    // Generate the BABYLON 3D engine
    const engine = new Engine(canvas, true);

    // Create the scene
    const scene = await createSceneModule.createScene(engine, canvas);

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        beforeSceneRender && beforeSceneRender(engine.getDeltaTime());
        scene.render();
        afterSceneRender && afterSceneRender(engine.getDeltaTime());
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
}

export interface GameEngineOptions {
    sceneDirectoryPath?: string;
}

export class GameEngine {
    private static _hasInitialized: boolean = false;
    private static _instance: GameEngine;
    private static options?: GameEngineOptions;

    private constructor(options?: GameEngineOptions) {
        GameEngine.options = options;
    }

    /**
     * Initializes
     * @param options - Options to initialize game engine.
     */
    public static Initialization(options?: GameEngineOptions): GameEngine {
        if(!GameEngine._instance) {
            GameEngine._instance = new GameEngine(options);
            GameEngine._hasInitialized = true;
        }

        // TODO

        return GameEngine._instance;
    }

    /**
     * Start engine.
     */
    public async start(
        initialization?: Function,
        beforeSceneRender?: Function,
        afterSceneRender?: Function,
        /** No implement */ dispose?: Function,
    ): Promise<void> {
        if(!GameEngine._hasInitialized) {
            throw new Error('GameEngine has not been initialized.')
        }

        initialization && initialization();

        await babylonInit(GameEngine.options, beforeSceneRender, afterSceneRender)
            .then(() => {
                log.infoEngine('Babylon initialization done.');
            })
            .catch(e => {
            throw new Error('Babylon initialization failed: \n' + e.stack + '\n' + e.message);
        });

        // scene started rendering, everything is initialized
        log.infoEngine('Engine start rendering.')
    }
}
