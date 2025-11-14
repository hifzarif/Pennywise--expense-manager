import {
  type LucideIcon,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  HeartPulse,
  Film,
  CircleDollarSign,
  Briefcase,
  Gift,
  Lightbulb,
  PiggyBank,
} from 'lucide-react';

export const getCategoryIcon = (category: string): LucideIcon => {
  switch (category) {
    // Expenses
    case 'Food':
      return Utensils;
    case 'Shopping':
      return ShoppingBag;
    case 'Transport':
      return Car;
    case 'Housing':
      return Home;
    case 'Health':
      return HeartPulse;
    case 'Entertainment':
      return Film;
    // Incomes
    case 'Salary':
      return Briefcase;
    case 'Freelance':
      return CircleDollarSign;
    case 'Investment':
        return PiggyBank;
    case 'Gift':
      return Gift;
    default:
      return Lightbulb;
  }
};
