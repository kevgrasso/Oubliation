interface Modifier {

}

class HasModifier {
    private priority: number;
    private modifier?: Modifier;

    constructor(priority: number, modifier?: Modifier) {
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

abstract class Status extends HasModifier {
    private name: string;

    constructor() {
        super(5, undefined); // TODO: implement properly
    }

    public getName() {
        return this.name;
    }
}

class Healthy extends Status {

}

class Corpse extends Status {

}

abstract class Creature {
    private readonly name: string;
    private status: Status;
    private health: number;

    public getName() {
        return this.name;
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

    protected abstract getModifiers(): Modifier[]
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

interface BaseItem extends HasModifier {
    getName(): string;
    getPrice(): number;
    canApply(controller: Controller): this is Item;
}

class Item extends HasModifier {
    private name: string;
    private description: string;
    private price: number;
    private effect?: EffectBase;
    public async func?(controller: Controller): Promise<void>
    
    constructor(priority: number, modifier: Modifier | undefined, name: string, description: string, price: number, ability?: EffectBase | ((controller: Controller) => Promise<void>)) {
        super(priority, modifier);
        this.name = name;
        this.description = description;
        this.price = price;
        if (typeof ability === 'function') { // OPTOMIZE
            this.func = ability;
        } else {
            this.effect = ability;
        }
    }

    public getName() {
        return this.name;
    }
    
    public getPrice() { // NOTE: can return null
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
            return undefined;
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
