import { User } from './user.model';
import { SavingsPlan } from './savingsplan.model';

export interface PlanApplication {
    planApplicationId?: number;
    amountRequired: number;
    status: string;
    user?: User;
    savingsPlan?: SavingsPlan;
}

