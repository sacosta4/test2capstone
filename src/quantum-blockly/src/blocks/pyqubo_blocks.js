import Blockly from 'blockly';

// PyQUBO Variable Block
Blockly.Blocks['pyqubo_variable'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_variable",
      "message0": "Create %1 variable %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TYPE",
          "options": [
            ["Binary", "Binary"],
            ["Spin", "Spin"],
            ["Array", "Array"]
          ]
        },
        {
          "type": "field_input",
          "name": "NAME",
          "text": "x1"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Define a PyQUBO variable",
      "helpUrl": ""
    });
  }
};

// PyQUBO Constraint Block
Blockly.Blocks['pyqubo_constraint'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_constraint",
      "message0": "Add constraint: %1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "LHS"
        },
        {
          "type": "field_dropdown",
          "name": "OPERATOR",
          "options": [
            ["=", "="],
            ["<=", "<="],
            [">=", ">="],
            ["!=", "!="]
          ]
        },
        {
          "type": "input_value",
          "name": "RHS",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Add a constraint to the QUBO model",
      "helpUrl": ""
    });
  }
};

// PyQUBO Objective Block
Blockly.Blocks['pyqubo_objective'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_objective",
      "message0": "Set objective function: %1",
      "args0": [
        {
          "type": "input_value",
          "name": "EXPRESSION"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Define the objective function to minimize",
      "helpUrl": ""
    });
  }
};

// PyQUBO Expression Block
Blockly.Blocks['pyqubo_expression'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_expression",
      "message0": "%1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "LEFT"
        },
        {
          "type": "field_dropdown",
          "name": "OPERATOR",
          "options": [
            ["+", "+"],
            ["-", "-"],
            ["*", "*"],
            ["/", "/"],
            ["^", "**"]
          ]
        },
        {
          "type": "input_value",
          "name": "RIGHT"
        }
      ],
      "output": null,
      "colour": 230,
      "tooltip": "Create a mathematical expression",
      "helpUrl": ""
    });
  }
};

// PyQUBO Function Block (Updated version of the original function block)
Blockly.Blocks['pyqubo_function'] = {
  init: function() {
    this.jsonInit({
      "type": "pyqubo_function",
      "message0": "Define function %1 with parameter %2",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "createQuboForSingleMove"
        },
        {
          "type": "input_value",
          "name": "PARAM"
        }
      ],
      "message1": "Variables, Constraints, and Objective %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "BODY"
        }
      ],
      "colour": 230,
      "tooltip": "Define a function that returns a PyQUBO model",
      "helpUrl": ""
    });
  }
};
