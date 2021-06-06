import { Entity, System } from './index'

export class World <E extends Entity = Entity> {
    public entities: Entity[] = [];
    private initialSystems: System[] = [];
    private loopSystems: System[] = [];
    private name = '';
    private readonly loopRegisterBeforeRender: Function;
    private readonly loopRegisterAfterRender: Function;

    constructor(name: string, loopRegisterBeforeRender: any | undefined, loopRegisterAfterRender: any | undefined) {
        this.name = name;
        this.loopRegisterBeforeRender = loopRegisterBeforeRender;
        this.loopRegisterAfterRender = loopRegisterAfterRender;
    }

    addEntity(entity: Entity): World {
        this.entities.push(entity);
        return this;
    }

    /**
     * Only run once in initialization.
     * @param system
     */
    addInitialSystem(system: System): World {
        system.attach(this);
        this.initialSystems.push(system);
        return this;
    }

    /**
     * Loop. In babylonjs, `system.run()` is registered into `scene.registerBeforeRender`.
     * @param system
     */
    addLoopSystem(system: System): World {
        system.attach(this);
        this.loopSystems.push(system);
        console.log(this.loopRegisterBeforeRender);
        console.log(system.run);
        this.loopRegisterBeforeRender && this.loopRegisterBeforeRender(() => system.run());
        return this;
    }

    run() {
        this.initialSystems.forEach(sys => sys.run());
    }
}
