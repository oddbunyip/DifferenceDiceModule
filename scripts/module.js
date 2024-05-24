// module.js

// Function to register the custom dice roll command
function registerCustomDiceRoll() {
    Hooks.on('chatMessage', (chatLog, messageText) => {
        if (messageText.startsWith('/d ')) {
            handleDiceRollCommand(messageText.slice(3).trim());
            return false;  // Prevent the default chat message handling
        }
    });

    async function handleDiceRollCommand(command) {
        const diceExpression = command.trim();
        if (!diceExpression) {
            return ui.notifications.warn("Usage: /d <dice_expression>");
        }

        try {
            const roll = new Roll(diceExpression);
            await roll.evaluate({ async: true });

            const rolls = roll.terms[0].results.map(r => r.result);
            let outcome;

            if (rolls.length === 1) {
                // For a single die roll (e.g., 1d20)
                outcome = rolls[0];
            } else if (rolls.length > 1) {
                // For multiple dice rolls (e.g., 2dX)
                const max = Math.max(...rolls);
                const min = Math.min(...rolls);
                outcome = max - min;
            } else {
                return ui.notifications.error("Invalid dice expression.");
            }

            const chatMessage = {
                user: game.user.id,
                speaker: ChatMessage.getSpeaker(),
                content: `Rolling ${diceExpression}: <br> Rolls: [${rolls.join(', ')}] <br> Outcome: ${outcome}`
            };
            ChatMessage.create(chatMessage);
        } catch (error) {
            console.error(error);
            ui.notifications.error("Invalid dice expression.");
        }
    }
}

// Initialize the module and register the custom dice roll command
Hooks.once('init', async function() {
    console.log("Initializing Your Custom Module");

    // Register custom dice roll command
    registerCustomDiceRoll();
});

// Perform additional setup once the game is fully ready
Hooks.once('ready', async function() {
    console.log("Your Custom Module is ready");

    // Additional setup tasks that require the game to be fully loaded
});
