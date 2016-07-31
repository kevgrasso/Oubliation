class Status extends ComponentLeaf {
    public constructor(owner: Thing, private name: string, private description: string) {
        super(owner, 5);
    }
}

class Healthy extends Status {

}

class Corpse extends Status {

}

