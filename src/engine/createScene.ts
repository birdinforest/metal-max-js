type Engine = import("@babylonjs/core/Engines/engine").Engine;
type Scene = import("@babylonjs/core/scene").Scene;

export interface CreateSceneClass {
    createScene: (engine: Engine, canvas: HTMLCanvasElement) => Promise<Scene>;
    preTasks?: Promise<unknown>[];
}

export interface CreateSceneModule {
    default: CreateSceneClass;
}

/**
 * Load scene.
 * @param sceneDirectoryPath - Path to the scene directory.
 * @param name - Name of the scene.
 */
export const getSceneModuleWithName = (
    sceneDirectoryPath?: string,
    name = 'defaultWithTexture'
): Promise<CreateSceneClass> => {
    // 'scenes' is defined as alias in `webpack.common.js`.
    // Any possible to make it being a config of game engine?
    // Right now if we use expression `sceneDirectoryPath + '/' + name`, it can't load the scene.
    // Works is we use expression `'../' + sceneDirectoryPath + '/' + name`, but there is warning from ts-loader.
    return import('scenes/' + name).then((module: CreateSceneModule)=> {
        return module.default;
    });

    // To build quicker, replace the above return statement with:

    // return import('./scenes/defaultWithTexture').then((module: CreateSceneModule)=> {
    //     return module.default;
    // });
};

