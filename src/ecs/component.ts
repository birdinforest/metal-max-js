import {Property} from './property';
import {Constructor, ComponentClass, Option, PropertiesOf, Nullable} from './types';

export enum ComponentState {
    None = 0,
    Added = 1,
    Ready = 2,
    Removed = 3
}

/**
 * Base class for a component.
 *
 * Components are attached to entity and are used as a source of inputs.
 * Components should only contain data and no logic
 *
 * @category components
 * @ref https://github.com/DavidPeicho/ecstra/blob/8ed385b31d/src/component.ts
 */
export abstract class BaseComponent {
    /** Name of the component class */
    public static readonly ClassName?: string;

    /** `true` if the object instance derives from [[Component]] */
    public readonly isBaseComponent!: true;

    /** @hidden */
    public _state: ComponentState;
    /** @hidden */
    public _pooled: boolean;

    /** Name of the component instance */
    public name: string;
    /** Data bundle of component instance */
    public value?: any;

    protected constructor(name: string, value?: any) {
        Object.defineProperty(this, 'isBaseComponent', { value: true });
        this._state = ComponentState.None;
        this._pooled = false;

        this.name = name;

        this.value = value;
    }

    /**
     * This is useless for now.
     */
    get state(): ComponentState {
        return this._state;
    }

    /**
     * Returns `true` if the component instance has been created from a component
     * pool. `false` otherwise
     */
    get pooled(): boolean {
        return this._pooled;
    }
}

export class Component extends BaseComponent {

    /**
     * Component schema.
     *
     * This should list all the data the component will host
     */
    public static readonly Properties?: Properties;

    /** `true` if the instance derives from the [[ComponentData]] class */
    public readonly isComponent!: true;

    public constructor(name: string, value?: any) {
        super(name, value);

        Object.defineProperty(this, 'isComponent', { value: true });

        // Copy default values for properties found in the inheritance hierarchy.
        let Class = this.constructor as ComponentClass
        do {
            const staticProps = Class.Properties;
            if(!staticProps) {
                continue;
            }
            for (const name in staticProps) {
                const prop = staticProps[name];
                this[name as keyof this] = prop.cloneDefault();
            }
        } while (!!(Class = Object.getPrototypeOf(Class)) && Class !== Component);

        this.name = name;
        this.value = value;
    }

    /**
     * Copies the `source` argument into this instance. The `source`
     *
     * @param source - Source data to copy into `this` instance. Can be either
     * another component of the same type, or a literal object containing the
     * same properties as the component (mapped to the same types)
     *
     * @return This instance
     */
    public copy(source: PropertiesOf<this>): this {
        const Class = this.constructor as ComponentClass;
        for(const name in source) {
            const prop = findProperty(Class, name);
            if(prop) {
                const value = source[name as keyof PropertiesOf<this>];
                this[name as keyof this] = prop.copy(this[name as keyof this], value);
            }
        }
        return this;
    }

    /**
     * Returns a new instance set to the same values as `this`
     *
     * @returns A clone of `this` instance
     */
    public clone(): this {
        return new (this.constructor as Constructor<this>)().copy(this);
    }

    /**
     * Initiliazes the component with its default properties, overriden by
     * the `source`
     *
     * @param source - Source object to feed the component
     * @return This instance
     */
    public init(source: PropertiesOf<this>): this {
        let Class = this.constructor as ComponentClass;
        do {
            // Copy properties found in the inheritance hierarchy. If the property
            // isn't found in the source, the default value is used.
            const staticProps = Class.Properties;
            if (!staticProps) {
                continue;
            }
            for (const name in staticProps) {
                const prop = staticProps[name];
                if (source.hasOwnProperty(name)) {
                    const value = source[name as keyof PropertiesOf<this>];
                    this[name as keyof this] = prop.copy(this[name as keyof this], value);
                } else {
                    this[name as keyof this] = prop.copyDefault(this[name as keyof this]);
                }
            }
        } while (!!(Class = Object.getPrototypeOf(Class)) && Class !== Component);

        return this;
    }
}

// @todo: up to one component per world on a dummy entity.
export class SingletonComponent extends Component {
    public readonly isSingletonComponent!: true;
    public constructor(name: string, value?: any) {
        super(name, value);
        Object.defineProperty(this, 'isSingletonComponent', { value: true });
    }
}

/**
 * Component used only to tag entities. [[TagComponent]] do not hold any data
 * @todo: Does it contains tag data?
 *
 * @category components
 */
export class TagComponent extends Component {
    /** `true` if the instance derives from the [[TagComponent]] class */
    public readonly isTagComponent!: true;

    public constructor(name: string, value?: any) {
        super(name, value);
        Object.defineProperty(this, 'isTagComponent', { value: true });
    }
}

function findProperty(
    Class: ComponentClass,
    name: string
): Option<Property<any>> {
    do {
        if (Class.Properties && name in Class.Properties) {
            return Class.Properties[name];
        }
    } while (!!(Class = Object.getPrototypeOf(Class)) && Class !== Component);
    return undefined;
}

export interface Properties {
    [key: string]: Property<any>;
}
