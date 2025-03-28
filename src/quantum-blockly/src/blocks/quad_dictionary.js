import Blockly from 'blockly';

Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "quad_dictionary",
        "implicitAlign0": "RIGHT",
        "message0": "Create quadratic dictionary with: name %1 %2 var1 %3 var2 %4 value %5 %6 var1 %7 var2 %8 value %9 %10 var1 %11 var2 %12 value %13",
        "args0": [
            {
                "type": "field_input",
                "name": "NAME",
                "text": "dict"
            },
            {
                "type": "input_dummy"
            },
            {
                "type": "field_input",
                "name": "KEY1_P1",
                "text": "x_1"
            },
            {
                "type": "field_input",
                "name": "KEY1_P2",
                "text": "x_2"
            },
            {
                "type": "field_number",
                "name": "VAL1",
                "value": 0
            },
            {
                "type": "input_dummy",
                "align": "RIGHT"
            },
            {
                "type": "field_input",
                "name": "KEY2_P1",
                "text": "x_3"
            },
            {
                "type": "field_input",
                "name": "KEY2_P2",
                "text": "x_4"
            },
            {
                "type": "field_number",
                "name": "VAL2",
                "value": 0
            },
            {
                "type": "input_dummy",
                "align": "RIGHT"
            },
            {
                "type": "field_input",
                "name": "KEY3_P1",
                "text": "x_5"
            },
            {
                "type": "field_input",
                "name": "KEY3_P2",
                "text": "x_6"
            },
            {
                "type": "field_number",
                "name": "VAL3",
                "value": 0
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 245,
        "tooltip": "",
        "helpUrl": ""
    }
]);