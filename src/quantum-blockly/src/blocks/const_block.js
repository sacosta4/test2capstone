import Blockly from 'blockly';

Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "const_block",
        "message0": "const %1 %2",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
            "text": "name"
          },
          {
            "type": "input_value",
            "name": "VALUE"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 245,
        "tooltip": "",
        "helpUrl": ""
      }
]);