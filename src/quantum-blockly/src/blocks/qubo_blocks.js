import Blockly from 'blockly';

// QUBO Main Block Definition
Blockly.Blocks['qubo_main_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('QUBO Main Block');
    for (let i = 1; i <= 9; i++) {
      this.appendValueInput(`WEIGHT${i}`)
        .setCheck('Number')
        .appendField(`x${i}`);
    }
    this.setInputsInline(false);
    this.setColour(230);
    this.setTooltip('Define weights for terms x1 to x9');
    this.setHelpUrl('');
  },
};


// Linear Term Block Definition
Blockly.Blocks['linear_term_block'] = {
  init: function () {
    this.jsonInit({
      "type": "linear_term_block",
      "message0": "Key: %1 Value: %2",
      "args0": [
        {
          "type": "field_input",
          "name": "KEY",
          "text": "key"
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Number"
        }
      ],
      "output": "LinearTerm",
      "colour": 230,
      "tooltip": "A single linear term with key and weight.",
      "helpUrl": ""
    });
  }
};

// Initialize dictionaries block
Blockly.Blocks['init_dictionaries'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Initialize QUBO dictionaries");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Initialize linear and quadratic dictionaries for QUBO");
    this.setHelpUrl("");
  }
};

// Set linear weight block
Blockly.Blocks['set_linear_weight'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set linear weight for");
    this.appendValueInput("VARIABLE")
        .setCheck("String")
        .appendField("variable");
    this.appendValueInput("WEIGHT")
        .setCheck("Number")
        .appendField("weight");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Set weight for a linear term in QUBO");
    this.setHelpUrl("");
  }
};

// Set quadratic weight block
Blockly.Blocks['set_quadratic_weight'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set quadratic weight for");
    this.appendValueInput("VARIABLE1")
        .setCheck("String")
        .appendField("variable 1");
    this.appendValueInput("VARIABLE2")
        .setCheck("String")
        .appendField("variable 2");
    this.appendValueInput("WEIGHT")
        .setCheck("Number")
        .appendField("weight");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Set weight for a quadratic term in QUBO");
    this.setHelpUrl("");
  }
};

// Return dictionaries block
Blockly.Blocks['return_dictionaries'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Return QUBO dictionaries");
    this.setPreviousStatement(true, null);
    this.setNextStatement(false, null);
    this.setColour(230);
    this.setTooltip("Return the linear and quadratic dictionaries");
    this.setHelpUrl("");
  }
};
