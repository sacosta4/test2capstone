import Blockly from 'blockly';

Blockly.common.defineBlocksWithJsonArray([
  {
    "type": "update_dict",
    "message0": "Add to dictionary %1 , key: %2 , value %3",
    "args0": [
      {
        "type": "field_variable",
        "name": "NAME",
      },
      {
        "type": "input_value",
        "name": "KEY"
      },
      {
        "type": "input_value",
        "name": "VALUE"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 245,
    "tooltip": "",
    "helpUrl": ""
  }
]);

