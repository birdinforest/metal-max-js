import * as ecstra from "../../lib/ecstra/dist";
import * as MyEngine from "../engine";

/** Global variable in this scene */
export default class SceneComponent extends ecstra.ComponentData {
    /** Host scene */
    @ecstra.ref(undefined)
    scene!: MyEngine.Scene;

    /** Host scene name */
    @ecstra.string('')
    name?: string;

    /** Input keys */
    @ecstra.array<string>([])
    pressingKeys!: Array<string>;
}
