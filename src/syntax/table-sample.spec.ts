import 'mocha';
import 'chai';
import {
    checkSelect,
    columns,
    ref,
    tbl,
    sampleSizeFirst, sampleSizeNum, usingSample, sampleMethodFirst, tableSample, name
} from './spec-utils';
import {JoinClause} from "./ast";

describe('Select statements with samples', () => {
    // USING SAMPLE
    checkSelect("SELECT * FROM tbl USING SAMPLE 5;", {
        type: 'select',
        from: [tbl('tbl')],
        columns: columns({ type: 'ref', name: '*' }),
        sample: usingSample(sampleSizeFirst(sampleSizeNum(5))),
    });

    checkSelect("SELECT * FROM tbl USING SAMPLE 10%;", {
        type: 'select',
        from: [tbl('tbl')],
        columns: columns({ type: 'ref', name: '*' }),
        sample: usingSample(sampleSizeFirst(sampleSizeNum(10, "%"))),
    });

    checkSelect("SELECT * FROM tbl USING SAMPLE 10 PERCENT (bernoulli);", {
        type: 'select',
        from: [tbl('tbl')],
        columns: columns({ type: 'ref', name: '*' }),
        sample: usingSample(sampleSizeFirst(sampleSizeNum(10, "PERCENT"), "bernoulli")),
    });

    checkSelect("SELECT * FROM tbl USING SAMPLE 10% (system, 377);", {
        type: 'select',
        from: [tbl('tbl')],
        columns: columns({ type: 'ref', name: '*' }),
        sample: usingSample(sampleSizeFirst(sampleSizeNum(10, "%"), "system", 377)),
    });

    checkSelect("SELECT * FROM tbl USING SAMPLE (5);", {
        type: 'select',
        from: [tbl('tbl')],
        columns: columns({ type: 'ref', name: '*' }),
        sample: usingSample(sampleMethodFirst(sampleSizeNum(5))),
    });

    checkSelect("SELECT * FROM tbl USING SAMPLE bernoulli(5%);", {
        type: 'select',
        from: [tbl('tbl')],
        columns: columns({ type: 'ref', name: '*' }),
        sample: usingSample(sampleMethodFirst(sampleSizeNum(5, "%"), "bernoulli")),
    });

    checkSelect("SELECT * FROM tbl USING SAMPLE reservoir(50 ROWS) REPEATABLE (100);", {
        type: 'select',
        from: [tbl('tbl')],
        columns: columns({ type: 'ref', name: '*' }),
        sample: usingSample(sampleMethodFirst(sampleSizeNum(50, "ROWS"), "reservoir", 100)),
    });

    // TABLESAMPLE
    checkSelect("SELECT * FROM tbl TABLESAMPLE 5;", {
        type: 'select',
        from: [tableSample("tbl", sampleSizeFirst(sampleSizeNum(5)))],
        columns: columns({ type: 'ref', name: '*' }),
    });

    checkSelect("SELECT * FROM tbl TABLESAMPLE 10%;", {
        type: 'select',
        from: [tableSample('tbl', sampleSizeFirst(sampleSizeNum(10, "%")))],
        columns: columns({ type: 'ref', name: '*' }),
    });

    checkSelect("SELECT * FROM tbl TABLESAMPLE 10 PERCENT (bernoulli);", {
        type: 'select',
        from: [tableSample('tbl', sampleSizeFirst(sampleSizeNum(10, "PERCENT"), "bernoulli"))],
        columns: columns({ type: 'ref', name: '*' }),
    });

    checkSelect("SELECT * FROM tbl TABLESAMPLE 10% (system, 377);", {
        type: 'select',
        from: [tableSample('tbl', sampleSizeFirst(sampleSizeNum(10, "%"), "system", 377))],
        columns: columns({ type: 'ref', name: '*' }),
    });

    checkSelect("SELECT * FROM tbl TABLESAMPLE (5);", {
        type: 'select',
        from: [tableSample('tbl', sampleMethodFirst(sampleSizeNum(5)))],
        columns: columns({ type: 'ref', name: '*' }),
    });

    checkSelect("SELECT * FROM tbl TABLESAMPLE bernoulli(5%);", {
        type: 'select',
        from: [tableSample('tbl', sampleMethodFirst(sampleSizeNum(5, "%"), "bernoulli"))],
        columns: columns({ type: 'ref', name: '*' }),
    });

    checkSelect("SELECT * FROM tbl TABLESAMPLE reservoir(50 ROWS) REPEATABLE (100);", {
        type: 'select',
        from: [tableSample('tbl', sampleMethodFirst(sampleSizeNum(50, "ROWS"), "reservoir", 100))],
        columns: columns({ type: 'ref', name: '*' }),
    });

    const JOIN: JoinClause = {
        type: 'INNER JOIN',
        on: {
            type: 'binary',
            op: '=',
            left: {
                type: 'ref',
                table: { name: 'tbl1' },
                name: 'i',
            },
            right: {
                type: 'ref',
                table: { name: 'tbl2' },
                name: 'i',
            },
        }
    }

    checkSelect("SELECT * FROM tbl1 TABLESAMPLE SYSTEM(20%) JOIN tbl2 ON tbl1.i=tbl2.i;", {
        type: 'select',
        from: [
            tableSample('tbl1', sampleMethodFirst(sampleSizeNum(20, "%"), "system")),
            {
                type: 'table',
                name: name('tbl2'),
                join: JOIN,
            }
        ],
        columns: columns({ type: 'ref', name: '*' }),
    });

    checkSelect("SELECT * FROM tbl1 JOIN tbl2 TABLESAMPLE SYSTEM(20%) ON tbl1.i=tbl2.i;", {
        type: 'select',
        from: [
            tbl("tbl1"),
            tableSample('tbl2', sampleMethodFirst(sampleSizeNum(20, "%"), "system"), JOIN),
        ],
        columns: columns({ type: 'ref', name: '*' }),
    });

    checkSelect("SELECT * FROM tbl1 JOIN tbl2 ON tbl1.i=tbl2.i USING SAMPLE 10%;", {
        type: 'select',
        from: [
            tbl("tbl1"),
            {
                type: 'table',
                name: name('tbl2'),
                join: JOIN,
            },
        ],
        columns: columns({ type: 'ref', name: '*' }),
        sample: usingSample(sampleSizeFirst(sampleSizeNum(10, "%"))),
    });
});
