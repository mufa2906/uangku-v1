// src/lib/transaction-nlp.ts
// Natural Language Processing utilities for transaction extraction

export interface ParsedTransaction {
  amount?: number;
  description?: string;
  category?: string; // Will be matched against existing categories
  wallet?: string; // Will be matched against existing wallets
  type?: 'income' | 'expense'; // Will be inferred from context
  confidence: number; // 0-1 confidence score
}

// Common Indonesian expense categories with variations
const expenseCategoryPatterns: { [key: string]: string[] } = {
  'Food': ['makan', 'makanan', 'restoran', 'warung', 'nasi', 'bubur', 'gado', 'sate', 'rendang', 'padang', 'bakso', 'mie', 'soto', 'kopi', 'koffie', 'teh', 'minum', 'minuman'],
  'Transportation': ['transport', 'angkot', 'ojek', 'grab', 'gojek', 'bensin', 'bensol', 'bensin', 'mobil', 'kendaraan', 'bensin', 'transpor'],
  'Shopping': ['belanja', 'toko', 'mall', 'minimarket', 'indomaret', 'alfamart', 'beli', 'pakaian', 'barang'],
  'Utilities': ['listrik', 'air', 'telpon', 'pulsa', 'wifi', 'internet', 'tagihan'],
  'Healthcare': ['dokter', 'obat', 'farmasi', 'apotek', 'kesehatan', 'rumah sakit', 'rs'],
  'Entertainment': ['hiburan', 'bioskop', 'game', 'konser', 'tiket', 'nonton', 'karoke', 'karaoke'],
  'Education': ['sekolah', 'kuliah', 'buku', 'pendidikan', 'kursus', 'les'],
  'Housing': ['kontrakan', 'sewa', 'rumah', 'tempat tinggal', 'penginapan'],
  'Personal Care': ['spa', 'salon', 'kecantikan', 'perawatan', 'kosmetik'],
  'Other': ['lain', 'lainnya', 'misc', 'serba']
};

// Common Indonesian income categories with variations
const incomeCategoryPatterns: { [key: string]: string[] } = {
  'Salary': ['gaji', 'upah', 'penghasilan', 'pendapatan'],
  'Gift': ['hadiah', 'rejeki', 'bonus'],
  'Investment': ['dividen', 'bunga', 'investasi'],
  'Other': ['lain', 'lainnya', 'misc', 'serba']
};

// Regex patterns for amount extraction
const AMOUNT_PATTERNS = [
  /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g, // Standard decimal format
  /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g, // Indonesian format (1.000,75)
  /(\d+)/g, // Simple number extraction  
];

// Common Indonesian transaction phrases
const TRANSPORT_PATTERNS = [
  /naik (.*?) (\d+)/,
  /angkot (\d+)/,
  /ojek (\d+)/,
  /grab (\d+)/,
  /gojek (\d+)/,
];

const FOOD_PATTERNS = [
  /makan (.*?) (\d+)/,
  /beli (.*?) (\d+)/,
  /(.*?) (?:harga|seharga) (\d+)/,
];

export class TransactionNLP {
  /**
   * Parse a natural language transaction description
   * @param text Natural language description (e.g., "ate nasi padang for 35000")
   * @param availableCategories List of available categories for matching
   * @param availableWallets List of available wallets for matching
   * @returns Parsed transaction data with confidence score
   */
  static parseTransaction(
    text: string,
    availableCategories: { id: string; name: string; type: 'income' | 'expense' }[] = [],
    availableWallets: { id: string; name: string }[] = []
  ): ParsedTransaction {
    const lowerText = text.toLowerCase().trim();
    const result: ParsedTransaction = { confidence: 0 };

    // Extract amount
    const amount = this.extractAmount(lowerText);
    if (amount) {
      result.amount = amount;
      result.confidence += 0.2; // Amount extraction contributes to confidence
    }

    // Extract category
    const { category, type } = this.extractCategory(lowerText, availableCategories);
    if (category) {
      result.category = category;
      result.confidence += 0.3; // Category matching contributes to confidence
    }
    if (type) {
      result.type = type;
    }

    // Extract description (what remains after other elements are identified)
    const description = this.extractDescription(lowerText, result.amount, availableCategories);
    if (description) {
      result.description = description;
      result.confidence += 0.2; // Description helps context
    }

    // Additional processing for Indonesian patterns
    const indonesianResult = this.processIndonesianPatterns(lowerText);
    if (indonesianResult) {
      if (indonesianResult.amount && !result.amount) {
        result.amount = indonesianResult.amount;
        result.confidence += 0.2;
      }
      if (indonesianResult.description && !result.description) {
        result.description = indonesianResult.description;
        result.confidence += 0.1;
      }
      if (indonesianResult.category && !result.category) {
        result.category = indonesianResult.category;
        result.confidence += 0.2;
      }
    }

    // Calculate more nuanced confidence based on multiple factors
    let baseConfidence = 0;
    
    // Amount detection adds confidence
    if (result.amount !== undefined) {
      baseConfidence += 0.3;
    }
    
    // Category detection adds confidence
    if (result.category) {
      baseConfidence += 0.3;
    }
    
    // Description adds confidence
    if (result.description) {
      baseConfidence += 0.2;
    }
    
    // Type detection adds confidence
    if (result.type) {
      baseConfidence += 0.2;
    }
    
    // If all elements are detected, add bonus
    if (result.amount !== undefined && result.category && result.description && result.type) {
      baseConfidence += 0.1; // 10% bonus for complete transaction
    }
    
    result.confidence = Math.min(baseConfidence, 1);

    return result;
  }

  /**
   * Extract amount from text using regex patterns
   */
  private static extractAmount(text: string): number | null {
    // Try various patterns to capture amounts
    for (const pattern of AMOUNT_PATTERNS) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Find the most likely amount (usually the largest number)
        const amounts = matches.map(match => {
          // Handle Indonesian format (1.000,75)
          let cleanMatch = match.replace(/[^\d,]/g, '');
          if (cleanMatch.includes(',')) {
            cleanMatch = cleanMatch.replace(/\./g, '').replace(',', '.');
          }
          
          const num = parseFloat(cleanMatch);
          return !isNaN(num) ? num : 0;
        });
        
        // Return the largest reasonable amount (not likely to be a date or year)
        const validAmounts = amounts.filter(amt => amt > 0 && amt < 1000000000); // Less than 1 billion
        if (validAmounts.length > 0) {
          return Math.max(...validAmounts);
        }
      }
    }
    
    return null;
  }

  /**
   * Extract category based on pattern matching
   */
  private static extractCategory(
    text: string,
    availableCategories: { id: string; name: string; type: 'income' | 'expense' }[]
  ): { category: string | null; type: 'income' | 'expense' | null } {
    // First check against user's categories
    for (const cat of availableCategories) {
      if (text.includes(cat.name.toLowerCase())) {
        return { category: cat.name, type: cat.type };
      }
    }

    // Then check against common patterns
    for (const [standardCat, patterns] of Object.entries(expenseCategoryPatterns)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          return { category: standardCat, type: 'expense' };
        }
      }
    }

    for (const [standardCat, patterns] of Object.entries(incomeCategoryPatterns)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          return { category: standardCat, type: 'income' };
        }
      }
    }

    return { category: null, type: null };
  }

  /**
   * Extract description from remaining text
   */
  private static extractDescription(text: string, amount: number | undefined, availableCategories: any[]): string | null {
    let description = text;
    
    // Remove common transaction words
    const transactionWords = ['for', 'seharga', 'harga', 'untuk', 'ke', 'to', 'dari', 'from', 'di', 'at', 'in', 'pada'];
    for (const word of transactionWords) {
      description = description.replace(new RegExp(`\\b${word}\\b`, 'g'), '').trim();
    }
    
    // Remove amount if it was extracted
    if (amount) {
      description = description.replace(new RegExp(`\\b${amount.toLocaleString('id-ID')}\\b`, 'g'), '').trim();
    }
    
    // Remove category matches
    for (const cat of availableCategories) {
      description = description.replace(new RegExp(`\\b${cat.name.toLowerCase()}\\b`, 'g'), '').trim();
    }
    
    // Remove common Indonesian category patterns
    for (const patterns of Object.values(expenseCategoryPatterns)) {
      for (const pattern of patterns) {
        description = description.replace(new RegExp(`\\b${pattern}\\b`, 'g'), '').trim();
      }
    }
    
    for (const patterns of Object.values(incomeCategoryPatterns)) {
      for (const pattern of patterns) {
        description = description.replace(new RegExp(`\\b${pattern}\\b`, 'g'), '').trim();
      }
    }
    
    // Clean up extra spaces
    description = description.replace(/\s+/g, ' ').trim();
    
    return description || null;
  }

  /**
   * Process common Indonesian transaction patterns
   */
  private static processIndonesianPatterns(text: string): Partial<ParsedTransaction> | null {
    // Transport patterns
    for (const pattern of TRANSPORT_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const description = match[1] || 'Transportation';
        const amountStr = match[2];
        const amount = parseFloat(amountStr.replace(/[^\d]/g, ''));
        
        return {
          description,
          amount: isNaN(amount) ? undefined : amount,
          category: 'Transportation',
          type: 'expense'
        };
      }
    }

    // Food patterns
    for (const pattern of FOOD_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const description = match[1] || 'Food';
        const amountStr = match[2];
        const amount = parseFloat(amountStr.replace(/[^\d]/g, ''));
        
        return {
          description,
          amount: isNaN(amount) ? undefined : amount,
          category: 'Food',
          type: 'expense'
        };
      }
    }

    return null;
  }
}

// Export helper functions for common use cases
export const parseIndonesianTransaction = (
  text: string,
  categories: { id: string; name: string; type: 'income' | 'expense' }[] = [],
  wallets: { id: string; name: string }[] = []
): ParsedTransaction => {
  return TransactionNLP.parseTransaction(text, categories, wallets);
};