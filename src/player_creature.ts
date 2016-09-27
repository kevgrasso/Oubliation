const maxItems = 10;

interface Job {
    readonly name: string;
    readonly bruceRequirements: {
        readonly [bruceScore: number]: number
    };
    readonly maxHealthGrowth: number;
    readonly spells: ReadonlyArray<any>; // TODO: flesh out more
    readonly expGrowthRate: ReadonlyArray<number>;
    readonly attackCount: number;
}

interface Species {
    readonly name: string;
    readonly slots: {
        readonly [slot: string]: boolean;
    };

    readonly bruceBase: {
        readonly [bruceScore: number]: number
    };
}

interface Background {
    readonly name: string;
    readonly bruceGainRate: {
        readonly [bruceScore: number]: number
    };
    readonly rival: string;
    readonly jobBlacklist: string[];
}

enum BruceScore {
    mightily, luckily, godly, quickly, healthily, wittily 
}

// TODO: add modifiers
class PlayerCreature extends Creature {
    private readonly job: Job;
    private readonly species: Species;
    private readonly background: Background;

    private readonly bruceBonus: {
        readonly [bruceScore: number]: number
    };

    private witchMana: number[];
    private priestMana: number[];

    private readonly equipment: {
        [slot: string]: Item;
    };
    private readonly inventory: Item[];

    private experience: number;

    public getWitchMana(spellLevel: number) {
        return this.witchMana[spellLevel];
    }

    public getMaxWitchMana(spellLevel: number) {
        return this.getBruceScore(BruceScore.wittily) * this.getLevel() / spellLevel;
    }

    public payWitchMana(spellLevel: number, amount: number) {
        this.witchMana[spellLevel] -= amount;
        if (this.witchMana[spellLevel] < 0) {
            throw new Error('Paid more witch mana than available');
        }
    }

    public getPriestMana(level: number) {
        return this.priestMana[level];
    }

    public getMaxPriestMana(spellLevel: number) {
        return this.getBruceScore(BruceScore.godly) * this.getLevel() / spellLevel;
    }

    public payPriestMana(spellLevel: number, amount: number) {
        this.priestMana[spellLevel] -= amount;
        if (this.priestMana[spellLevel] < 0) {
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
        return _.sortedLastIndex(this.job.expGrowthRate, this.experience);
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
        return _.keys(this.species.slots);
    }

    public hasSlot(slot: string) {
        return this.species.slots[slot] === true;
    }

    public getBackgroundName() {
        return this.background.name;
    }

    public isRival(creature: PlayerCreature) {
        return creature.getBackgroundName() === this.background.rival;
    }

    public isIncompatibleJob(jobName: string) {
        return jobName in this.background.jobBlacklist;
    }

    public getBruceScore(score: BruceScore) {
        return this.bruceBonus[score] + (this.background.bruceGainRate[score]*this.getLevel()) + this.species.bruceBase[score];
    }

    public getEquipment() {
        return this.equipment;
    }

    public getInventory() {
        return this.inventory;
    }

    public addItem(item: Item) {
        const inventory = this.inventory;
        inventory.push(item);
        if (inventory.length > maxItems) {
            throw new Error(`player creature ${this.getName()}'s inventory is full'`);
        }
    }

    public removeItem(item: Item) {
        const inventory = this.inventory;
        const index = _.indexOf(inventory, item);
        if (index === -1) {
            throw new Error(`item ${item.getName()} is not in player creature ${this.getName()}'s' inventory`);
        } else {
            inventory.splice(index, 1);
        }
    }

    public equip(item: Equipment) {
        const equipment = this.equipment;
        const slot = item.getSlot();
        if (!this.hasSlot(slot)) {
            throw new Error(`Player creature ${this.getName} doesn't have slot ${slot}`);
        } else if (equipment[slot] != null) {
            throw new Error(`Player creature ${this.getName} already has equipment in slot ${slot}`);
        } else {
            this.removeItem(item);
            equipment[item.getSlot()] = item;
        }
    }

    public unequip(slot: string) {
        const equipment = this.equipment;
        const item = equipment[slot];
        if (item == null) {
            throw new Error(`Player creature ${this.getName}'s slot ${slot} is empty`);
        } else {
            delete this.equipment[slot];
            this.addItem(item);
        }
    }

    protected getModifiers() {
        const modifiers: Modifier[] = [];
        const modifierContainers = _.sortBy(_.values<Item | Status>(this.equipment).concat(this.inventory, this.getStatus()), (container: Item | Status) => {
            return container.getPriority();
        });

        for (const item of modifierContainers) {
            const modifier = item.getModifier();
            if (modifier != null) {
                modifiers.push(modifier);
            }
        }

        return modifiers;
    }
}
