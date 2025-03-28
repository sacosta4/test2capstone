export const toolboxConfig = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Logic",
      categorystyle: "logic_category",
      contents: [
        { kind: "block", type: "controls_if" },
        { kind: "block", type: "logic_compare" },
        { kind: "block", type: "logic_operation" },
        { kind: "block", type: "logic_negate" },
        { kind: "block", type: "logic_boolean" },
        { kind: "block", type: "logic_null" },
        { kind: "block", type: "logic_ternary" }
      ]
    },
    {
      kind: "category",
      name: "Loops",
      categorystyle: "loop_category",
      contents: [
        {
          kind: "block",
          type: "controls_repeat_ext",
          inputs: {
            TIMES: {
              shadow: { type: "math_number", fields: { NUM: 10 } }
            }
          }
        },
        { kind: "block", type: "controls_whileUntil" },
        { kind: "block", type: "controls_for" },
        { kind: "block", type: "controls_forEach" },
        { kind: "block", type: "controls_flow_statements" },
        { kind: "block", type: "for_loop" }
      ]
    },
    {
      kind: "category",
      name: "Math",
      categorystyle: "math_category",
      contents: [
        { kind: "block", type: "math_number", fields: { NUM: 123 } },
        { kind: "block", type: "math_arithmetic" },
        { kind: "block", type: "math_single" },
        { kind: "block", type: "math_trig" },
        { kind: "block", type: "math_constant" },
        { kind: "block", type: "math_number_property" },
        { kind: "block", type: "math_round" },
        { kind: "block", type: "math_on_list" },
        { kind: "block", type: "math_modulo" },
        { kind: "block", type: "math_constrain" },
        { kind: "block", type: "math_random_int" },
        { kind: "block", type: "math_random_float" },
        { kind: "block", type: "math_atan2" }
      ]
    },
    {
      kind: "category",
      name: "Text",
      categorystyle: "text_category",
      contents: [
        { kind: "block", type: "text" },
        { kind: "block", type: "text_multiline" },
        { kind: "block", type: "text_join" },
        { kind: "block", type: "text_append" },
        { kind: "block", type: "text_length" },
        { kind: "block", type: "text_isEmpty" },
        { kind: "block", type: "text_indexOf" },
        { kind: "block", type: "text_charAt" },
        { kind: "block", type: "text_getSubstring" },
        { kind: "block", type: "text_changeCase" },
        { kind: "block", type: "text_trim" },
        { kind: "block", type: "text_count" },
        { kind: "block", type: "text_replace" },
        { kind: "block", type: "text_reverse" },
        { kind: "block", type: "text_print" },
        { kind: "block", type: "text_prompt_ext" }
      ]
    },
    {
      kind: "category",
      name: "Lists",
      categorystyle: "list_category",
      contents: [
        { kind: "block", type: "lists_create_with" },
        { kind: "block", type: "lists_repeat" },
        { kind: "block", type: "lists_length" },
        { kind: "block", type: "lists_isEmpty" },
        { kind: "block", type: "lists_indexOf" },
        { kind: "block", type: "lists_getIndex" },
        { kind: "block", type: "lists_setIndex" },
        { kind: "block", type: "lists_getSublist" },
        { kind: "block", type: "lists_split" },
        { kind: "block", type: "lists_sort" },
        { kind: "block", type: "lists_reverse" }
      ]
    },
    {
      kind: "category",
      name: "Color",
      categorystyle: "colour_category",
      contents: [
        { kind: "block", type: "colour_picker" },
        { kind: "block", type: "colour_random" },
        { kind: "block", type: "colour_rgb" },
        { kind: "block", type: "colour_blend" }
      ]
    },
    { kind: "sep" },
    {
      kind: "category",
      name: "Variables",
      categorystyle: "variable_category",
      custom: "VARIABLE"
    },
    {
      kind: "category",
      name: "Functions",
      categorystyle: "procedure_category",
      custom: "PROCEDURE"
    },
    {
      kind: "category",
      name: "Quantum",
      colour: "245",
      contents: [
        { kind: "block", type: "dictionary" },
        { kind: "block", type: "update_dict" },
        { kind: "block", type: "quad_dictionary" },
        { kind: "block", type: "update_quad_dict" },
        { kind: "block", type: "merge_dict" },
        { kind: "block", type: "key_value" },
        { kind: "block", type: "quad_pair" },
        { kind: "block", type: "key_block" },
        { kind: "block", type: "value_block" },
        { kind: "block", type: "dictionary_block" },
        { kind: "block", type: "const_block" },
        { kind: "block", type: "board_length" },
        { kind: "block", type: "check_index" },
        { kind: "block", type: "key_pair" },
        { kind: "block", type: "function" },
        { kind: "block", type: "board" }
      ]
    },
    {
      kind: "category",
      name: "QUBO Blocks",
      colour: "#5C81A6",
      contents: [
        { kind: "block", type: "init_dictionaries" },
        { kind: "block", type: "set_linear_weight" },
        { kind: "block", type: "set_quadratic_weight" },
        { kind: "block", type: "return_dictionaries" }
      ]
    },
    {
      kind: "category",
      name: "PyQUBO",
      colour: "#4169E1", // Royal Blue
      contents: [
        { kind: "block", type: "pyqubo_function" },
        { kind: "block", type: "pyqubo_variable" },
        { kind: "block", type: "pyqubo_constraint" },
        { kind: "block", type: "pyqubo_objective" },
        { kind: "block", type: "pyqubo_expression" }
      ]
    },
    // STUDENT-FRIENDLY QUANTUM CATEGORY
    {
      kind: "category",
      name: "Student-Friendly Quantum",
      colour: "#FE9365", // Orange-pink color
      contents: [
        { kind: "block", type: "simple_strategy" },
        { kind: "block", type: "win_detection_strategy" },
        { kind: "block", type: "visual_board" },
        { kind: "block", type: "position_weight" },
        { kind: "block", type: "quantum_strategy_builder" },
        { kind: "block", type: "beginner_strategy" },
        { kind: "block", type: "line_detection" },
        { kind: "block", type: "complete_strategy" },
        { kind: "block", type: "qubo_explanation" }
      ]
    }
  ]
};  

// SIMPLIFIED STUDENT-FRIENDLY TOOLBOX
// This is a simplified version of the toolbox for student mode
export const simplifiedStudentToolboxConfig = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "🎮 Easy Strategies",
      colour: "#4CAF50",
      contents: [
        { kind: "block", type: "simple_strategy" },
        { kind: "block", type: "beginner_strategy" }
      ]
    },
    {
      kind: "category",
      name: "🏆 Smart Strategies",
      colour: "#2196F3",
      contents: [
        { kind: "block", type: "win_detection_strategy" },
        { kind: "block", type: "line_detection" },
        { kind: "block", type: "complete_strategy" }
      ]
    },
    {
      kind: "category",
      name: "🎯 Custom Strategies",
      colour: "#9C27B0",
      contents: [
        { kind: "block", type: "quantum_strategy_builder" },
        { kind: "block", type: "position_weight" }
      ]
    },
    {
      kind: "category",
      name: "📚 Help & Examples",
      colour: "#607D8B",
      contents: [
        { kind: "block", type: "qubo_explanation" },
        { kind: "block", type: "visual_board" }
      ]
    },
    {
      kind: "category",
      name: "🧮 Math",
      colour: "#FF5722",
      contents: [
        { kind: "block", type: "math_number" },
        { kind: "block", type: "math_arithmetic" }
      ]
    },
    {
      kind: "category",
      name: "🔣 Logic",
      colour: "#795548",
      contents: [
        { kind: "block", type: "logic_compare" },
        { kind: "block", type: "logic_operation" },
        { kind: "block", type: "logic_boolean" }
      ]
    },
    {
      kind: "category",
      name: "📝 Variables",
      categorystyle: "variable_category",
      custom: "VARIABLE"
    }
  ]
};

// For regular mode when student mode is enabled
export const studentFriendlyToolboxConfig = {
  ...toolboxConfig,
  contents: [
    ...toolboxConfig.contents.filter(category => 
      category.name !== "Student-Friendly Quantum"
    ),
    {
      kind: "category",
      name: "Student Quantum Blocks",
      colour: "#FE9365",
      contents: [
        { kind: "block", type: "simple_strategy" },
        { kind: "block", type: "win_detection_strategy" },
        { kind: "block", type: "complete_strategy" }
      ]
    }
  ]
};

export default toolboxConfig;