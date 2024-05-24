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
        const [diceExpression, description] = command.split('#').map(part => part.trim());
        if (!diceExpression) {
            return ui.notifications.warn("Usage: /d <dice_expression> # <description>");
        }

        try {
            const roll = new Roll(diceExpression);
            await roll.evaluate({ async: true });

            const rolls = roll.terms[0].results.map(r => r.result);
            const maxFace = roll.terms[0].faces;  // Get the maximum face value of the dice
            let outcome;
            let crit = false;

            if (rolls.length === 1) {
                // For a single die roll (e.g., 1d20)
                outcome = rolls[0];
                if (outcome === maxFace) {
                    crit = true;  // Check if the roll is a critical hit
                }
            } else if (rolls.length > 1) {
                // For multiple dice rolls (e.g., 2dX)
                const max = Math.max(...rolls);
                const min = Math.min(...rolls);
                outcome = max - min;
                if (max === maxFace) {
                    crit = true;  // Check if the roll is a critical hit
                }
            } else {
                return ui.notifications.error("Invalid dice expression.");
            }

            // Prepare chat data with the required structure for Dice So Nice
            const chatData = {
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                rolls: [roll],
                content: `Rolling ${diceExpression}: <br> Rolls: [${rolls.join(', ')}] <br> Outcome: ${outcome}${crit ? ' (Critical Hit!)' : ''}<br>${description ? `<em>${description}</em>` : ''}`
            };

            ChatMessage.applyRollMode(chatData, "roll");
            ChatMessage.create(chatData);
        } catch (error) {
            console.error(error);
            ui.notifications.error("Invalid dice expression.");
        }
    }
}

// Function to process inline dice rolls in chat messages
async function processInlineRolls(messageText) {
    const inlineRollPattern = /\[\[([^\]]+)/g; // Matches [[XdY + Z]] inline rolls
    let match;

    while ((match = inlineRollPattern.exec(messageText)) !== null) {
        const diceExpression = match[1];
        try {
            const roll = new Roll(diceExpression);
            await roll.evaluate({ async: true });
            const rollResult = roll.total;

            // Create inline roll HTML
            const inlineRollHTML = `<span class="inline-roll inline-result" data-tooltip="Rolling ${diceExpression}">
                                <span class="dice-formula">${diceExpression}</span>
                                = <span class="dice-total">${rollResult}</span>
                              </span>`;

            messageText = messageText.replace(match[0], inlineRollHTML);
        } catch (error) {
            console.error(`Invalid inline dice expression: ${diceExpression}`);
        }
    }

    return messageText;
}

// Hook into chat message creation to process inline rolls
Hooks.on('preCreateChatMessage', async (message) => {
    if (message.content) {
        message.content = await processInlineRolls(message.content);
    }
});

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
