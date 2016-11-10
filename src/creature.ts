class HasModifier<T extends Modifier> {
    private priority: number;
    private modifier: T;

    constructor(priority: number, modifier: T) {
        this.priority = priority;
        this.modifier = modifier;
    }

    public getPriority() {
        return this.priority;
    }

    public getModifier() {
        return this.modifier;
    }
}

abstract class Status extends HasModifier<Modifier> {
    private name: string;

    constructor() {
        super(5, {}); // TODO: implement properly
    }

    public getName() {
        return this.name;
    }
}

class Healthy extends Status {

}

class Corpse extends Status {

}

namespace ElementSystem {
    'use strict';
    
    export enum Core {
        Pound, Stab, Cut, // Physical/Basic
        Fix, Thrust, Execute, // Physical/Advanced

        Cold, Electric, Magic, // Occult/Basic
        Body, Mind, Curse, // Occult/Advanced

        Void // None
    }

    export enum Category {
        // qualities
        Id = 13, Ego, Superego, // Psyche
        
        Physical, Occult, // Composition
        Basic, Advanced, // Complexity

        // primary categories
        Assault, Maneuver, // Composition/Complexity 
        Evocation, Arcane,

        // secondary categories 
        Blunt, Pierce, Slash, // Psyche/Composition
        Nature, Stream, Hex,

        Blast, Strike, Artifice, // Psyche/Complexity
        Life, Struggle, Death,

        Any // Category which spans all elements and categories
    }

    export type Type = Core | Category
    
    export function isCore(type: Type): type is Core {
        return type <= Core.Void;
    }

    export function isCategory(type: Type): type is Category {
        return type > Core.Void;
    }

    const idElementIndexes = Immutable.Set([0, 3, 6, 9]);
    const egoElementIndexes = Immutable.Set([1, 4, 7, 10]);
    const superegoElementIndexes = Immutable.Set([2, 5, 8, 11]);

    const assaultElementIndexes = Immutable.Range(0, 2).toSet();
    const maneuverElementIndexes = Immutable.Range(3, 5).toSet();
    const evocationElementIndexes = Immutable.Range(6, 8).toSet();
    const arcaneElementIndexes = Immutable.Range(9, 11).toSet();

    const physicalElementIndexes = assaultElementIndexes.union(maneuverElementIndexes);
    const occultElementIndexes = evocationElementIndexes.union(arcaneElementIndexes);
    const basicElementIndexes = assaultElementIndexes.union(evocationElementIndexes);
    const advancedElementIndexes = maneuverElementIndexes.union(arcaneElementIndexes);

    export const map = Immutable.Map<Type, Immutable.Set<Core>>([
        [Core.Pound, Immutable.Set([Core.Pound])], [Core.Stab, Immutable.Set([Core.Stab])], [Core.Cut, Immutable.Set([Core.Cut])],
        [Core.Fix, Immutable.Set([Core.Fix])], [Core.Thrust, Immutable.Set([Core.Thrust])], [Core.Execute, Immutable.Set([Core.Execute])],
        [Core.Cold, Immutable.Set([Core.Cold])], [Core.Electric, Immutable.Set([Core.Electric])], [Core.Magic, Immutable.Set([Core.Magic])],
        [Core.Body, Immutable.Set([Core.Body])], [Core.Mind, Immutable.Set([Core.Mind])], [Core.Curse, Immutable.Set([Core.Curse])],

        [Category.Id, idElementIndexes], [Category.Ego, egoElementIndexes], [Category.Superego, superegoElementIndexes],

        [Category.Physical, physicalElementIndexes], [Category.Occult, occultElementIndexes],
        [Category.Basic, basicElementIndexes], [Category.Advanced, advancedElementIndexes],

        [Category.Assault, assaultElementIndexes], [Category.Maneuver, maneuverElementIndexes],
        [Category.Evocation, evocationElementIndexes], [Category.Arcane, arcaneElementIndexes],

        [Category.Blunt, physicalElementIndexes.intersect(idElementIndexes)], [Category.Pierce, physicalElementIndexes.intersect(egoElementIndexes)],
        [Category.Slash, physicalElementIndexes.intersect(superegoElementIndexes)], [Category.Nature, occultElementIndexes.intersect(idElementIndexes)],
        [Category.Stream, occultElementIndexes.intersect(egoElementIndexes)], [Category.Hex, occultElementIndexes.intersect(superegoElementIndexes)],
        
        [Category.Blast, basicElementIndexes.intersect(idElementIndexes)], [Category.Strike, basicElementIndexes.intersect(egoElementIndexes)],
        [Category.Artifice, basicElementIndexes.intersect(superegoElementIndexes)], [Category.Life, advancedElementIndexes.intersect(idElementIndexes)],
        [Category.Struggle, advancedElementIndexes.intersect(egoElementIndexes)], [Category.Death, advancedElementIndexes.intersect(superegoElementIndexes)]
    ]);

    export function getElementReduceArgs<V>(reducer: (reduction: V, value: V, key?: Type, iter?: Immutable.Iterable<Type, V>) => V, context?: any) {
        'use strict';

        return [
            (reduction: Immutable.Map<Core, V>, value: V, key: Type, iter: Immutable.Iterable<Type, V>) => {
                return map.get(key).reduce((reduction: Immutable.Map<Core, V>, type: Core) => {
                        return reduction.set(type, reducer(reduction.get(type), value, key, iter));
                    }, 
                    reduction,
                    context
                );
            },
            Immutable.Map(),
            context
        ];
    }
}

enum Scale {  // modifies damage & evasion
    Micro, Fun, Minikin, Munchkin, Tall, Jumbo, MiniTitan, Titan, Leviathan, Macro, Mega, Giga, Ridiculous
} // get rid of titan or leviathan? (MiniLeviathan?)

// enum Scale2 {
//     Fine, Diminutive, Tiny, Small, Medium, Large, Huge, Gargantuan, Colossal, ColossalPlus
// }

// enum Scale3 {
//     Nano, Micro, Doll, Minikin, Lilliputian, Munchkin, Dwarf, Amazon, MiniGiant, Macro, Giant, Brobdnignagian, Titan, Mega, Giga, Tera, Galactic
// }

// enum Scale4 {
//     Little, Compact, Miniature, Mini, Minute, Microscopic, Minuscule, Toy, Short, Petite, Teeny, Teensy, FunSized, Puny,
//     Immense, Enormous, Massive, Gigantic, Elephantine, Titanic, Towering, Tall, Jumbo, Humongous, Ginormous 
// }

// enum Scale5 {
//     Tiny, Small, Medium, Large, Huge,
//     Micro, Doll, Minikin, Munchkin, Dwarf, Amazon, MiniGiant, Macro, Giant, Titan, Mega, Giga, Tera,
//     Little, Mini, Minute, Minuscule, Toy, Short, Petite, Teeny, Teensy, FunSized, Puny,
//     Big, Immense, Enormous, Massive, Gigantic, Elephantine, Titanic, Tall, Jumbo, Humongous, Ginormous,
//     Awesome, Leviathan 
// }

abstract class Creature {
    private readonly name: string;
    private readonly scale: Scale;
    private status: Status;
    private health: number;

    constructor(name: string, scale: Scale, status: Status, health: number) {
        this.name = name;
        this.scale = scale;
        this.status = status;
        this.health = health;
    }

    public getName() {
        return this.name;
    }

    public getScale() {
        return this.scale;
    }

    public setStatus(status: Status) { // NOTE: change to protected after effects implemented?
        this.status = status;
    }

    public getHealth() { 
        return this.getHealth;
    }

    public abstract getMaxHealth(): number

    // TODO: replace recieveHealing and recieveDamage with applyEffect (and effectSend, effectRecieve)

    public recieveHealing(healing: number) {
        this.health += healing;
        const maxHealth = this.getMaxHealth();
        if (this.health > maxHealth) {
            this.health = maxHealth;
        }
    }

    public recieveDamage(damage: number) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.status = new Corpse();
        }
    }

    protected getStatus() {
        return this.status;
    }

    protected abstract getModifiers<T>(mapper: (value: Modifier) => T): Immutable.Iterable<any, Modifier>
}

// items

class Controller {
    public pickTarget(source: Creature, target: Target) {
        return new Promise<Creature[]>((resolve, reject) => {
            // TODO: implement
        });
    }

    public scheduleInteraction(source: Creature, target: Creature) {
        return new Promise<void>((resolve, reject) => {
            // TODO: implement
        });
    }
}

interface BaseItem extends HasModifier<PlayerModifier> {
    getName(): string;
    getPrice(): number;
    canApply(controller: Controller): this is Item;
}

class Item extends HasModifier<PlayerModifier> {
    private name: string;
    private description: string;
    private price?: number;
    private effect?: EffectBase;
    public async func?(controller: Controller): Promise<void>
    
    constructor(priority: number, modifier: Modifier, name: string, description: string, price: number | null, ability: EffectBase | ((controller: Controller) => Promise<void>) | null) {
        super(priority, modifier);
        this.name = name;
        this.description = description;
        if (price !== null) {
            this.price = price;
        }
        if (typeof ability === 'function') { // OPTOMIZE
            this.func = ability;
        } else if (ability !== null) {
            this.effect = ability;
        }
    }

    public getName() {
        return this.name;
    }
    
    public getPrice() {
        return this.price;
    }

    public getEffect() { // NOTE: maybe should have better system for querying effect attributes?
        let effect = this.effect;
        if (effect != null) {
            return effect;
        } else {
            return null;
        }
    }

    public canApply(controller: Controller): this is Item {
        if (this.effect != null) {
            return true; // TODO: add battle checks 
        } else if (this.func != null) {
            return true;
        } else {
            return false;
        }
    } 

    public async apply(controller: Controller) {
        if (this.effect != null) {
            // TODO: implement applying effects

            return Promise.reject('abort'); // use for type compatibility w/ Promise<void>
        } else if (this.func != null) {
            return this.func(controller);
        } else {
            throw new Error(`Item ${this.name} can not be applied.`);
        }
    }

    public getModifier() {
        if (this.areModifiersActive()) {
            return super.getModifier();
        } else {
            return {};
        }
    }

    private areModifiersActive() {
        return true; // TODO: implement
    }
}

// const equipCommand = ; // for performance if needed

class Equipment extends Item {
    private slot: string;
    private armorRank: number; 

    constructor(priority: number, modifier: Modifier, name: string, description: string, price: number, slot: string, armorRank: number) {
        super(priority, modifier, name, description, price, (controller: Controller) => {
            // TODO: implement equiping items
            return new Promise<void>((resolve, reject) => {
                // implement
            });
        } );
        this.slot = slot;
        this.armorRank = armorRank;
    }

    public getSlot() {
        return this.slot;
    }

    public getArmorRank() {
        return this.armorRank;
    }

    public getModifiers() {
        return super.getModifier();
    }
}

enum Archetype {

}

enum Target {

}

enum SideEffect {

}

interface EffectSpec { // split into EffectSpec & ActiveEffect?
    accuracy: number;

    power?: number;
    status?: Status;
    readonly onSuccess?: EffectSpec;
    repeat?: number;
    haltOnFailure?: boolean;

    sideEffects?: SideEffect[];
}

interface EffectBase extends EffectSpec {
    element: Archetype;
}

interface ActiveEffect extends EffectBase {
    source: Creature;
    targets: Creature[];
}
