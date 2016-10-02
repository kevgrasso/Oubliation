var Utils;
(function (Utils) {
    'use strict';
    function sortedInsert(element, array) {
        array.splice(_.sortedIndex(array, element), 0, element);
    }
    Utils.sortedInsert = sortedInsert;
    function sortedInsertBy(element, array, iteratee) {
        array.splice(_.sortedIndexBy(array, element, iteratee), 0, element);
    }
    Utils.sortedInsertBy = sortedInsertBy;
    function remove(element, array) {
        array.splice(_.indexOf(array, element), 1);
    }
    Utils.remove = remove;
    function sortedRemove(element, array) {
        array.splice(_.sortedIndexOf(array, element), 1);
    }
    Utils.sortedRemove = sortedRemove;
})(Utils || (Utils = {}));
;
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class HasModifier {
    constructor(priority, modifier) {
        this.priority = priority;
        this.modifier = modifier;
    }
    getPriority() {
        return this.priority;
    }
    getModifier() {
        return this.modifier;
    }
}
class Status extends HasModifier {
    constructor() {
        super(5, undefined);
    }
    getName() {
        return this.name;
    }
}
class Healthy extends Status {
}
class Corpse extends Status {
}
class Creature {
    getName() {
        return this.name;
    }
    setStatus(status) {
        this.status = status;
    }
    getHealth() {
        return this.getHealth;
    }
    recieveHealing(healing) {
        this.health += healing;
        const maxHealth = this.getMaxHealth();
        if (this.health > maxHealth) {
            this.health = maxHealth;
        }
    }
    recieveDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.status = new Corpse();
        }
    }
    getStatus() {
        return this.status;
    }
}
class Controller {
    pickTarget(source, target) {
        return new Promise((resolve, reject) => {
        });
    }
    scheduleInteraction(source, target) {
        return new Promise((resolve, reject) => {
        });
    }
}
class Item extends HasModifier {
    constructor(priority, modifier, name, description, price, ability) {
        super(priority, modifier);
        this.name = name;
        this.description = description;
        this.price = price;
        if (typeof ability === 'function') {
            this.func = ability;
        }
        else {
            this.effect = ability;
        }
    }
    getName() {
        return this.name;
    }
    getPrice() {
        return this.price;
    }
    getEffect() {
        let effect = this.effect;
        if (effect != null) {
            return effect;
        }
        else {
            return null;
        }
    }
    canApply(controller) {
        if (this.effect != null) {
            return true;
        }
        else if (this.func != null) {
            return true;
        }
        else {
            return false;
        }
    }
    apply(controller) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.effect != null) {
                return Promise.reject('abort');
            }
            else if (this.func != null) {
                return this.func(controller);
            }
            else {
                throw new Error(`Item ${this.name} can not be applied.`);
            }
        });
    }
    getModifier() {
        if (this.areModifiersActive()) {
            return super.getModifier();
        }
        else {
            return undefined;
        }
    }
    areModifiersActive() {
        return true;
    }
}
class Equipment extends Item {
    constructor(priority, modifier, name, description, price, slot, armorRank) {
        super(priority, modifier, name, description, price, (controller) => {
        });
        this.slot = slot;
        this.armorRank = armorRank;
    }
    getSlot() {
        return this.slot;
    }
    getArmorRank() {
        return this.armorRank;
    }
    getModifiers() {
        return super.getModifier();
    }
}
var Archetype;
(function (Archetype) {
})(Archetype || (Archetype = {}));
var Target;
(function (Target) {
})(Target || (Target = {}));
var SideEffect;
(function (SideEffect) {
})(SideEffect || (SideEffect = {}));
const maxItems = 10;
var BruceScore;
(function (BruceScore) {
    BruceScore[BruceScore["mightily"] = 0] = "mightily";
    BruceScore[BruceScore["luckily"] = 1] = "luckily";
    BruceScore[BruceScore["godly"] = 2] = "godly";
    BruceScore[BruceScore["quickly"] = 3] = "quickly";
    BruceScore[BruceScore["healthily"] = 4] = "healthily";
    BruceScore[BruceScore["wittily"] = 5] = "wittily";
})(BruceScore || (BruceScore = {}));
class PlayerCreature extends Creature {
    getWitchMana(spellLevel) {
        return this.witchMana[spellLevel];
    }
    getMaxWitchMana(spellLevel) {
        return this.getBruceScore(BruceScore.wittily) * this.getLevel() / spellLevel;
    }
    payWitchMana(spellLevel, amount) {
        this.witchMana[spellLevel] -= amount;
        if (this.witchMana[spellLevel] < 0) {
            throw new Error('Paid more witch mana than available');
        }
    }
    getPriestMana(level) {
        return this.priestMana[level];
    }
    getMaxPriestMana(spellLevel) {
        return this.getBruceScore(BruceScore.godly) * this.getLevel() / spellLevel;
    }
    payPriestMana(spellLevel, amount) {
        this.priestMana[spellLevel] -= amount;
        if (this.priestMana[spellLevel] < 0) {
            throw new Error('Paid more priest mana than available');
        }
    }
    getExperience() {
        return this.experience;
    }
    incExperience(amount) {
        this.experience += amount;
    }
    getJobName() {
        return this.job.name;
    }
    getLevel() {
        return _.sortedLastIndex(this.job.expGrowthRate, this.experience);
    }
    getMaxHealth() {
        return this.getLevel() * this.job.maxHealthGrowth;
    }
    getAttackCount() {
        return this.job.attackCount;
    }
    getSpeciesName() {
        return this.species.name;
    }
    getSlots() {
        return _.keys(this.species.slots);
    }
    hasSlot(slot) {
        return this.species.slots[slot] === true;
    }
    getBackgroundName() {
        return this.background.name;
    }
    isRival(creature) {
        return creature.getBackgroundName() === this.background.rival;
    }
    isIncompatibleJob(jobName) {
        return jobName in this.background.jobBlacklist;
    }
    getBruceScore(score) {
        return this.bruceBonus[score] + (this.background.bruceGainRate[score] * this.getLevel()) + this.species.bruceBase[score];
    }
    getEquipment() {
        return this.equipment;
    }
    getInventory() {
        return this.inventory;
    }
    addItem(item) {
        const inventory = this.inventory;
        inventory.push(item);
        if (inventory.length > maxItems) {
            throw new Error(`player creature ${this.getName()}'s inventory is full'`);
        }
    }
    removeItem(item) {
        const inventory = this.inventory;
        const index = _.indexOf(inventory, item);
        if (index === -1) {
            throw new Error(`item ${item.getName()} is not in player creature ${this.getName()}'s' inventory`);
        }
        else {
            inventory.splice(index, 1);
        }
    }
    equip(item) {
        const equipment = this.equipment;
        const slot = item.getSlot();
        if (!this.hasSlot(slot)) {
            throw new Error(`Player creature ${this.getName} doesn't have slot ${slot}`);
        }
        else if (equipment[slot] != null) {
            throw new Error(`Player creature ${this.getName} already has equipment in slot ${slot}`);
        }
        else {
            this.removeItem(item);
            equipment[item.getSlot()] = item;
        }
    }
    unequip(slot) {
        const equipment = this.equipment;
        const item = equipment[slot];
        if (item == null) {
            throw new Error(`Player creature ${this.getName}'s slot ${slot} is empty`);
        }
        else {
            delete this.equipment[slot];
            this.addItem(item);
        }
    }
    getModifiers() {
        const modifiers = [];
        const modifierContainers = _.sortBy(_.values(this.equipment).concat(this.inventory, this.getStatus()), (container) => {
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
//# sourceMappingURL=oubliation.js.map