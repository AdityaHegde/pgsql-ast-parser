@lexer lexerAny
@include "base.ne"
@include "expr.ne"
@{%
    function extractSample(x: any, type: string, index: number) {
        return track(x, {
            type,
            details: x[index],
        });
    }
    function sampleSizeWithPostfix(x: any, postfix: string) {
        return track(x, {
            size: unbox(x[0]),
            postfix,
        });
    }
%}

# https://duckdb.org/docs/sql/samples

select_using_sample
    -> %kw_using %kw_sample sample_size_first {% x => extractSample(x, 'sample', 2) %}
     | %kw_using %kw_sample sample_method_first {% x => extractSample(x, 'sample', 2) %}

select_table_sample
    -> %kw_tablesample sample_size_first {% x => extractSample(x, 'tablesample', 1) %}
     | %kw_tablesample sample_method_first {% x => extractSample(x, 'tablesample', 1) %}

# syntax with sample size followed by method
sample_size_first
    -> sample_size sample_size_method_fragment:? {% x => track(x, {
        type: 'size-first',
        size: x[0],
        ...x[1] ? {
            method: x[1].method,
            ...x[1].seed ? { seed: x[1].seed } : {},
        } : {},
    }) %}
sample_size_method_fragment -> lparen sampling_methods sample_size_first_seed:? rparen {% x => track(x, {
        type: 'size-first',
        method: x[1],
        seed: unbox(x[2]),
    }) %}
sample_size_first_seed -> comma int {% x => x[1] %}

# syntax with sample method followed by size
sample_method_first -> sampling_methods:? lparen sample_size rparen sample_method_seed:? {% x => track(x, {
    type: 'method-first',
    size: x[2],
    ...x[0] ? { method: x[0] } : {},
    ...x[4] ? { seed: unbox(x[4]) } : {},
}) %}
sample_method_seed -> kw_repeatable lparen int rparen {% x => x[2] %}

sample_size
    -> int              {% x => track(x, { size: unbox(x[0]) }) %}
     | int kw_rows      {% x => sampleSizeWithPostfix(x, "ROWS") %}
     | int %op_mod      {% x => sampleSizeWithPostfix(x, "%") %}
     | float %op_mod    {% x => sampleSizeWithPostfix(x, "%") %}
     | int kw_percent   {% x => sampleSizeWithPostfix(x, "PERCENT") %}
     | float kw_percent {% x => sampleSizeWithPostfix(x, "PERCENT") %}

sampling_methods
    -> kw_reservoir {% unwrap %}
     | kw_bernoulli {% unwrap %}
     | kw_system    {% unwrap %}
