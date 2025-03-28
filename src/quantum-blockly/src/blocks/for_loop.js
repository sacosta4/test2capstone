import Blockly from 'blockly';

Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "for_loop",
        "message0": "count with %1 from %2 to %3 by %4 %5",
        "args0": [
            {
                "type": "field_variable",
                "name": "VAR",
            },
            {
                "type": "input_value",
                "name": "FROM",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "TO",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "BY",
                "check": "Number"
            },
            {
                "type": "input_dummy"
            }
        ],
        "message1": "do %1",
        "args1": [
            {
                "type": "input_statement",
                "name": "DO",
                "check": null
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "",
        "helpUrl": "",
        "onchange": function () {
            var workspace = this.workspace;
            if (!workspace || workspace.isFlyout || workspace.rendered) {
                return;
            }
            var varName = this.getFieldValue('VAR');
            var existingVars = Blockly.Variables.allVariables(workspace);
            if (existingVars.indexOf(varName) !== -1) {
                var suffix = 1;
                var newVarName = varName;
                while (existingVars.indexOf(newVarName) !== -1) {
                    newVarName = varName + suffix;
                    suffix++;
                }
                this.setFieldValue(newVarName, 'VAR');
            }
        }
    }
]);







