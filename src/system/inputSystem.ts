import * as ecstra from "../../lib/ecstra/dist";
import SceneComponent from "../components/sceneComponent";
import * as MyEngine from '../engine'
import log from "../engine/log";

/** Input system */
@ecstra.queries({
    scene: [SceneComponent]
})
export default class InputSystem extends ecstra.System {

    private addKeyDown (key: string, pressingKeys: string[]) {
        if(pressingKeys.indexOf(key) === -1) {
            pressingKeys.push(key);
        }
    }

    private removeKeyDown (key: string, pressingKeys: string[]) {
        const index = pressingKeys.indexOf(key);
        if(index !== -1) {
            pressingKeys.splice(index, 1);
        }
    }

    init() {
        super.init && super.init();
        this.queries.scene.execute(entity => {
            const sceneComponent = entity.read(SceneComponent);
            const pressingKeys = sceneComponent?.pressingKeys;
            const scene = sceneComponent?.scene;

            // Todo: Validation of component and its properties.
            if(!sceneComponent) {
                throw new Error('InputSystem initialization failed. Can not find scene component.');
                return;
            }
            if(!scene) {
                throw new Error('InputSystem initialization failed. In scene component, `scene` property is undefined');
                return;
            }
            if(!pressingKeys) {
                throw new Error('InputSystem initialization failed. In scene component, `pressingKeys` property is undefined');
                return;
            }

            scene.onKeyboardObservable.add((kbInfo) => {
                switch (kbInfo.type) {
                    case MyEngine.KeyboardEventTypes.KEYDOWN:
                        // console.log("KEY DOWN: ", kbInfo.event.key);
                        this.addKeyDown(kbInfo.event.key, pressingKeys);
                        // console.log('Input addKeyDown >> ', pressingKeys);
                        break;
                    case MyEngine.KeyboardEventTypes.KEYUP:
                        // console.log("KEY UP: ", kbInfo.event.keyCode);
                        this.removeKeyDown(kbInfo.event.key, pressingKeys);
                        // console.log('Input >> removeKeyDown >> ', pressingKeys);
                        break;
                }
            });

            log.infoECS('InputSystem init in scene. Name: ', sceneComponent?.name);
        })
    }

    execute() {}
}
