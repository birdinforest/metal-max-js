import * as ecstra from "../../lib/ecstra/dist";
import RenderableComponent, {AnimationClipNames} from "../components/renderableComponent";
import SceneComponent from "../components/sceneComponent";
import ControllerComponent from "../components/controllerComponent";
import PositionComponent from "../components/positionComponent";
import * as MyEngine from "../engine";
import { Direction } from '../global'
import log from "../engine/log";

/** Render system. Only handle player entity now. */
@ecstra.queries({
    renderable: [RenderableComponent, SceneComponent, ControllerComponent, PositionComponent]
})
export default class RenderSystem extends ecstra.System {
    init() {
        super.init && super.init();
        // Create sprite.
        this.queries.renderable.execute(entity => {
            const sceneComponent = entity.read(SceneComponent);
            const scene = sceneComponent?.scene;
            const renderableComponent = entity.read(RenderableComponent);
            const spriteUrl = renderableComponent && renderableComponent.spriteUrl;
            if(scene && spriteUrl) {
                const spriteManager = new MyEngine.Sprites.SpriteManager(
                    "spriteManager",
                    spriteUrl, 1, 32,
                    scene
                );

                if(renderableComponent) {
                    renderableComponent.sprite = new MyEngine.Sprites.Sprite("playerSprite", spriteManager);
                }
            } else {
                if(!scene) {
                    throw new Error('RenderSystem initialization failed. Can not find scene component.');
                } else if(!renderableComponent) {
                    throw new Error('RenderSystem initialization failed. Can not find renderable component.');
                } else if(!spriteUrl) {
                    throw new Error('RenderSystem initialization failed. Can not find spriteUrl property in renderable component.');
                }
            }
            log.infoECS('RenderSystem init in scene. Name: ', sceneComponent?.name);
        })
    }

    execute(delta: number) {
        this.queries.renderable.execute(entity => {
            const controllerComponent = entity.read(ControllerComponent);
            const renderableComponent = entity.read(RenderableComponent);
            const position = entity.read(PositionComponent)?.position;

            const sprite = renderableComponent?.sprite;
            const animationClips = renderableComponent?.animationClips;
            const frameDelay = renderableComponent?.animationFrameDelay || 200;

            if (!sprite || !animationClips || !controllerComponent) {
                return;
            }

            let isPlayingAnimation = sprite.animationStarted;
            let isMoving = controllerComponent.velocity.lengthSquared() > 0;

            let animationNameToPlay = AnimationClipNames.STAND_DOWN;

            // Update animation playing
            switch (controllerComponent.facing) {
                case Direction.UP:
                    animationNameToPlay = isMoving
                        ? AnimationClipNames.WALK_UP
                        : AnimationClipNames.STAND_UP;
                    break;
                case Direction.DOWN:
                    animationNameToPlay = isMoving
                        ? AnimationClipNames.WALK_DOWN
                        : AnimationClipNames.STAND_DOWN;
                    break;
                case Direction.LEFT:
                    animationNameToPlay = isMoving
                        ? AnimationClipNames.WALK_LEFT
                        : AnimationClipNames.STAND_LEFT;
                    break;
                case Direction.RIGHT:
                    animationNameToPlay = isMoving
                        ? AnimationClipNames.WALK_RIGHT
                        : AnimationClipNames.STAND_RIGHT;
                    break;
                default:
                    break;
            }

            let needAnimationUpdate = false;
            if (isPlayingAnimation) {
                const currentPlayingFrames = [sprite.fromIndex, sprite.toIndex];
                const animationClipToPlay = animationClips[animationNameToPlay].frames;
                needAnimationUpdate = currentPlayingFrames[0] !== animationClipToPlay[0] || currentPlayingFrames[1] !== animationClipToPlay[1];
            } else {
                needAnimationUpdate = true;
            }

            if(animationNameToPlay && needAnimationUpdate) {
                sprite.playAnimation(
                    animationClips[animationNameToPlay].frames[0],
                    animationClips[animationNameToPlay].frames[1],
                    true, frameDelay);
            }

            if(position) {
                sprite.position = new MyEngine.Vector3(position[0], position[1], position[2]);
            }
        });
    }

    dispose() {
        super.dispose && super.dispose();
        console.log('TestSystem >> dispose.');
    }
}
