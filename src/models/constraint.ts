import { Variables, FunctionAffine, ArithOper, CondiOper, Point } from 'src/models/pl.type';
//fonction affine
// ax+ by = c
export class Constraint {
    private id: number;
    private color: string;
    private static variables: Variables;
    private static funcRegExp: RegExp;
    private funcString: string;
    private funcAffine!: FunctionAffine;

    constructor(id: number, func: string) {
        this.id = id;
        this.funcString = func;
        this.color = this.generateColor();
    }

    public static setVariables = (variables: Variables) => {
        Constraint.variables = variables;
        Constraint.funcRegExp = new RegExp(`^([\+|\-]?)([0-9]{0,})(${Constraint.variables.x})([\+|\-]{1,1})([0-9]{0,})(${Constraint.variables.y})((\=)|(\<\=)|(\>\=)){1,1}([\+|\-]?)([0-9]{1,})$`);
    };

    public static getVariables = () => {
        return Constraint.variables;
    };

    public getId = (): number => {
        return this.id;
    };

    public setId = (id: number): void => {
        this.id = id;
    };

    public getFuncString = (): string => {
        return this.funcString;
    };

    public setFuncString = (func: string): void => {
        this.funcString = func;
        if (this.isContrainte()) {
            this.color = this.generateColor();
            this.setFunctionAffine(Constraint.funcRegExp, this.funcString);
        }
    };

    public getColor(): string {
        return this.color;
    }

    public isContrainte = (): boolean => {
        if (
            Constraint.variables &&
            Constraint.variables.x &&
            Constraint.variables.y &&
            Constraint.variables.x !== '' &&
            Constraint.variables.y !== '' &&
            Constraint.funcRegExp &&
            Constraint.funcRegExp.test(this.funcString)
        ) {
            return true;
        } else {
            return false;
        }
    };

    private setFunctionAffine(reg: RegExp, func: string) {
        let tmp = func.match(reg);
        if (tmp) {
            let tmpC: number, tmpCY: number, tmpCX: number;
            tmpCX = tmp[1] === '-' ? -1 * parseFloat(tmp[2] ? tmp[2] : '1') : parseFloat(tmp[2] ? tmp[2] : '1');
            tmpCY = tmp[4] === '-' ? -1 * parseFloat(tmp[5] ? tmp[5] : '1') : parseFloat(tmp[5] ? tmp[5] : '1');
            tmpC = tmp[11] === '-' ? -1 * parseFloat(tmp[12]) : parseFloat(tmp[12]);
            this.funcAffine = {
                x: {
                    constant: tmpCX,
                    parameter: tmp[3],
                },
                y: {
                    constant: tmpCY,
                    parameter: tmp[6],
                },
                arithOper: '+' as ArithOper,
                condiOper: tmp[7] as CondiOper,
                c: tmpC,
            };
        }
    }

    public getFuncAffine(): FunctionAffine {
        return this.funcAffine;
    }

    getGraphPoints(): Point[] {
        let points: Point[] = [];
        let tmpAffin = this.getFuncAffine();
        if (tmpAffin) {
            if (tmpAffin.x.constant === 0 && tmpAffin.y.constant === 0) {
                // throw new Error(
                //   " [ Error : Constant null ] all value is solution or not"
                // );
                console.log(' [ Error : Constant null ] all value is solution or not');
            } else if (tmpAffin.x.constant === 0) {
                points = [
                    {
                        x: Number.NEGATIVE_INFINITY,
                        y: tmpAffin.c / tmpAffin.y.constant,
                    },
                    {
                        x: Number.POSITIVE_INFINITY,
                        y: tmpAffin.c / tmpAffin.y.constant,
                    },
                ];
            } else if (tmpAffin.y.constant === 0) {
                points = [
                    {
                        x: tmpAffin.c / tmpAffin.x.constant,
                        y: Number.NEGATIVE_INFINITY,
                    },
                    {
                        x: tmpAffin.c / tmpAffin.x.constant,
                        y: Number.POSITIVE_INFINITY,
                    },
                ];
            } else {
                points.push(this.getPointByX(tmpAffin, Number.NEGATIVE_INFINITY));
                points.push(this.getPointByX(tmpAffin, Number.POSITIVE_INFINITY));
            }
        }
        return points;
    }

    getXYIntersectionPoints(): Point[] {
        let points: Point[] = [];
        let tmpAffin = this.getFuncAffine();
        if (tmpAffin.x.constant === 0 && tmpAffin.y.constant === 0) {
            // throw new Error(
            //   " [ Error : Constant null ] all value is solution or not"
            // );
            console.log(' [ Error : Constant null ] all value is solution or not');
        } else if (tmpAffin.x.constant === 0) {
            points = [
                {
                    x: 0,
                    y: tmpAffin.c / tmpAffin.y.constant,
                },
            ];
        } else if (tmpAffin.y.constant === 0) {
            points = [
                {
                    x: tmpAffin.c / tmpAffin.x.constant,
                    y: 0,
                },
            ];
        } else {
            points.push(this.getPointByX(this.getFuncAffine(), 0));
            points.push(this.getPointByY(this.getFuncAffine(), 0));
        }
        return points;
    }

    getNotSolutionsPoints(maxX: number, maxY: number): Point[] {
        let notSolution: Point[] = [];
        let points: Point[] = this.getXYIntersectionPoints();
        let possibleSolutions: Point[] = [];
        if (points.length === 1) {
            if (points[0].y >= 0 && points[0].x === 0) {
                possibleSolutions = [
                    {
                        x: 0,
                        y: maxY,
                    },
                    {
                        x: points[0].x,
                        y: points[0].y,
                    },
                    {
                        x: 0,
                        y: 0,
                    },
                    {
                        x: maxX,
                        y: 0,
                    },
                    {
                        ...this.getPointByX(this.getFuncAffine(), maxX),
                    },
                    {
                        x: maxX,
                        y: maxY,
                    },
                ];
            } else {
                possibleSolutions = [
                    {
                        x: 0,
                        y: maxY,
                    },
                    {
                        x: 0,
                        y: 0,
                    },
                    {
                        x: points[0].x,
                        y: points[0].y,
                    },
                    {
                        x: maxX,
                        y: 0,
                    },
                    {
                        x: maxX,
                        y: maxY,
                    },
                    {
                        ...this.getPointByY(this.getFuncAffine(), maxY),
                    },
                ];
            }
        } else if (points.length > 1) {
            if (points && points[0].x >= 0 && points[0].y >= 0 && points[1].x >= 0 && points[1].y >= 0) {
                possibleSolutions = [
                    {
                        x: 0,
                        y: maxY,
                    },
                    {
                        x: points[0].x,
                        y: points[0].y,
                    },
                    {
                        x: 0,
                        y: 0,
                    },
                    {
                        x: points[1].x,
                        y: points[1].y,
                    },
                    {
                        x: maxX,
                        y: 0,
                    },
                    {
                        x: maxX,
                        y: maxY,
                    },
                ];
            } else if (points[0].x >= 0 && points[0].y >= 0 && (points[1].x <= 0 || points[1].y <= 0)) {
                possibleSolutions = [
                    {
                        x: 0,
                        y: maxY,
                    },
                    {
                        x: points[0].x,
                        y: points[0].y,
                    },
                    {
                        x: 0,
                        y: 0,
                    },
                    {
                        x: maxX,
                        y: 0,
                    },
                    {
                        ...this.getPointByY(this.funcAffine, maxY),
                    },
                    {
                        x: maxX,
                        y: maxY,
                    },
                    {
                        ...this.getPointByY(this.funcAffine, maxY),
                    },
                ];
            } else if ((points[0].x <= 0 || points[0].y <= 0) && points[1].x >= 0 && points[1].y >= 0) {
                possibleSolutions = [
                    {
                        x: 0,
                        y: maxY,
                    },
                    {
                        x: 0,
                        y: 0,
                    },
                    {
                        ...this.getPointByY(this.funcAffine, 0),
                    },
                    {
                        x: maxX,
                        y: 0,
                    },
                    {
                        x: maxX,
                        y: maxY,
                    },
                    {
                        ...this.getPointByY(this.funcAffine, maxY),
                    },
                ];
            } else {
                possibleSolutions = [
                    {
                        x: 0,
                        y: maxY,
                    },
                    {
                        x: 0,
                        y: 0,
                    },
                    {
                        x: maxX,
                        y: 0,
                    },
                    {
                        x: maxX,
                        y: maxY,
                    },
                ];
            }
        }

        if (this.getFuncAffine()) {
            possibleSolutions.forEach((ps) => {
                switch (this.getFuncAffine().condiOper) {
                    case '=':
                        notSolution.push(ps);
                        break;
                    case '<=':
                        if (this.calculate(this.getFuncAffine(), ps.x, ps.y) >= this.getFuncAffine().c) {
                            notSolution.push(ps);
                        }
                        break;
                    case '>=':
                        if (this.calculate(this.getFuncAffine(), ps.x, ps.y) <= this.getFuncAffine().c) {
                            notSolution.push(ps);
                        }
                        break;
                }
            });
        }
        return notSolution;
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
        return tmpPoint;
    }

    private calculate(func: FunctionAffine, x: number, y: number): number {
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

    generateColor = (): string => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return '#' + randomColor;
    };

    getPossibleSolution(possibleSolutions: Point[]): Point[] {
        let tmpSolution: Point[] = [];
        let AllPossibleSolutions = possibleSolutions.concat(this.getXYIntersectionPoints());
        if (this.getFuncAffine()) {
            AllPossibleSolutions.forEach((ps) => {
                switch (this.getFuncAffine().condiOper) {
                    case '=':
                        if (this.calculate(this.getFuncAffine(), ps.x, ps.y) === this.getFuncAffine().c) {
                            tmpSolution.push(ps);
                        }
                        break;
                    case '<=':
                        if (ps.x === 0 && ps.y === 2.5) {
                            console.log(' log func 0 2.5 ', this.getFuncAffine());
                        }
                        if (this.calculate(this.getFuncAffine(), ps.x, ps.y) <= this.getFuncAffine().c) {
                            if (ps.x === 0 && ps.y === 2.5) {
                                console.log(' Result', this.calculate(this.getFuncAffine(), ps.x, ps.y), 'c', this.getFuncAffine().c);
                            }
                            tmpSolution.push(ps);
                        }
                        break;
                    case '>=':
                        if (this.calculate(this.getFuncAffine(), ps.x, ps.y) >= this.getFuncAffine().c) {
                            tmpSolution.push(ps);
                        }
                        break;
                }
            });
        }
        return tmpSolution;
    }

    getPossibleStrictSolution(possibleSolutions: Point[]): Point[] {
        let tmpSolution: Point[] = [];
        let AllPossibleSolutions = possibleSolutions;
        if (this.getFuncAffine()) {
            AllPossibleSolutions.forEach((ps) => {
                switch (this.getFuncAffine().condiOper) {
                    case '=':
                        if (this.calculate(this.getFuncAffine(), ps.x, ps.y) === this.getFuncAffine().c) {
                            tmpSolution.push(ps);
                        }
                        break;
                    case '<=':
                        if (ps.x === 0 && ps.y === 2.5) {
                            console.log(' log func 0 2.5 ', this.getFuncAffine());
                        }
                        if (this.calculate(this.getFuncAffine(), ps.x, ps.y) <= this.getFuncAffine().c) {
                            if (ps.x === 0 && ps.y === 2.5) {
                                console.log(' Result', this.calculate(this.getFuncAffine(), ps.x, ps.y), 'c', this.getFuncAffine().c);
                            }
                            tmpSolution.push(ps);
                        }
                        break;
                    case '>=':
                        if (this.calculate(this.getFuncAffine(), ps.x, ps.y) >= this.getFuncAffine().c) {
                            tmpSolution.push(ps);
                        }
                        break;
                }
            });
        }
        return tmpSolution;
    }

    getIntersectionWith(c2: Constraint): Point | null {
        if (c2.isContrainte() && this.isContrainte()) {
            let point: Point = {
                x: 0,
                y: 0,
            };
            let f1 = this.getFuncAffine();
            let f2 = c2.getFuncAffine();
            let numY = f2.c * f1.x.constant - f2.x.constant * f1.c;
            console.log('numY', numY);

            let denY = -1 * f2.x.constant * f1.y.constant + f1.x.constant * f2.y.constant;
            console.log('denY', denY);
            if ((numY === 0 && denY === 0) || denY === 0) {
                return null;
            } else {
                point.y = numY / denY;
                let numX = f1.c - f1.y.constant * point.y;
                console.log('numX', numX);
                let denX = f1.x.constant;
                console.log('denX', denX);
                if ((numX === 0 && denX === 0) || denX === 0) {
                    return null;
                } else {
                    point.x = numX / denX;
                    return point;
                }
            }
        }
        return null;
    }
}
