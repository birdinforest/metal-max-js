import * as ecstra from "../../lib/ecstra/dist";
import PlayerTagComponent from "../components/playerTagComponent";
import ControllerComponent from "../components/controllerComponent";
import PositionComponent from "../components/positionComponent";

/** Transform update system of player entity. */
@ecstra.queries({
    player: [PlayerTagComponent, ControllerComponent, PositionComponent]
})
export default class PlayerTransformUpdateSystem extends ecstra.System {
    init() {
        super.init && super.init();
    }

    execute(delta: number) {

        this.queries.player.execute(entity => {
            const controller = entity.read(ControllerComponent);

            const position = entity.read(PositionComponent)?.position;

            if(!controller) {
                throw new Error('PlayerTransformUpdateSystem execute failed. Can not find player controller.');
            }
            if(!position) {
                throw new Error('PlayerTransformUpdateSystem execute failed. Can not find postion component.');
            }

            const isMoving = controller.velocity.lengthSquared() > 0;
            if(isMoving) {
                position[0] += controller.velocity.x * delta / 1000
                position[2] += controller.velocity.y * delta / 1000
            }

            // console.log('Position: ', position)
        })
    }

    dispose() {
        super.dispose && super.dispose();
        console.log('TestSystem >> dispose.');
    }
}
