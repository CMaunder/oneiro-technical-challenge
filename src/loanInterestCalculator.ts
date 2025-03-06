import { DAYS_IN_YEAR } from "./constants.js";
import { LoanDetails, DailyInterestRecord } from "./types.js";

function simpleDailyInterest(loanAmount: number, annualInterestRate: number) {
  const dailyInterestRate = annualInterestRate / DAYS_IN_YEAR;
  return dailyInterestRate * loanAmount;
}

export async function generateLoanOutput(
  loanDetails: LoanDetails
): Promise<DailyInterestRecord[]> {
  const {
    startDate,
    endDate,
    loanAmount,
    baseInterestRate,
    totalInterestRate,
  } = loanDetails;

  const numberOfDaysLoaned = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const dailyInterestRecords: DailyInterestRecord[] = [];

  for (let elapsedDays = 0; elapsedDays <= numberOfDaysLoaned; elapsedDays++) {
    const accrualDate = new Date(startDate);
    accrualDate.setDate(startDate.getDate() + elapsedDays);
    const formattedAccrualDate = accrualDate.toISOString().split("T")[0];
    if (!formattedAccrualDate) {
      throw Error(
        "Formatted accural date cannot be undefined. Something went wrong."
      );
    }
    const interestExcludingMargin = simpleDailyInterest(
      loanAmount,
      baseInterestRate
    );

    const interest = simpleDailyInterest(loanAmount, totalInterestRate);

    const cumulativeInterestToDate = interest * (elapsedDays + 1);
    dailyInterestRecords.push({
      interestExcludingMargin,
      interest,
      accrualDate: formattedAccrualDate,
      daysSinceLoanStart: elapsedDays,
      cumulativeInterestToDate,
    });
  }
  return dailyInterestRecords;
}
