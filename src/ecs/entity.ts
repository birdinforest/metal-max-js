import { BaseComponent, System } from "./index";
import * as Sprites from "@babylonjs/core/Sprites";
import {Nullable} from "./types";

export class Entity {
    private static count = 0;
    private id: string | undefined;
    public name: Nullable<string>;
    public components = new Map<string, BaseComponent>();
    private systems = new Map<string, System>();

    constructor(name: string) {
        this.id = (+new Date()).toString(16) + (Math.random() * 100000000 | 0).toString(16) + Entity.count;
        this.name = name;
        Entity.count++;
    }

    addComponent(component: BaseComponent): Entity {
        this.components.set(component.name, component);
        return this;
    }

    removeComponent(component: BaseComponent | string): Entity {
        if (component instanceof BaseComponent) {
            this.components.delete(component.name);
        } else {
            this.components.delete(component as string);
        }
        return this;
    }

    getComponent(name: string): BaseComponent | undefined {
        return this.components.get(name);
    }

    print() {
        console.log(JSON.stringify(this, null, 2));
        console.log('components:');
        this.components.forEach((value, key) => {
            if(value instanceof Sprites.Sprite) {
                console.log(key, value);
            } else {
                try {
                    console.log(key, JSON.stringify(value, null, 2));
                } catch (e) {
                    console.log(value.value);
                }
            }
        })
        return this;
    }
}
