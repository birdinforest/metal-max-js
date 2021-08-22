import { GameEngine, GameEngineOptions } from "../engine/gameEngine";

export interface GameManagerOptions {
    sceneDirectoryPath: 'scenes',
}

export class GameManager {
    private static _hasInitialized: boolean = false;
    private static _instance: GameManager;
    private static _engine: GameEngine;

    private static options?: GameManagerOptions;

    private static _beforeSceneRender = new Map<number, Function|undefined>();
    private static _afterSceneRender = new Map<number, Function|undefined>();

    private constructor(options?: GameManagerOptions) {
        GameManager.options = options;
    }

    /**
     * Initializes
     * @param options - Options to initialize game engine.
     */
    public static Initialization(options?: GameManagerOptions): GameManager {
        if(!GameManager._instance) {
            GameManager._instance = new GameManager(options);
            GameManager._hasInitialized = true;
        }

        // Initialize game engine.
        GameManager._engine = GameEngine.Initialization();

        // TODO: Init controllers and other components

        GameManager._beforeSceneRender.set(0, undefined);
        GameManager._afterSceneRender.set(0, undefined);

        return GameManager._instance;
    }

    public static RegisterBeforeRender(fun: Function) {
        GameManager._beforeSceneRender.set(0, fun);
        console.log('GameManager >> RegisterBeforeRender: ', GameManager._beforeSceneRender.get(0));
    }

    public static RegisterAfterRender(fun: Function) {
        GameManager._afterSceneRender.set(0, fun);
    }

    /**
     * Start game.
     */
    public async start(
        initialization?: Function,
        dispose?: Function
    ): Promise<void> {
        if(!GameManager._hasInitialized) {
            throw new Error('GameManager has not been initialized.')
        }

        await GameManager._engine.start(
            initialization,
            (delta: number) => {GameManager._beforeSceneRender.get(0)?.call(this, delta)},
            (delta: number) => {GameManager._afterSceneRender.get(0)?.call(this, delta)},
            dispose).catch((e) => {
            console.error('GameManager._engine.start failed.')
            throw new Error(e);
        });
    }
}
