import Blockly from 'blockly';

Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "merge_dict",
        "message0": "Merge dictionaries %1 { %2 %3 }",
        "args0": [
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
        "output": null,
        "colour": 245,
        "tooltip": "",
        "helpUrl": ""
      }
]);