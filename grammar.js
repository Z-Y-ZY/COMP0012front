module.exports = grammar({
	name: "COMP0012Language",

	extras: ($) => [
		/[ \t]+/,
		$.comment
	],

	word: ($) => $.identifier,

	conflicts: $ => [
    [$.list_literal, $.list_comprehension],
	[$._primary_expression, $.index_expression, $.slice],
	[$.list_literal, $.index_expression],
    [$.list_literal, $.slice],
	[$.list_comprehension, $.index_expression],
    [$.list_comprehension, $.slice],
	[$.source_file]
  	],

	rules: {
		
		source_file: ($) => 
			optional(seq(
				optional($._separator),
				$._item,
				repeat(
					seq(
						$._separator, $._item
					)
				),
				optional($._separator),
			)),

		_item: ($) => 
			choice(
				$._statement, $.comment
			),

		_newlines: ($) => 
			/[\r\n]+/,
		_separator: ($) => 
			/[\r\n]+/,
		
		block: ($) =>
			seq(
                "{",
                optional($._newlines),
                $._statement,
                repeat(
					seq(
						$._separator, $._statement
					)
				),
                optional($._separator),
                "}",
            ),
		_primary_expression: ($) =>
			choice(
				$._value,
				$.identifier,
				$.list_literal,
				$.list_comprehension,
				$.binary_expression
			),
		_postfix_expression: ($) =>
			choice(
				$.index_expression,
				$.slice,
				$._primary_expression
			),
		binary_expression: $ => 
			prec.left(1, 
				seq(
					$._primary_expression,
					choice('+', '-', '*', '/'),
					$._primary_expression
				)
			),

		_value: ($) =>
			choice(
				$.bool,
				$.num,
				$.string,
				$.block,
			),

		argument_list: ($) => 
			seq(
				"(", 
				repeat($._expression), 
				")"
			),
		method_call: ($) =>
			seq(
				field("receiver", $.identifier),
				".",
				field("name", $.identifier),
				$.argument_list,
			),

		_expression: ($) => 
			$._postfix_expression,
			
		assignment: ($) =>
			seq(
				"var", 
				field("name", $.identifier), 
				"=", 
				field("value", $._statement)
			),

		_statement: ($) => 
			choice( 
				$.assignment, 
				$.method_call,
				$._expression
			),
			
		index_expression: ($) =>
			prec.left(1,
				seq(
					field(
						"array", 
						choice(
							$.identifier, 
							$.list_literal, 
							$.list_comprehension
						)
					),
					repeat1(
						seq(
							"[",
							field(
								"index", 
								choice(
									$.num, $.identifier
								)
							),
							"]"
						)
					)
				),
			),

		slice: ($) =>
			prec.left(1,
				seq(
					field(
						"array", 
						choice(
							$.identifier, 
							$.list_literal, 
							$.list_comprehension
						)
					),
					repeat1(
						seq(
							"[", 
							optional($.num), 
							":", 
							optional($.num),
							optional(
								seq(
									":",
									$.num
								)
							), 
							"]"
						)
					)
				),
			),

		list_literal: $ => 
			seq(
				'[',
				optional(
					seq(
						$._expression,
						repeat(
							seq(
								',', 
								$._expression
							)
						),
						optional(',')
					)
				),
				']',
			),

		comprehension_clauses: $ => 
			seq(
				$.for_clause,
				repeat($.for_clause),
				optional($.if_clause)
			),
		list_comprehension: $ => 
			seq(
				'[',
				$._expression,
				$.comprehension_clauses,
				']'
			),

		for_clause: $ => 
			seq(
				'for',
				$.identifier,
				'in',
				$._expression
			),

		if_clause: $ => 
			seq(
				'if',
				$._expression
			),
		_newline: (_$) => /\s*\n/,
		identifier: (_$) => /[A-Za-z_]+/,
		bool: (_$) => choice("true", "false"),
		num: (_$) => /[0-9]+/,
		string: (_$) => seq('"', /[^"]+/, '"'),

		// http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
		comment: (_$) =>
			token(choice(
				/\/\/[^\n]*/,
				/\/\/[^\n]*\n?/, 
				/\/\*[^*]*\*+([^/*][^*]*\*+)*\//, 
			)),
	},
});
