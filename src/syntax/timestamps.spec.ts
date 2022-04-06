import 'mocha';
import 'chai';
import {
    checkSelect, col,
    columns, tbl,
    timeInterval
} from './spec-utils';

describe('Select interval statements', () => {
    checkSelect("SELECT INTERVAL 2 years", {
        type: "select",
        columns: [timeInterval(2, "years")],
    });

    checkSelect("SELECT INTERVAL 2 d as d", {
        type: "select",
        columns: [timeInterval(2, "d", "d")],
    });

    checkSelect("SELECT INTERVAL 10 ms as ms, interval from tbl", {
        type: "select",
        from: [tbl('tbl')],
        columns: [timeInterval(10, "ms", "ms"), col("interval")],
    });
});
