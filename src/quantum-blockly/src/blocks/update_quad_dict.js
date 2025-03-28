import Blockly from 'blockly';

Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "update_quad_dict",
        "message0": "Add to dict  %1 : var1 %2 var2 %3 value %4",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
            "text": "dict"
          },
          {
            "type": "field_input",
            "name": "KEY",
            "text": "x_1"
          },
          {
            "type": "field_input",
            "name": "KEY2",
            "text": "x_2"
          },
          {
            "type": "field_number",
            "name": "VALUE",
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

