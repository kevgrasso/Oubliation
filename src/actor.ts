interface NameTag {
    name: string;
    description: string;
}

class CreatureData extends ComponentLeaf {
    private name: string;
    private status: Status;
    private health: number;

    public getName() {
        return this.name;
    }

    public getStatus() {
        return this.status;
    }

    public getHealth() { 
        return this.getHealth;
    }
    public recieveHealing(healing: number) {
        this.health += healing;
        const maxHealth = this.getOwner().getMaxHealth();
        if (this.health > maxHealth) {
            this.health = maxHealth;
        }
    }

    public recieveDamage(damage: number) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.getOwner().setStatus(Corpse);
        }
    }

    public getAllMethodData<T extends Function>(name: string, result: ComponentMethodData<T>[]): ComponentMethodData<T>[] {
        return Components.insertMethodData<T>(name, this.status.getExtrinsicMods(), result);
    }
}

enum BruceScore {
    mightily, luckily, godly, quickly, healthily, wittily 
}

class PlayerCreatureData extends ComponentLeaf {
    private bruceBonus: {
        [bruceScore: number]: number
    };

    private witchMana: number[];
    private priestMana: number[];

    private equipment: Item[]; // TODO: flesh out more
    private inventory: Item[];

    private experience: number;

    public getBruceScore(score: BruceScore) {
        return this.bruceBonus[score];
    }

    public getWitchMana(spellLevel: number) {
        return this.witchMana[spellLevel];
    }

    public getMaxWitchMana(spellLevel: number) {
        return this.owner.getBruceScore(BruceScore.wittily) * this.owner.getLevel() / spellLevel;
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
        return this.owner.getBruceScore(BruceScore.godly) * this.owner.getLevel() / spellLevel;
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
}

class Job extends ComponentLeaf {
    private bruceRequirements: {
        [bruceScore: number]: number
    };
    private maxHealthGrowth: number;
    private spells: any[]; // TODO: flesh out more
    private expGrowthRate: number[];
    private attackCount: number;

    public getLevel() {
        return _.sortedLastIndex(this.expGrowthRate, this.getOwner().getExperience());
    }

    public getMaxHealth() {
        return this.getLevel() * this.maxHealthGrowth;
    }

    public getAttackCount() {
        return this.attackCount;
    }
}

class Species extends ComponentLeaf {
// TODO: include equipment slot data?

    private bruceBase: {
        [bruceScore: number]: number
    };

    public getBruceScore(score: BruceScore) {
        return this.bruceBase[score];
    }
}

class Background extends ComponentLeaf {
    private bruceGainRate: {
        [bruceScore: number]: number
    };
    private rival: string;
    private jobBlacklist: string[];

    public getBruceScore(score: BruceScore) {
        return this.bruceGainRate[score] * this.getOwner().getLevel();
    }

    public isRival(creature: PlayerCreature) {
        return creature.getJobName();
    }

    public isIncompatibleJob(job: Job) {
        
    }
}

// items

class ItemData extends ComponentLeaf {
    private nameTag: NameTag;
    private price: number;

    public getPrice() {
        return this.price;
    }
}

class Equipment extends ComponentLeaf {
    private slot: string;
}

class ArmorData extends ComponentLeaf {
    private armorRank: number; 

    public getArmorRank() {
        return this.armorRank;
    }
}

class WeaponData extends ComponentLeaf {
    // TODO: 2.0 replace with optional method 
    public applyEffect: (target: PlayerActor) => void;

    private accuracy: number;
    private power: number;
    private target: any;
    private element: any;


    public getElementalAffinity() {
        return this.element;
    }

}

abstract class PlayerActor {
    private status: Status;

    private health: number;
    private maxHealth: number;
    
    private mana: number[];
    private maxMana: number[];

    private experience: number;


}
