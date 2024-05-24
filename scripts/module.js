// module.js

// Define the custom MaaDice class
class MaaDice extends DiceTerm {
    constructor(termData) {
        super(termData);
        // Additional custom properties or methods can be defined here if needed
    }

    // Override methods if necessary
    roll({ minimize = false, maximize = false } = {}) {
        return super.roll({ minimize, maximize });
    }

    // Define custom modifiers if needed
    static MODIFIERS = {
        'customMod': 'yourModifierFunction'
    };

    // Override getResultLabel if you need custom labels
    getResultLabel(result) {
        return super.getResultLabel(result);
    }
}

// Register the custom dice term during initialization
Hooks.once('init', () => {
    CONFIG.Dice.terms['m'] = MaaDice;
    MaaDice.DENOMINATION = 'm';
    console.log("MaaDice term registered");
});

// Example function to use the custom dice term in a roll
async function exampleRoll() {
    const roll = new Roll('2m6 + 4'); // Example roll formula using MaaDice
    await roll.evaluate({ async: true });
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
