var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Utils = {
    sortedInsert: function (element, array) {
        array.splice(_.sortedIndex(array, element), 0, element);
    },
    sortedInsertBy: function (element, array, iteratee) {
        array.splice(_.sortedIndexBy(array, element, iteratee), 0, element);
    },
    remove: function (element, array) {
        array.splice(_.indexOf(array, element), 1);
    },
    sortedRemove: function (element, array) {
        array.splice(_.sortedIndexOf(array, element), 1);
    }
};
var Components = {
    extractMethods: function (methodData) {
        return _.map(methodData, 'method');
    },
    insertMethodData: function (name, componentNodes, result) {
        for (var _i = 0, componentNodes_1 = componentNodes; _i < componentNodes_1.length; _i++) {
            var componentNode = componentNodes_1[_i];
            var method = _.get(componentNode, name);
            if (method !== _.get(ComponentMethods.prototype, name)) {
                var methodData = {
                    method: _.bind(method, componentNode),
                    priority: componentNode.getPriority()
                };
                Utils.sortedInsertBy(methodData, result, 'priority');
            }
        }
        return result;
    }
};
var ComponentHub = (function () {
    function ComponentHub() {
        var _this = this;
        var componentSpecs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            componentSpecs[_i - 0] = arguments[_i];
        }
        this.componentNodes = _.map(componentSpecs, function (componentSpec) {
            return new ((_a = componentSpec[0]).bind.apply(_a, [void 0].concat([_this], componentSpec[1])))();
            var _a;
        });
    }
    ComponentHub.prototype.getAllMethodData = function (name, result) {
        return this.getDirectMethodData(name, this.getIndirectMethodData(name, []));
    };
    ComponentHub.prototype.getAllMethods = function (name) {
        return Components.extractMethods(this.getAllMethodData(name, []));
    };
    ComponentHub.prototype.getDirectMethodData = function (name, result) {
        return Components.insertMethodData(name, this.componentNodes, result);
    };
    ComponentHub.prototype.getIndirectMethodData = function (name, result) {
        for (var _i = 0, _a = this.getDirectMethodData('getIndirectMethodData', []); _i < _a.length; _i++) {
            var retrieverData = _a[_i];
            retrieverData.method(name, result);
        }
        return result;
    };
    return ComponentHub;
}());
var ComponentNode = (function (_super) {
    __extends(ComponentNode, _super);
    function ComponentNode(owner, priority) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        _super.call(this);
        this.owner = owner;
        this.priority = priority;
        if (args.length !== 0) {
            throw new Error('ComponentNode should not be called with arguments besides owner and priority');
        }
    }
    ComponentNode.prototype.getOwner = function () {
        return this.owner;
    };
    ComponentNode.prototype.getPriority = function () {
        return this.priority;
    };
    return ComponentNode;
}(ComponentMethods));
var ComponentMethods = (function () {
    function ComponentMethods() {
    }
    ComponentMethods.prototype.getAllMethodData = function (name, result) {
        throw new Error('call to unimplemented component method');
    };
    ComponentMethods.prototype.getDescription = function () {
        throw new Error('call to unimplemented component method');
    };
    return ComponentMethods;
}());
var Thing = (function (_super) {
    __extends(Thing, _super);
    function Thing() {
        _super.apply(this, arguments);
    }
    Thing.prototype.getDescription = function () {
        return _(this.getAllMethods('getDescription')).invokeMap(_.attempt).join(' ');
    };
    return Thing;
}(ComponentHub));
var Descriptor = (function (_super) {
    __extends(Descriptor, _super);
    function Descriptor(owner, priority, description) {
        _super.call(this, owner, priority);
        this.description = description;
    }
    Descriptor.prototype.getDescription = function () {
        return this.description;
    };
    return Descriptor;
}(ComponentNode));
var test = new Thing([Descriptor, [2, 'World!']], [Descriptor, [1, 'Hello']]);
alert(test.getDescription());
//# sourceMappingURL=oubliation.js.map