import Blockly from 'blockly';

Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "function",
        "message0": "to %1 , parameter: %2 %3 return { 'linear': %4 , 'quadratic': %5",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
            "text": "do something"
          },
          {
            "type": "input_value",
            "name": "PARAM"
          },
          {
            "type": "input_statement",
            "name": "BODY"
          },
          {
            "type": "input_value",
            "name": "LINEAR",
            "align": "RIGHT"
          },
          {
            "type": "input_value",
            "name": "QUADRATIC"
          }
        ],
        "inputsInline": true,
        "colour": 245,
        "tooltip": "",
        "helpUrl": ""
      }
]);