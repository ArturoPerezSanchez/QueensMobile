export type TangoSymbol = 0 | 1;
export type TangoCell = TangoSymbol | null;
export type TangoDirection = 'horizontal' | 'vertical';
export type TangoRelation = 'same' | 'different';

export type TangoConstraint = {
  row: number;
  col: number;
  direction: TangoDirection;
  relation: TangoRelation;
};

export type TangoResponse = {
  board_size: number;
  board: TangoCell[][];
  constraints: TangoConstraint[];
  solution: TangoSymbol[][] | null;
};

export type TangoPuzzle = {
  size: number;
  board: TangoCell[][];
  constraints: TangoConstraint[];
  solution: TangoSymbol[][];
};

export type TangoViolationKind = 'balance' | 'triple' | 'relation';

export type TangoStatus = {
  isSolved: boolean;
  filledCount: number;
  conflicts: Set<string>;
  violations: Record<TangoViolationKind, number>;
};

export type TangoPreferences = {
  haptics: boolean;
};
