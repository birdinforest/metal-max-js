import * as ecstra from "../../lib/ecstra/dist";
import PlayerTagComponent from "../components/playerTagComponent";
import ControllerComponent from "../components/controllerComponent";
import SceneComponent from "../components/sceneComponent";
import RenderableComponent from "../components/renderableComponent";
import * as MyEngine from "../engine";
import { Direction } from "../global";

@ecstra.queries({
    playerController: [
        PlayerTagComponent, ControllerComponent,
        SceneComponent, RenderableComponent]
})
export default class PlayerControllerUpdateSystem extends ecstra.System {
    // Refactor
    private updateController(playerController: ControllerComponent, doMove: boolean, direction: Direction) {

        const isMoving = playerController.velocity.lengthSquared() > 0;
        const changeDirection = playerController.facing !== direction;
        if (isMoving !== doMove || changeDirection) {
            playerController.facing = direction;
            const velocity = playerController.velocity;
            const speed = playerController.speed;
            const buffSpeed = playerController.buffSpeed;
            if(!doMove) {
                velocity.x = 0;
                velocity.y = 0;
                if(velocity instanceof MyEngine.Vector3) {
                    velocity.z = 0;
                }
            } else {
                if(velocity instanceof MyEngine.Vector2) {
                    switch(direction) {
                        case Direction.UP:
                            velocity.x = 0;
                            velocity.y = speed + buffSpeed;
                            break;
                        case Direction.DOWN:
                            velocity.x = 0;
                            velocity.y = -(speed + buffSpeed);
                            break;
                        case Direction.LEFT:
                            velocity.x = -(speed + buffSpeed);
                            velocity.y = 0;
                            break;
                        case Direction.RIGHT:
                            velocity.x = speed + buffSpeed;
                            velocity.y = 0;
                            break;
                        default:
                            break;
                    }
                } else {
                    // Todo: 3D
                }
            }

            console.log('PlayerControllerUpdateSystem >> velocity: ', velocity, ' facing: ', playerController.facing);
        }
    }

    private getDirection(pressingKeys: string[], currentDirection: Direction): Direction {
        let direction = currentDirection;
        if(pressingKeys.length > 0) {
            switch (pressingKeys[pressingKeys.length - 1]) {
                case "a":
                case "A":
                    direction = Direction.LEFT;
                    break
                case "d":
                case "D":
                    direction = Direction.RIGHT;
                    break
                case "w":
                case "W":
                    direction = Direction.UP;
                    break
                case "s":
                case "S":
                    direction = Direction.DOWN;
                    break
                default:
                    break;
            }
        }

        return direction;
    }

    init() {
        super.init && super.init();
        this.queries.playerController.execute(entity => {
            const playerController = entity.read(ControllerComponent);
            console.log(playerController);
        });
    }

    // Todo: Do query in every frame?
    execute(delta: number) {
        this.queries.playerController.execute(entity => {
            const playerControllerComponent = entity.read(ControllerComponent);
            const sceneComponent = entity.read(SceneComponent);
            if(!playerControllerComponent) {
                throw new Error('ControllerUpdate execute failed. Can not find player controller.');
            }
            if(!sceneComponent) {
                throw new Error('ControllerUpdate execute failed. Can not find player controller.');
            }

            const pressingKeys = sceneComponent.pressingKeys;
            const doMove = pressingKeys.length > 0;

            let direction = this.getDirection(pressingKeys, playerControllerComponent.facing);

            this.updateController(playerControllerComponent, doMove, direction);
        })
    }
}
