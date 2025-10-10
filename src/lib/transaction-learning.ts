// src/lib/transaction-learning.ts
// Transaction pattern learning and storage utility

export interface TransactionPattern {
  inputText: string;
  detectedAmount: number | null;
  detectedCategory: string | null;
  detectedDescription: string | null;
  actualAmount: number;
  actualCategory: string;
  actualDescription: string;
  timestamp: number;
  confidence: number;
}

export interface LearningStorage {
  patterns: TransactionPattern[];
}

const STORAGE_KEY = 'uangku_transaction_patterns';

export class TransactionLearning {
  /**
   * Store a new transaction pattern for learning
   */
  static storePattern(pattern: Omit<TransactionPattern, 'timestamp'>): void {
    try {
      const existingData = this.getStoredPatterns();
      const newPattern: TransactionPattern = {
        ...pattern,
        timestamp: Date.now()
      };
      
      // Add the new pattern
      existingData.patterns.push(newPattern);
      
      // Keep only the last 100 patterns to prevent storage bloat
      if (existingData.patterns.length > 100) {
        existingData.patterns = existingData.patterns.slice(-100);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    } catch (error) {
      console.error('Error storing transaction pattern:', error);
    }
  }

  /**
   * Get all stored transaction patterns
   */
  static getStoredPatterns(): LearningStorage {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error retrieving transaction patterns:', error);
    }
    
    return { patterns: [] };
  }

  /**
   * Get pattern suggestions based on user's history
   */
  static getSuggestions(inputPrefix: string = ''): string[] {
    const patterns = this.getStoredPatterns().patterns;
    
    // Group by common patterns
    const suggestionMap = new Map<string, number>();
    
    for (const pattern of patterns) {
      // Create a template from the pattern
      const template = this.createTemplate(pattern.inputText, pattern.actualAmount);
      
      if (template) {
        const count = suggestionMap.get(template) || 0;
        suggestionMap.set(template, count + 1);
      }
    }
    
    // Sort by frequency and return top suggestions
    const sortedSuggestions = Array.from(suggestionMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([template]) => template);
    
    // Filter based on input prefix if provided
    if (inputPrefix) {
      return sortedSuggestions
        .filter(suggestion => suggestion.toLowerCase().includes(inputPrefix.toLowerCase()))
        .slice(0, 5); // Return top 5 matches
    }
    
    return sortedSuggestions.slice(0, 10); // Return top 10 suggestions
  }

  /**
   * Create a template from transaction text by replacing amounts with placeholders
   */
  private static createTemplate(inputText: string, amount: number): string | null {
    if (!amount) return null;
    
    // Replace the amount with a placeholder
    const regex = new RegExp(`\\b${amount.toLocaleString('id-ID')}\\b`, 'g');
    const template = inputText.replace(regex, '{amount}');
    
    // Also try replacing without formatting
    const regex2 = new RegExp(`\\b${amount}\\b`, 'g');
    return template.replace(regex2, '{amount}');
  }

  /**
   * Get category suggestions based on user's history
   */
  static getCategorySuggestions(inputText: string): { category: string; confidence: number }[] {
    const patterns = this.getStoredPatterns().patterns;
    const categoryMap = new Map<string, { count: number; totalConfidence: number }>();
    
    for (const pattern of patterns) {
      if (pattern.actualCategory) {
        const existing = categoryMap.get(pattern.actualCategory) || { count: 0, totalConfidence: 0 };
        categoryMap.set(pattern.actualCategory, {
          count: existing.count + 1,
          totalConfidence: existing.totalConfidence + (pattern.confidence || 0)
        });
      }
    }
    
    // Calculate average confidence and sort by frequency
    const categorySuggestions = Array.from(categoryMap.entries())
      .map(([category, { count, totalConfidence }]) => ({
        category,
        confidence: totalConfidence / count
      }))
      .sort((a, b) => b.confidence - a.confidence);
    
    return categorySuggestions.slice(0, 5); // Top 5 categories
  }

  /**
   * Get amount suggestions based on user's history for similar descriptions
   */
  static getAmountSuggestions(description: string): number[] {
    const patterns = this.getStoredPatterns().patterns;
    const amountSuggestions: number[] = [];
    
    for (const pattern of patterns) {
      if (pattern.actualDescription && 
          pattern.actualDescription.toLowerCase().includes(description.toLowerCase()) &&
          pattern.actualAmount) {
        amountSuggestions.push(pattern.actualAmount);
      }
    }
    
    // Return unique amounts, most frequent first
    const amountCount = new Map<number, number>();
    for (const amount of amountSuggestions) {
      amountCount.set(amount, (amountCount.get(amount) || 0) + 1);
    }
    
    return Array.from(amountCount.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .map(([amount]) => amount)
      .slice(0, 3); // Top 3 amounts
  }

  /**
   * Clear all stored patterns (for debugging/privacy)
   */
  static clearPatterns(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing transaction patterns:', error);
    }
  }
}