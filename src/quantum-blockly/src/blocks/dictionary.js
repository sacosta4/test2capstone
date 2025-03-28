import Blockly from 'blockly';

Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "dictionary",
        "message0": "Create dictionary with name %1 %2 { %3 %4 }",
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
            "type": "input_dummy"
          },
          {
            "type": "input_statement",
            "name": "MEMBERS"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 245,
        "tooltip": "",
        "helpUrl": ""
      }
]);

