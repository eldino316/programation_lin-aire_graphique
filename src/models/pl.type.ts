export type Point = {
  x: number;
  y: number;
};

export type Variables = {
  x: string;
  y: string;
};

export enum ArithOper {
  PLUS = "+",
  MINUS = "-",
}

export enum CondiOper {
  EQUAL = "=",
  INFOREQUAL = "<=",
  SUPOREQUAL = ">=",
}

export enum Optimize {
  MIN = "MIN",
  MAX = "MAX",
}

export type Operand = {
  constant: number;
  parameter: string;
};

export type FunctionAffine = {
  x: Operand; //x
  y: Operand; //y
  arithOper: ArithOper; // arithmeticOperator
  condiOper: CondiOper; // conditionalOperator
  c: number; //constant
};
