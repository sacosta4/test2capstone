import Blockly from 'blockly';

Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "check_index",
        "message0": "board[ %1 ] === %2",
        "args0": [
            {
                "type": "input_value",
                "name": "INDEX",
            },
            {
                "type": "input_value",
                "name": "VALUE",
            }
        ],
        "inputsInline": true,
        "output": "Boolean",
        "colour": 245,
        "tooltip": "",
        "helpUrl": ""
    }
]);
