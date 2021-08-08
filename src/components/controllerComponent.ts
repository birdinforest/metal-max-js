import * as ecstra from "../../lib/ecstra/dist";
import * as MyEngine from "../engine";
import { Direction } from "../global";

export type Vector = MyEngine.Vector2 | MyEngine.Vector3;

export default class ControllerComponent extends ecstra.ComponentData {
    /**
     * Speed per second in moving.
     */
    @ecstra.number(0)
    readonly speed!: number;

    /**
     * Buff of speed per second
     */
    @ecstra.number(0)
    buffSpeed!: number;

    /**
     * Moving velocity.
     */
    @ecstra.ref()
    velocity!: Vector;

    /**
     * Facing to direction.
     */
    @ecstra.number(1)
    facing: Direction = Direction.DOWN;
}
