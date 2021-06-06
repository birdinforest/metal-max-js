import { World } from './index'

export class System {
    private readonly mechanism: Function;
    private world: World | undefined;
    constructor(mechanism: Function) {
        this.mechanism = mechanism;
    }

    attach(world: World): System {
        this.world = world;
        return this;
    }

    run() {
        this.world?.entities.forEach(entity => {
            entity.components.forEach(component => this.mechanism(entity, component));
        })
    }
}
