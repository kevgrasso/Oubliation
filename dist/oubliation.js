var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var HasModifier = (function () {
    function HasModifier(priority, modifier) {
        this.priority = priority;
        this.modifier = modifier;
    }
    HasModifier.prototype.getPriority = function () {
        return this.priority;
    };
    HasModifier.prototype.getModifier = function () {
        return this.modifier;
    };
    return HasModifier;
}());
var Status = (function (_super) {
    __extends(Status, _super);
    function Status() {
        _super.call(this, 5, null);
    }
    Status.prototype.getName = function () {
        return this.name;
    };
    return Status;
}(HasModifier));
var Healthy = (function (_super) {
    __extends(Healthy, _super);
    function Healthy() {
        _super.apply(this, arguments);
    }
    return Healthy;
}(Status));
var Corpse = (function (_super) {
    __extends(Corpse, _super);
    function Corpse() {
        _super.apply(this, arguments);
    }
    return Corpse;
}(Status));
var Creature = (function () {
    function Creature() {
    }
    Creature.prototype.getName = function () {
        return this.name;
    };
    Creature.prototype.setStatus = function (status) {
        this.status = status;
    };
    Creature.prototype.getHealth = function () {
        return this.getHealth;
    };
    Creature.prototype.recieveHealing = function (healing) {
        this.health += healing;
        var maxHealth = this.getMaxHealth();
        if (this.health > maxHealth) {
            this.health = maxHealth;
        }
    };
    Creature.prototype.recieveDamage = function (damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.status = new Corpse();
        }
    };
    Creature.prototype.getStatus = function () {
        return this.status;
    };
    return Creature;
}());
var Controller = (function () {
    function Controller() {
    }
    return Controller;
}());
var Command = (function () {
    function Command(apply) {
        this.apply = apply;
    }
    return Command;
}());
var EffectCommand = (function () {
    function EffectCommand(effect) {
        this.effect = effect;
    }
    EffectCommand.prototype.getEffect = function () {
        return this.effect;
    };
    EffectCommand.prototype.apply = function (controller) {
    };
    return EffectCommand;
}());
var Item = (function (_super) {
    __extends(Item, _super);
    function Item(priority, modifier, name, description, price, command) {
        _super.call(this, priority, modifier);
        this.name = name;
        this.description = description;
        this.price = price;
        if (command != null) {
            this.command = command;
        }
    }
    Item.prototype.getName = function () {
        return this.name;
    };
    Item.prototype.getPrice = function () {
        return this.price;
    };
    Item.prototype.canApply = function (controller) {
        var command = this.command;
        if (command != null) {
            if (command instanceof EffectCommand) {
                return true;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    };
    Item.prototype.getEffect = function () {
        var command = this.command;
        if (command instanceof EffectCommand) {
            return command.getEffect();
        }
        else {
            return null;
        }
    };
    Item.prototype.apply = function (controller) {
        this.command.apply(controller);
    };
    Item.prototype.getModifier = function () {
        if (this.areModifiersActive()) {
            return _super.prototype.getModifier.call(this);
        }
        else {
            return null;
        }
    };
    Item.prototype.areModifiersActive = function () {
        return true;
    };
    return Item;
}(HasModifier));
var Equipment = (function (_super) {
    __extends(Equipment, _super);
    function Equipment(priority, modifier, name, description, price, slot, armorRank) {
        _super.call(this, priority, modifier, name, description, price, function (controller) {
        });
        this.slot = slot;
        this.armorRank = armorRank;
    }
    Equipment.prototype.getSlot = function () {
        return this.slot;
    };
    Equipment.prototype.getArmorRank = function () {
        return this.armorRank;
    };
    Equipment.prototype.getModifiers = function () {
        return _super.prototype.getModifier.call(this);
    };
    return Equipment;
}(Item));
var Archetype;
(function (Archetype) {
})(Archetype || (Archetype = {}));
var Target;
(function (Target) {
})(Target || (Target = {}));
var SideEffect;
(function (SideEffect) {
})(SideEffect || (SideEffect = {}));
var maxItems = 10;
var BruceScore;
(function (BruceScore) {
    BruceScore[BruceScore["mightily"] = 0] = "mightily";
    BruceScore[BruceScore["luckily"] = 1] = "luckily";
    BruceScore[BruceScore["godly"] = 2] = "godly";
    BruceScore[BruceScore["quickly"] = 3] = "quickly";
    BruceScore[BruceScore["healthily"] = 4] = "healthily";
    BruceScore[BruceScore["wittily"] = 5] = "wittily";
})(BruceScore || (BruceScore = {}));
var PlayerCreature = (function (_super) {
    __extends(PlayerCreature, _super);
    function PlayerCreature() {
        _super.apply(this, arguments);
    }
    PlayerCreature.prototype.getWitchMana = function (spellLevel) {
        return this.witchMana[spellLevel];
    };
    PlayerCreature.prototype.getMaxWitchMana = function (spellLevel) {
        return this.getBruceScore(BruceScore.wittily) * this.getLevel() / spellLevel;
    };
    PlayerCreature.prototype.payWitchMana = function (spellLevel, amount) {
        this.witchMana[spellLevel] -= amount;
        if (this.witchMana[spellLevel] < 0) {
            throw new Error('Paid more witch mana than available');
        }
    };
    PlayerCreature.prototype.getPriestMana = function (level) {
        return this.priestMana[level];
    };
    PlayerCreature.prototype.getMaxPriestMana = function (spellLevel) {
        return this.getBruceScore(BruceScore.godly) * this.getLevel() / spellLevel;
    };
    PlayerCreature.prototype.payPriestMana = function (spellLevel, amount) {
        this.priestMana[spellLevel] -= amount;
        if (this.priestMana[spellLevel] < 0) {
            throw new Error('Paid more priest mana than available');
        }
    };
    PlayerCreature.prototype.getExperience = function () {
        return this.experience;
    };
    PlayerCreature.prototype.incExperience = function (amount) {
        this.experience += amount;
    };
    PlayerCreature.prototype.getJobName = function () {
        return this.job.name;
    };
    PlayerCreature.prototype.getLevel = function () {
        return _.sortedLastIndex(this.job.expGrowthRate, this.experience);
    };
    PlayerCreature.prototype.getMaxHealth = function () {
        return this.getLevel() * this.job.maxHealthGrowth;
    };
    PlayerCreature.prototype.getAttackCount = function () {
        return this.job.attackCount;
    };
    PlayerCreature.prototype.getSpeciesName = function () {
        return this.species.name;
    };
    PlayerCreature.prototype.getSlots = function () {
        return _.keys(this.species.slots);
    };
    PlayerCreature.prototype.hasSlot = function (slot) {
        return this.species.slots[slot] === true;
    };
    PlayerCreature.prototype.getBackgroundName = function () {
        return this.background.name;
    };
    PlayerCreature.prototype.isRival = function (creature) {
        return creature.getBackgroundName() === this.background.rival;
    };
    PlayerCreature.prototype.isIncompatibleJob = function (jobName) {
        return jobName in this.background.jobBlacklist;
    };
    PlayerCreature.prototype.getBruceScore = function (score) {
        return this.bruceBonus[score] + (this.background.bruceGainRate[score] * this.getLevel()) + this.species.bruceBase[score];
    };
    PlayerCreature.prototype.getEquipment = function () {
        return this.equipment;
    };
    PlayerCreature.prototype.getInventory = function () {
        return this.inventory;
    };
    PlayerCreature.prototype.addItem = function (item) {
        var inventory = this.inventory;
        inventory.push(item);
        if (inventory.length > maxItems) {
            throw new Error("player creature " + this.getName() + "'s inventory is full'");
        }
    };
    PlayerCreature.prototype.removeItem = function (item) {
        var inventory = this.inventory;
        var index = _.indexOf(inventory, item);
        if (index === -1) {
            throw new Error("item " + item.getName() + " is not in player creature " + this.getName() + "'s' inventory");
        }
        else {
            inventory.splice(index, 1);
        }
    };
    PlayerCreature.prototype.equip = function (item) {
        var equipment = this.equipment;
        var slot = item.getSlot();
        if (!this.hasSlot(slot)) {
            throw new Error("Player creature " + this.getName + " doesn't have slot " + slot);
        }
        else if (equipment[slot] != null) {
            throw new Error("Player creature " + this.getName + " already has equipment in slot " + slot);
        }
        else {
            this.removeItem(item);
            equipment[item.getSlot()] = item;
        }
    };
    PlayerCreature.prototype.unequip = function (slot) {
        var equipment = this.equipment;
        var item = equipment[slot];
        if (item != null) {
            throw new Error("Player creature " + this.getName + "'s slot " + slot + " is empty");
        }
        else {
            equipment[slot] = null;
            this.addItem(item);
        }
    };
    PlayerCreature.prototype.getModifiers = function () {
        var modifiers = _.concat(_.values(this.equipment), this.inventory);
        modifiers.push(this.getStatus());
        return modifiers;
    };
    return PlayerCreature;
}(Creature));
//# sourceMappingURL=oubliation.js.map