// module.js

// Define the custom MaaDice class
class MaaDice extends RollTerm {
    constructor({number = 1, faces, options = {}} = {}) {
        super({options});
        this.number = number;
        this.faces = faces;
    }

    static DENOMINATION = "m"; // Define the denomination string

    // Define a regex pattern for recognizing this term
    static REGEXP = /(\d+)m(\d+)/i;

    // Define the fromMatch method to create a new instance from a matched regex
    static fromMatch(match) {
        return new this({
            number: parseInt(match[1]),
            faces: parseInt(match[2])
        });
    }

    // Evaluate the roll term
    _evaluateSync({ minimize = false, maximize = false } = {}) {
        this.results = [];
        for (let i = 0; i < this.number; i++) {
            const roll = new Die({faces: this.faces, number: 1}).roll({minimize, maximize}).results[0].result;
            this.results.push({result: roll, active: true});
        }

        const values = this.results.map(r => r.result);
        if (values.length === 1) {
            // For a single die roll, return its value directly
            this.total = values[0];
        } else {
            // Compute the difference between the highest and lowest rolls
            const max = Math.max(...values);
            const min = Math.min(...values);
            this.total = max - min;
        }
        this._evaluateModifiers();
        return this;
    }

    // Return the result labels
    getResultLabel(result) {
        return result.result;
    }
}

// Register the custom dice term during initialization
Hooks.once('init', () => {
    CONFIG.Dice.terms['m'] = MaaDice;
    console.log("MaaDice term registered");
});

// Example function to use the custom dice term in a roll
async function exampleRoll() {
    const roll = new Roll('2m6 + 4'); // Example roll formula using MaaDice
    await roll.evaluate({async: false}); // Evaluate the roll synchronously
    console.log(`Roll result: ${roll.result}, Total: ${roll.total}`);
    ChatMessage.create({
        user: game.user.id,
        speaker: ChatMessage.getSpeaker(),
        content: `Rolling 2m6 + 4: ${roll.result} = ${roll.total}`
    });
}

// Example usage of the custom roll
Hooks.once('ready', () => {
    exampleRoll();
});
