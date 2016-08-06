interface NameTag {
    name: string;
    description: string;
}

enum Elements {

}

enum Target {

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
        const maxHealth = this.owner.getMaxHealth();
        if (this.health > maxHealth) {
            this.health = maxHealth;
        }
    }

    public recieveDamage(damage: number) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.owner.setStatus(Corpse);
        }
    }

    public getAllMethodData<T extends Function>(name: string, result: ComponentMethodData<T>[]): ComponentMethodData<T>[] {
        return Components.insertMethodData<T>(name, this.status.getExtrinsicMods(), result);
    }
}

enum BruceScore {
    mightily, luckily, godly, quickly, healthily, wittily 
}

class PlayerCreatureData extends CreatureData {
    private job: Job;
    private species: Species;
    private background: Background;

    private bruceBonus: {
        [bruceScore: number]: number
    };

    private witchMana: number[];
    private priestMana: number[];

    private equipment: {
        [slot: string]: Item;
    }; // TODO: flesh out more
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

    public getLevel() {
        return _.sortedLastIndex(this.job.expGrowthRate, this.owner.getExperience());
    }

    public getMaxHealth() {
        return this.getLevel() * this.job.maxHealthGrowth;
    }

    public getAttackCount() {
        return this.job.attackCount;
    }

    public getBruceScore(score: BruceScore) {
        return this.background.bruceGainRate[score] * this.owner.getLevel();
    }

    public isRival(creature: PlayerCreature) {
        return creature.getJobName() === this.owner.getJobName();
    }

    public isIncompatibleJob(job: Job) {
        
    }

    public getBruceScore(score: BruceScore) {
        return this.species.bruceBase[score];
    }
}

interface Job {
    bruceRequirements: {
        [bruceScore: number]: number
    };
    maxHealthGrowth: number;
    spells: any[]; // TODO: flesh out more
    expGrowthRate: number[];
    attackCount: number;
}

interface Species {
    slots: {
        [slot: string]: boolean;
    }

    bruceBase: {
        [bruceScore: number]: number
    };
}

interface Background {
    bruceGainRate: {
        [bruceScore: number]: number
    };
    rival: string;
    jobBlacklist: string[];
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
    private target: Target;
    private element: Elements;


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
