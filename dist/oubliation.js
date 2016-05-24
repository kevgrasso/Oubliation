var ComponentHub = (function () {
    function ComponentHub(spec) {
        var componentSpecs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            componentSpecs[_i - 1] = arguments[_i];
        }
        this.spec = spec;
        for (var _a = 0, _b = Object.getOwnPropertyNames(spec); _a < _b.length; _a++) {
            var kind = _b[_a];
            this.componentKinds[kind] = [];
        }
        for (var _c = 0, componentSpecs_1 = componentSpecs; _c < componentSpecs_1.length; _c++) {
            var componentSpec = componentSpecs_1[_c];
            this.addPack(new ((_d = componentSpec[0]).bind.apply(_d, [void 0].concat([this], componentSpec[1])))());
        }
        var _d;
    }
    ComponentHub.prototype.getNumSlotsOpen = function (kind) {
        return this.spec[kind] - this.componentKinds[kind].length;
    };
    ComponentHub.prototype.hasPack = function (componentPack) {
        var kind = componentPack.getKind();
        return _.includes(this.componentKinds[kind], componentPack);
    };
    ComponentHub.prototype.addPack = function (componentPack) {
        var kind = componentPack.getKind();
        if (this.getNumSlotsOpen(kind) > 0) {
            var slots = this.componentKinds[kind];
            var componentNodes = componentPack.getComponents(this);
            slots.splice(_.sortedIndexBy(slots, componentPack, $$$$), 0, componentPack);
            this.componentPacks.set(componentPack, componentNodes);
            var componentMethods = this.componentMethods;
            for (var _i = 0, componentNodes_1 = componentNodes; _i < componentNodes_1.length; _i++) {
                var componentNode = componentNodes_1[_i];
                for (var _a = 0, _b = componentNode.getMethodNames(); _a < _b.length; _a++) {
                    var componentMethod = _b[_a];
                    if (componentMethods[componentMethod] == null) {
                        componentMethods[componentMethod] = [];
                    }
                }
            }
        }
    };
    ComponentHub.prototype.removePack = function (componentPack) {
        var slots = this.componentKinds[componentPack.getKind()];
        slots.slice(_.indexOf(slots, componentPack), 1);
        this.componentPacks.delete(componentPack);
    };
    return ComponentHub;
}());
var ComponentPack = (function () {
    function ComponentPack(kind) {
        var componentSpecs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            componentSpecs[_i - 1] = arguments[_i];
        }
        this.kind = kind;
        this.componentSpecs = componentSpecs;
    }
    ComponentPack.prototype.getKind = function () {
        return this.kind;
    };
    ComponentPack.prototype.getComponents = function (owner) {
        return _.map(this.componentSpecs, function (componentSpec) {
            return new ((_a = componentSpec.class).bind.apply(_a, [void 0].concat([owner], componentSpec.args)))();
            var _a;
        });
    };
    return ComponentPack;
}());
var ComponentNode = (function () {
    function ComponentNode(owner, priority) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        this.owner = owner;
        this.priority = priority;
        if (args.length !== 0) {
            throw new Error('ComponentNode should not be called with arguments besides owner and priority');
        }
    }
    ComponentNode.prototype.getMethodNames = function () {
        var blacklist = [''];
        return _.difference(_.union(_.functionsIn(this), _.functionsIn(ComponentHub.prototype)), blacklist);
    };
    ComponentNode.prototype.getOwner = function () {
        return this.owner;
    };
    ComponentNode.prototype.getPriority = function () {
        return this.priority;
    };
    return ComponentNode;
}());
var utilities = {
    sortedInsert: function (array, element) {
        array.splice(_.sortedIndex(array, element), 0, element);
    },
    sortedRemove: function (array, element) {
        array.splice(_.sortedIndexOf(array, element), 1);
    },
    remove: function (array, element) {
        array.splice(_.indexOf(array, element), 1);
    }
};
//# sourceMappingURL=oubliation.js.map