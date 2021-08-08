import * as ecstra from "../../lib/ecstra/dist";

export default class PositionComponent extends ecstra.ComponentData {
    @ecstra.array([0,0,0])
    position!: number[];
}
