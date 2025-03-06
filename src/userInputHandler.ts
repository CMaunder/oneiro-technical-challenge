import * as readline from "readline";
import { generateLoanOutput } from "./loanInterestCalculator.js";
import { LoanDetails, DailyInterestRecord } from "./types.js";

type HistoryItem = {
  id: string;
  resultOutput: DailyInterestRecord[];
};

const resultHistory: HistoryItem[] = [];

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

function parseDate(dateStr: string): Date | null {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return null;

  const date = new Date(dateStr);
  return isNaN(date.getTime()) || dateStr !== date.toISOString().split("T")[0]
    ? null
    : date;
}

async function getHistoryItemByIdPrompt(): Promise<HistoryItem | undefined> {
  const id = await askQuestion(
    "Input the ID of the loan interest calculation record:"
  );
  const historyItem = resultHistory.find((item) => item.id === id);
  if (historyItem) {
    return historyItem;
  } else {
    console.log(`No history found for ID: ${id}`);
  }
}

export async function promptUserMenu(): Promise<void> {
  const menuOptionSelected = await askQuestion(
    "What would you like to do?\n1) Start a new loan calculation.\n2) View an existing loan calculation.\n3) Modify an existing loan calculation.\n4) Exit the program.\n"
  );
  switch (menuOptionSelected) {
    case "1":
      console.log("Option 1 selected");
      const loanDetails: LoanDetails = await getLoanDetails();
      const output: DailyInterestRecord[] = await generateLoanOutput(
        loanDetails
      );
      const id = (resultHistory.length + 1).toString();
      console.log(output);
      console.log(`Saving loan calculation record with ID: ${id}`);
      resultHistory.push({
        id: (resultHistory.length + 1).toString(),
        resultOutput: output,
      });
      break;
    case "2":
      console.log("Option 2 selected");
      const historyItemToView = await getHistoryItemByIdPrompt();
      if (historyItemToView) {
        console.dir(historyItemToView, { depth: null });
      }
      break;
    case "3":
      console.log("Option 3 selected");
      const historyItemToEdit = await getHistoryItemByIdPrompt();
      if (!historyItemToEdit) {
        break;
      }
      const loanDetailsToEdit: LoanDetails = await getLoanDetails();
      const newOutput: DailyInterestRecord[] = await generateLoanOutput(
        loanDetailsToEdit
      );
      console.log(newOutput);
      const indexToUpdate = resultHistory.findIndex(
        (item) => item.id === historyItemToEdit.id
      );
      if (indexToUpdate !== -1 && resultHistory[indexToUpdate]) {
        resultHistory[indexToUpdate].resultOutput = newOutput;
      }
      break;
    case "4":
      console.log("Option 4 selected");
      rl.close();
      process.exit(1);
    default:
      console.log("Invalid option selected");
      promptUserMenu();
      return;
  }
  promptUserMenu();
}

export async function getLoanDetails(): Promise<LoanDetails> {
  try {
    const startDateStr = await askQuestion("Enter Start Date (YYYY-MM-DD): ");
    const startDate = parseDate(startDateStr);
    if (!startDate) {
      console.error("Invalid start date format! Please try again.");
      return await getLoanDetails();
    }

    const endDateStr = await askQuestion("Enter End Date (YYYY-MM-DD): ");
    const endDate = parseDate(endDateStr);
    if (!endDate || endDate < startDate) {
      console.error(
        "Invalid end date format or end date is before start date! Please try again."
      );
      return await getLoanDetails();
    }

    const loanAmountStr = await askQuestion("Enter Loan Amount: ");
    const loanCurrency = await askQuestion("Enter Loan Currency: ");
    const baseInterestRatePercentageStr = await askQuestion(
      "Enter Base Interest Rate (%): "
    );
    const marginPercentageStr = await askQuestion("Enter Margin (%): ");
    const loanAmount = parseFloat(loanAmountStr);
    const baseInterestRate = parseFloat(baseInterestRatePercentageStr) / 100;
    const margin = parseFloat(marginPercentageStr) / 100;

    if (isNaN(loanAmount) || isNaN(baseInterestRate) || isNaN(margin)) {
      console.error(
        "Error: Loan amount, interest rate, and margin must be valid numbers. Please try again."
      );
      return await getLoanDetails();
    }

    const totalInterestRate = baseInterestRate + margin;

    const loanDetails: LoanDetails = {
      startDate,
      endDate,
      loanAmount,
      loanCurrency,
      baseInterestRate,
      margin,
      totalInterestRate,
    };

    console.log("Loan Details:", loanDetails);
    return loanDetails;
  } catch (error) {
    console.error("Error getting loan details:", error);
    rl.close();
    process.exit(1);
  }
}
