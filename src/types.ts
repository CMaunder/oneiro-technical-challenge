export type LoanDetails = {
  startDate: Date;
  endDate: Date;
  loanAmount: number;
  loanCurrency: string;
  baseInterestRate: number;
  margin: number;
  totalInterestRate: number;
};

export type DailyInterestRecord = {
  interestExcludingMargin: number;
  interest: number;
  accrualDate: string;
  daysSinceLoanStart: number;
  cumulativeInterestToDate: number;
};
