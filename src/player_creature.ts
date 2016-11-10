const maxItems = 10;

enum BruceScore {
    mightily, luckily, godly, quickly, healthily, wittily 
}

interface Job {
    readonly name: string;
    readonly bruceRequirements: Immutable.Map<BruceScore, number>;
    readonly maxHealthGrowth: number;
    readonly spells: Immutable.OrderedSet<any>; // TODO: flesh out more
    readonly expGrowthRate: Immutable.List<number>;
    readonly attackCount: number;
}

interface Species {
    readonly name: string;
    readonly slots: Immutable.Set<string>;

    readonly bruceBase: {
        readonly [bruceScore: number]: number
    };
}

interface Background {
    readonly name: string;
    readonly bruceGainRate: Immutable.Map<BruceScore, number>;
    readonly rival: string;
    readonly jobBlacklist: Immutable.Set<string>;
}

type Affinity = (this: Creature, effect: EffectSpec, efficacy: number) => void;

// NOTE: replace modifiers with `partial this` in Typescript 2.1? 
interface Modifier {
    readonly attackCount?: number;
    readonly scale?: number;
    
    readonly affinity?: Immutable.Map<ElementSystem.Type, Affinity>;

    readonly attack?: Immutable.Map<ElementSystem.Type, number>;
    readonly defense?: Immutable.Map<ElementSystem.Type, number>;
    readonly accuracy?: Immutable.Map<ElementSystem.Type, number>;
    readonly evasion?: Immutable.Map<ElementSystem.Type, number>;

    onStep?(this: Creature): void;
    onTurn?(this: Creature): void;
    onRecievedEffect?(this: Creature, opposingSource: boolean): void;
    onSentEffect?(this: Creature, opposingTarget: boolean): void;
    onDeath?(this: Creature): void;
    onTotalPartyKill?(this: Creature): void;
}

interface PlayerModifier extends Modifier {
    readonly level?: number;
    readonly maxHealth?: number;
    readonly bruceScore?: Immutable.Map<BruceScore, number>;
    // add new slots

    // use formula that can implement:
    readonly maxWitchMana?: number;
    readonly maxPriestMana?: number;
}

// TODO: add modifiers
class PlayerCreature extends Creature {
    private readonly job: Job;
    private readonly species: Species;
    private readonly background: Background;

    private readonly bruceBonus: Immutable.Map<BruceScore, number>;

    private witchMana: Immutable.List<number>;
    private priestMana: Immutable.List<number>;

    private equipment: Immutable.Map<string, Item>;
    private inventory: Immutable.OrderedSet<Item>;

    private experience: number;

    
    constructor(name: string, scale: Scale, status: Status, health: number) {
        super(name, scale, status, health);

        // TODO
    }

    public getWitchMana(spellLevel: number) {
        return this.witchMana.get(spellLevel);
    }

    public getMaxWitchMana(spellLevel: number) {
        return this.getBruceScore(BruceScore.wittily) * this.getLevel() / spellLevel;
    }

    public payWitchMana(spellLevel: number, amount: number) {
        this.witchMana.update(spellLevel, (value) => {
            return value - amount;
        });

        if (this.witchMana.get(spellLevel) < 0) {
            throw new Error('Paid more witch mana than available');
        }
    }

    public getPriestMana(spellLevel: number) {
        return this.priestMana.get(spellLevel);
    }

    public getMaxPriestMana(spellLevel: number) {
        return this.getBruceScore(BruceScore.godly) * this.getLevel() / spellLevel;
    }

    public payPriestMana(spellLevel: number, amount: number) {
        this.priestMana.update(spellLevel, (value) => {
            return value - amount;
        });

        if (this.priestMana.get(spellLevel) < 0) {
            throw new Error('Paid more priest mana than available');
        }
    }

    public getExperience() {
        return this.experience;
    }

    public incExperience(amount: number) {
        this.experience += amount;
    }

    public getJobName() {
        return this.job.name;
    }

    public getLevel() {
        const experience = this.experience;
        return this.job.expGrowthRate.findLastIndex((value: number) => {
            return value < experience;
        });
    }

    public getMaxHealth() {
        return this.getLevel() * this.job.maxHealthGrowth;
    }

    public getAttackCount() {
        return this.job.attackCount;
    }

    public getSpeciesName() {
        return this.species.name;
    }

    public getSlots() {
        return this.species.slots;
    }

    public hasSlot(slot: string) {
        return this.species.slots.has(slot);
    }

    public getBackgroundName() {
        return this.background.name;
    }

    public isRival(creature: PlayerCreature) {
        return creature.getBackgroundName() === this.background.rival;
    }

    public isIncompatibleJob(jobName: string) {
        return !this.background.jobBlacklist.has(jobName);
    }

    public getBruceScore(score: BruceScore) {
        return this.bruceBonus.get(score) + (this.background.bruceGainRate.get(score)*this.getLevel()) + this.species.bruceBase[score];
    }

    public getEquipment() {
        return this.equipment;
    }

    public getInventory() {
        return this.inventory;
    }

    public isInventoryFull() {
        return this.inventory.size > maxItems;
    }

    public addItem(item: Item) {
        this.inventory = this.inventory.add(item);
        if (this.isInventoryFull()) {
            throw new Error(`player creature ${this.getName()}'s inventory is full'`);
        }
    }

    public removeItem(item: Item) {
        if (this.inventory.has(item)) {
            throw new Error(`item ${item.getName()} is not in player creature ${this.getName()}'s' inventory`);
        } else {
            this.inventory = this.inventory.delete(item);
        }
    }

    public equip(item: Equipment) {
        const slot = item.getSlot();
        if (!this.hasSlot(slot)) {
            throw new Error(`Player creature ${this.getName} doesn't have slot ${slot}`);
        } else if (this.equipment.has(slot)) {
            throw new Error(`Player creature ${this.getName} already has equipment in slot ${slot}`);
        } else {
            this.removeItem(item);
            this.equipment = this.equipment.set(slot, item);
        }
    }

    public unequip(slot: string) {
        if (this.equipment.has(slot)) {
            throw new Error(`Player creature ${this.getName}'s slot ${slot} is empty`);
        } else {
            this.addItem(this.equipment.get(slot));
            this.equipment = this.equipment.delete(slot);
        }
    }

    protected getModifiers<T>(mapper: (value: Modifier) => T)  {        
        return this.equipment.toSeq().concat(this.inventory).sort((valueA: HasModifier<PlayerModifier>, valueB: HasModifier<PlayerModifier>) => {
            return valueB.getPriority() - valueA.getPriority();
          } ).map((value: Item) => {  
            return mapper(value.getModifier());
        }).filter((value: T): value is T => {
            return value !== undefined;
        });
    }
}
