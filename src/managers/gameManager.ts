import { GameEngine, GameEngineOptions } from "../engine/gameEngine";

export interface GameManagerOptions {
    sceneDirectoryPath: 'scenes',
}

export class GameManager {
    private static _hasInitialized: boolean = false;
    private static _instance: GameManager;
    private static _engine: GameEngine;
    
    private static options?: GameManagerOptions;
    

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

        return GameManager._instance;
    }

    /**
     * Start game.
     */
    public async start(): Promise<void> {
        if(!GameManager._hasInitialized) {
            throw new Error('GameManager has not been initialized.')
        }
        
        await GameManager._engine.start().catch((e) => {
            console.error(e);
        });
    }
}