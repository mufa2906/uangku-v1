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

// Regex patterns for amount extraction - prioritize larger numbers first
const AMOUNT_PATTERNS = [
  /(?:^|\s)(\d{5,})(?=\s|$)/g,  // 5+ digit numbers (like 23000)
  /(?:^|\s)(\d{4})(?=\s|$)/g,   // 4 digit numbers (like 5000)
  /(?:^|\s)(\d{3})(?=\s|$)/g,   // 3 digit numbers (like 500)
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
  /food (.*?) (\d+)/,
  /(.*?) (?:harga|seharga) (\d+)/,
];

// Enhanced patterns to detect "category description amount" format
const GENERAL_PATTERNS = [
  /(makan|beli|food)\s+(.*?)\s+(\d{3,})/,  // Basic food/buy patterns like "makan sop sapi 23000"
  /(makan|beli|food|transport|isi pulsa|pulsa|listrik|air|telpon|sewa|kontrakan|sop|nasi|bakso|mie|soto|rendang|padang|gudeg|gulai|ayam|ikan|telur|sayur|buah|kopi|koffie|teh|minum|minuman|jajan|snack|mie ayam|sate|sate padang|nasi uduk|nasi kuning|pecel|gado|gorengan|cemilan)\s+(.*?)\s+(\d{3,})/,  // category description amount (for all amounts)
  /(\w+)\s+((?:\S+\s*)*?)\s+(\d{3,})/,  // more generic pattern to catch all combinations
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
    
    // FIRST: Check for Indonesian transaction patterns to preserve description words
    const indonesianMatch = lowerText.match(/^(makan|beli|food|transport|isi\spulsa|pulsa|listrik|air|telpon|sewa|kontrakan)\s+(.+?)(?:\s+(\d+))?$/);
    let indonesianResult: Partial<ParsedTransaction> | null = null;
    
    if (indonesianMatch) {
      const categoryWord = indonesianMatch[1];
      const possibleDescription = indonesianMatch[2].trim();
      const possibleAmount = indonesianMatch[3] ? parseFloat(indonesianMatch[3]) : undefined;
      
      // Determine category based on the action word
      let category = 'Other';
      let type: 'income' | 'expense' = 'expense';
      
      for (const [standardCat, patterns] of Object.entries(expenseCategoryPatterns)) {
        if (patterns.some(p => categoryWord.includes(p))) {
          category = standardCat;
          break;
        }
      }
      
      for (const [standardCat, patterns] of Object.entries(incomeCategoryPatterns)) {
        if (patterns.some(p => categoryWord.includes(p))) {
          category = standardCat;
          type = 'income';
          break;
        }
      }
      
      indonesianResult = {
        description: possibleDescription,
        amount: possibleAmount,
        category,
        type,
        confidence: 0.8 // High confidence since it matches our pattern
      };
    }
    
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

    // Use the early-detected Indonesian result if available
    if (indonesianResult) {
      if (indonesianResult.amount) {
        result.amount = indonesianResult.amount;
        result.confidence = Math.max(result.confidence, 0.4);
      }
      if (indonesianResult.description) {
        result.description = indonesianResult.description;
        result.confidence = Math.max(result.confidence, 0.3);
      }
      if (indonesianResult.category) {
        result.category = indonesianResult.category;
        result.confidence = Math.max(result.confidence, 0.4);
      }
      if (indonesianResult.type) {
        result.type = indonesianResult.type;
        result.confidence = Math.max(result.confidence, 0.3);
      }
    }
    
    // Extract amount (if not already set by Indonesian pattern)
    if (!result.amount) {
      const amount = this.extractAmount(lowerText);
      if (amount) {
        result.amount = amount;
        result.confidence += 0.2; // Amount extraction contributes to confidence
      }
    }
    
    // Extract category (if not already set by Indonesian pattern)
    if (!result.category) {
      const { category, type } = this.extractCategory(lowerText, availableCategories);
      if (category) {
        result.category = category;
        result.confidence += 0.3; // Category matching contributes to confidence
      }
      if (type) {
        result.type = type;
      }
    }
    
    // Extract description (if not already set by Indonesian pattern)
    if (!result.description) {
      const description = this.extractDescription(lowerText, result.amount, availableCategories);
      if (description) {
        result.description = description;
        result.confidence += 0.2; // Description helps context
      }
    }
    
    // Additional processing for Indonesian patterns (for patterns our early detection might have missed)
    const additionalIndonesianResult = this.processIndonesianPatterns(lowerText);
    if (additionalIndonesianResult) {
      if (additionalIndonesianResult.amount && !result.amount) {
        result.amount = additionalIndonesianResult.amount;
        result.confidence += 0.2;
      }
      if (additionalIndonesianResult.description && !result.description) {
        result.description = additionalIndonesianResult.description;
        result.confidence += 0.1;
      }
      if (additionalIndonesianResult.category && !result.category) {
        result.category = additionalIndonesianResult.category;
        result.confidence += 0.2;
      }
    }
    
    // Post-process: Ensure amount is not in description if both are present
    if (result.amount && result.description && result.description.toString().includes(result.amount.toString())) {
      // Remove the amount from the description
      const amountStr = result.amount.toString();
      let description = result.description.toString();
      description = description.replace(new RegExp(`\\b${amountStr}\\b`, 'g'), '').trim();
      // Clean up any extra spaces
      description = description.replace(/\s+/g, ' ').trim();
      result.description = description || undefined;
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

    // General patterns for "category description amount" format
    for (const pattern of GENERAL_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const categoryWord = match[1].toLowerCase();
        let description = match[2] || categoryWord;
        const amountStr = match[3];
        const amount = parseFloat(amountStr.replace(/[^\\d]/g, ''));
        
        // Extract the specific food item from description if category word is generic
        if (categoryWord === 'makan' || categoryWord === 'food' || expenseCategoryPatterns['Food'].includes(categoryWord)) {
          // Look for food items in the description
          const words = description.split(' ');
          for (const word of words) {
            for (const [standardCat, patterns] of Object.entries(expenseCategoryPatterns)) {
              for (const pattern of patterns) {
                if (word.toLowerCase().includes(pattern) && standardCat === 'Food') {
                  description = word;
                  break;
                }
              }
            }
          }
        }
        
        // Map category word to standard category
        let category = 'Other';
        let type: 'income' | 'expense' = 'expense';
        
        // Check if it matches food categories
        for (const [standardCat, patterns] of Object.entries(expenseCategoryPatterns)) {
          for (const pattern of patterns) {
            if (categoryWord.includes(pattern)) {
              category = standardCat;
              break;
            }
          }
        }
        
        // Check if it matches income categories
        for (const [standardCat, patterns] of Object.entries(incomeCategoryPatterns)) {
          for (const pattern of patterns) {
            if (categoryWord.includes(pattern)) {
              category = standardCat;
              type = 'income';
              break;
            }
          }
        }
        
        // If description still contains the amount, remove it
        const amountStrClean = amountStr.replace(/[^\\d]/g, '');
        if (description.includes(amountStrClean)) {
          description = description.replace(new RegExp(`\\b${amountStrClean}\\b`, 'g'), '').trim();
          // Clean up any extra spaces
          description = description.replace(/\s+/g, ' ').trim();
        }
        
        return {
          description: description.trim(),
          amount: isNaN(amount) ? undefined : amount,
          category,
          type
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