// module.js

// Function to register the custom dice roll command
function registerCustomDiceRoll() {
    Hooks.on('chatMessage', async (chatLog, messageText) => {
        if (messageText.startsWith('/r ')) {
            const customRollPattern = /\/r diff\((\d+d\d+)\)/;
            const match = customRollPattern.exec(messageText);
            if (match) {
                const processedMessage = await processCustomRoll(match[1]);
                if (processedMessage) {
                    await ChatMessage.create({ content: processedMessage, speaker: ChatMessage.getSpeaker() });
                    return false; // Prevent the default chat message handling
                }
            }
        }
        return true;
    });
}

// Function to process custom dice rolls
async function processCustomRoll(diceExpression) {
    try {
        const roll = new Roll(diceExpression);
        await roll.evaluate({ async: true });

        const rolls = roll.terms[0].results.map(r => r.result);
        let outcome;
        let crit = false;

        if (rolls.length === 1) {
            // For a single die roll (e.g., 1d20)
            outcome = rolls[0];
            if (outcome === roll.terms[0].faces) {
                crit = true;  // Check if the roll is a critical hit
            }
        } else if (rolls.length > 1) {
            // For multiple dice rolls (e.g., 2dX)
            const max = Math.max(...rolls);
            const min = Math.min(...rolls);
            outcome = max - min;
            if (max === roll.terms[0].faces) {
                crit = true;  // Check if the roll is a critical hit
            }
        } else {
            ui.notifications.error("Invalid dice expression.");
            return null;
        }

        // Create inline roll HTML
        return `<span class="inline-roll inline-result" data-tooltip="Rolling ${diceExpression}">
              <span class="dice-formula">${diceExpression}</span>
              = <span class="dice-total">${outcome}${crit ? ' (Critical Hit!)' : ''}</span>
            </span>`;
    } catch (error) {
        console.error(`Invalid custom dice expression: ${diceExpression}`, error);
        ui.notifications.error(`Invalid custom dice expression: ${diceExpression}`);
        return null;
    }
}

// Function to process inline dice rolls in chat messages
async function processInlineRolls(messageText) {
    const inlineRollPattern = /\[\[([^\]]+)\]\]/g; // Matches [[XdY + Z]] inline rolls
    let match;
    const processedMatches = [];

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
            processedMatches.push({ match: match[0], result: inlineRollHTML });
        } catch (error) {
            console.error(`Invalid inline dice expression: ${diceExpression}`);
        }
    }

    processedMatches.forEach(pm => {
        messageText = messageText.replace(pm.match, pm.result);
    });

    // Return the processed message text with inline rolls replaced
    return messageText;
}

// Hook into chat message creation to process inline rolls
Hooks.on('preCreateChatMessage', async (message) => {
    if (message.content) {
        const processedContent = await processInlineRolls(message.content);
        if (processedContent !== message.content) {
            message.content = processedContent;
        }
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
