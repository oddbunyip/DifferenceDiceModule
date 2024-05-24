// Module ID
const MODULE_ID = 'enhanced-dice-roller';

// Module configuration
const MODULE_CONFIG = {
    // Add any configurable options for your module here
};

// Initialize the module
Hooks.once('init', () => {
    console.log(`Initializing ${MODULE_ID}`);

    // Register module settings
    registerSettings();

    // Register the custom dice rolling function
    Roll.prototype.mwr = async function(formula) {
        // Parse the formula to extract the number of dice and dice size
        const regex = /(\d+)d(\d+)/;
        const matches = formula.match(regex);

        if (matches) {
            const [numDice, diceSize] = matches.slice(1).map(Number);

            // Perform the roll
            const rollResult = await new Roll(formula).evaluate({ async: true });

            // Get the roll results
            const results = rollResult.dice[0].results;

            // Calculate the difference between the highest and lowest dice
            const max = Math.max(...results.map(r => r.result));
            const min = Math.min(...results.map(r => r.result));
            const diff = max - min;

            // Count the number of maximum dice rolls (crits)
            const critCount = results.filter(r => r.result === diceSize).length;

            // Prepare the chat message data
            const chatData = {
                user: game.user._id,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                roll: rollResult,
                content: `
          <div class="dice-roll">
            <div class="dice-result">
              <div class="dice-formula">${formula}</div>
              <div class="dice-tooltip">
                <section class="tooltip-part">
                  <div class="dice">
                    <ol class="dice-rolls">
                      ${results.map(r => `<li class="roll ${r.result === diceSize ? 'max' : ''}">${r.result}</li>`).join('')}
                    </ol>
                  </div>
                </section>
              </div>
              <h4 class="dice-total">${numDice === 1 ? results[0].result : diff}</h4>
            </div>
            ${critCount > 0 ? `<div class="dice-crit">Critical Rolls: ${critCount}</div>` : ''}
          </div>
        `,
                speaker: ChatMessage.getSpeaker({ actor: this.actor })
            };

            // Create the chat message
            const message = await ChatMessage.create(chatData);

            // Apply the crit style to the chat message if there are critical rolls
            if (critCount > 0) {
                message.data.content.find(".dice-roll").addClass("crit");
            }

            // Return the result based on the number of dice
            return numDice === 1 ? results[0].result : diff;
        } else {
            throw new Error("Invalid dice formula");
        }
    };
});

// Register module settings
function registerSettings() {
    // Add any module settings registration here
}

// Add any additional hooks or event listeners here