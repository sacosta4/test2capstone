import Blockly from 'blockly/core';

Blockly.Blocks['minimax'] = {
  init: function() {
    this.appendDummyInput().appendField("Minimax Algorithm");
    this.appendValueInput("DEPTH")
        .setCheck("Number")
        .appendField("Depth:");
    this.appendValueInput("BOARD_STATE")
        .setCheck("Array")
        .appendField("Board State:");
    this.setInputsInline(false);
    this.setOutput(true, "Number"); // Returns best move
    this.setColour(230);
    this.setTooltip("Performs Minimax Algorithm");
    this.setHelpUrl("");
  }
};