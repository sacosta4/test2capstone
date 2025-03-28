import Blockly from 'blockly';

Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "quad_pair",
        "message0": "var1 %1, var2 %2 : value %3",
        "args0": [
            {
                "type": "field_input",
                "name": "VAR_1",
                "text": "x_1"
            },
            {
                "type": "field_input",
                "name": "VAR_2",
                "text": "x_2"
            },
            {
                "type": "field_number",
                "name": "MEMBER_VALUE",
                "value": 0
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 245
    }
]);