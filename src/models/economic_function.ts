import { Variables, FunctionAffine, Point, Optimize, ArithOper, CondiOper } from './pl.type';
type Max = {
    posX: number;
    posY: number;
    negX: number;
    negY: number;
};
export class EconomicFunction {
    public static variables: Variables;
    private static funcRegExp: RegExp;
    private optimize: Optimize; // optimisé valeur : MAX ou MIN
    private funcString: string;
    private z!: FunctionAffine;
    private color: string = '#ff3333';

    constructor(optimize: Optimize, func: string, variables?: Variables) {
        this.optimize = optimize;
        this.funcString = func;
        if (variables) {
            EconomicFunction.setVariables(variables);
        }
        EconomicFunction.funcRegExp = new RegExp('');
    }

    public isContrainte = (): boolean => {
        if (
            EconomicFunction.variables &&
            EconomicFunction.variables.x &&
            EconomicFunction.variables.y &&
            EconomicFunction.variables.x !== '' &&
            EconomicFunction.variables.y !== '' &&
            EconomicFunction.funcRegExp &&
            EconomicFunction.funcRegExp.test(this.funcString)
        ) {
            return true;
        }
        return false;
    };

    public static setVariables(variables: Variables) {
        EconomicFunction.variables = variables;
        EconomicFunction.funcRegExp = new RegExp(`^([\+|\-]?)([0-9]{1,})(${EconomicFunction.variables.x})([\+|\-]{1,1})([\+|\-]?)([0-9]{1,})(${EconomicFunction.variables.y})$`);
    }

    public setFuncString = (func: string): void => {
        this.funcString = func;
        if (this.isContrainte()) {
            this.setZ(EconomicFunction.funcRegExp, this.funcString);
        }
    };

    getFuncString(): string {
        return this.funcString;
    }

    setOptimize(opt: Optimize) {
        this.optimize = opt;
    }

    getOptimize(): Optimize {
        return this.optimize;
    }

    setZ(reg: RegExp, func: string) {
        let tmp = func.match(reg);
        if (tmp) {
            let tmpCY: number, tmpCX: number;
            tmpCX = tmp[1] === '-' ? (tmp[2] ? -1 * parseFloat(tmp[2]) : -1 * 1) : parseFloat(tmp[2] ? tmp[2] : '1');
            tmpCY = tmp[5] === '-' ? (tmp[6] ? -1 * parseFloat(tmp[6]) : -1 * 1) : parseFloat(tmp[6] ? tmp[6] : '1');
            this.z = {
                x: {
                    constant: tmpCX,
                    parameter: tmp[3],
                },
                y: {
                    constant: tmpCY,
                    parameter: tmp[7],
                },
                arithOper: tmp[4] as ArithOper,
                condiOper: '=' as CondiOper,
                c: 0,
            };
        }
    }

    getZ(): FunctionAffine {
        return this.z;
    }

    getFuncAffine(): FunctionAffine {
        return this.z;
    }

    getGraphPoints(max: Max): Point[] {
        let points: Point[] = [];
        let tmpAffin = this.getZ();
        if (tmpAffin) {
            if (tmpAffin.x.constant === 0 && tmpAffin.y.constant === 0) {
                alert(' [ Impossible : Constant null ] toutes les valeurs sont des solutions ou pas');
            } else if (tmpAffin.x.constant === 0) {
                points = [
                    {
                        x: max.negX,
                        y: tmpAffin.c / tmpAffin.y.constant,
                    },
                    {
                        x: max.posX,
                        y: tmpAffin.c / tmpAffin.y.constant,
                    },
                ];
            } else if (tmpAffin.y.constant === 0) {
                points = [
                    {
                        x: tmpAffin.c / tmpAffin.x.constant,
                        y: max.negY,
                    },
                    {
                        x: tmpAffin.c / tmpAffin.x.constant,
                        y: max.posY,
                    },
                ];
            } else {
                points.push(this.getPointByX(tmpAffin, max.negX));
                points.push(this.getPointByX(tmpAffin, max.posX));
            }
        }
        return points;
    }

    getPointByX(func: FunctionAffine, x: number): Point {
        let tmpPoint: Point = {
            x: x,
            y: 0,
        };
        if (func) {
            switch (func.arithOper) {
                case '+':
                    tmpPoint.y = (func.c + -1 * func.x.constant * x) / func.y.constant;
                    break;
                case '-':
                    tmpPoint.y = (func.c + -1 * func.x.constant * x) / (-1 * func.y.constant);
                    break;
            }
        }
        return tmpPoint;
    }

    getPointByY(func: FunctionAffine, y: number): Point {
        let tmpPoint: Point = {
            x: 0,
            y: y,
        };
        if (func) {
            switch (func.arithOper) {
                case '+':
                    tmpPoint.x = (func.c + -1 * func.y.constant * y) / func.x.constant;
                    break;
                case '-':
                    tmpPoint.y = (func.c + -1 * func.y.constant * y) / (-1 * func.x.constant);
                    break;
            }
        }
        console.log('Max y' + y + 'tmpPoint', tmpPoint);

        return tmpPoint;
    }

    public calculate(func: FunctionAffine, x: number, y: number): number {
        let result: number = 0;
        if (x === Number.POSITIVE_INFINITY && y === Number.NEGATIVE_INFINITY) {
            return Number.POSITIVE_INFINITY;
        } else {
            switch (func.arithOper) {
                case '+':
                    result = func.x.constant * x + func.y.constant * y;
                    break;
                case '-':
                    result = func.x.constant * x + -1 * func.y.constant * y;
                    break;
            }
        }
        return result;
    }

    public getSolutionPathPoints(c: number, max: Max): Point[] {
        let points: Point[] = [];
        let tmpAffine = this.getZ();
        tmpAffine.c = c;
        points = [this.getPointByY(tmpAffine, max.posY), this.getPointByX(tmpAffine, max.posX)];
        return points;
    }

    getColor(): string {
        return this.color;
    }

    public setC(c: number) {
        this.z.c = c;
    }
}
