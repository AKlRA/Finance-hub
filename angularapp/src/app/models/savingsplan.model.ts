export interface SavingsPlan {
    savingsPlanId?: number;
    name:string;
    goalAmount: number;
    timeFrame: number;
    riskLevel:'Low'|'Medium'|'High';
    description:string;
    status:string;
    interestRate?: number;      
  installmentAmount?: number;  
}

