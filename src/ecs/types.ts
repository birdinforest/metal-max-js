import { BaseComponent, Component, Properties } from './component';
import { Entity } from './entity';
import { Property } from './property';
import { System } from './system';
import { World } from './world';

/** Describes a type T that can be null */
export type Nullable<T> = T | null;
/** Describes a type T that can be undefined */
export type Option<T> = T | undefined;

/** Inner Entity type derived from a World type */
export type EntityOf<W> = W extends World<infer E> ? E : never;
/** Inner list of properties type derived from a Component type */
export type PropertiesOf<C extends BaseComponent> = Partial<
    Omit<C, keyof BaseComponent>
    >;

export type Constructor<T> = new (...args: any[]) => T;

export type EntityClass<T extends Entity> = new (name?: string) => T;

/** Class type for a Component derived type */
export type BaseComponentClass<T extends BaseComponent = BaseComponent> = Constructor<T> & {
    Name?: string;
};

/** Class type for a Component derived type */
export type ComponentClass<
    T extends Component = Component
    > = Constructor<T> & {
    Name?: string;
    Properties?: Properties;
    readonly _MergedProperties: Properties;
};

/** Class type for a Property derived type */
export type PropertyClass<
    T extends Property<any> = Property<any>
    > = Constructor<T>;
