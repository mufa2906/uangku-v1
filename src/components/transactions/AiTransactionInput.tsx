// src/components/transactions/AiTransactionInput.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ParsedTransaction, parseIndonesianTransaction } from '@/lib/transaction-nlp';
import { Category, Wallet } from '@/types';
import { Sparkles } from 'lucide-react';

interface AiTransactionInputProps {
  categories: Category[];
  wallets: Wallet[];
  onTransactionParsed: (transaction: ParsedTransaction) => void;
  onUseParsedTransaction: (transaction: ParsedTransaction) => void;
}

export default function AiTransactionInput({ 
  categories, 
  wallets, 
  onTransactionParsed, 
  onUseParsedTransaction 
}: AiTransactionInputProps) {
  const [inputText, setInputText] = useState('');
  const [parsedTransaction, setParsedTransaction] = useState<ParsedTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Example suggestions for Indonesian users
  useEffect(() => {
    setSuggestions([
      'makan nasi gudeg 25000',
      'isi pulsa 50000', 
      'beli buku 125000',
      'naik grab ke mall 35000',
      'belanja bulanan 450000',
      'bayar listrik 250000'
    ]);
  }, []);

  const handleParse = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    
    // Simulate processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = parseIndonesianTransaction(
      inputText, 
      categories.map(c => ({ id: c.id, name: c.name, type: c.type })),
      wallets.map(w => ({ id: w.id, name: w.name }))
    );
    
    setParsedTransaction(result);
    onTransactionParsed(result);
    setIsLoading(false);
    
    if (result.confidence > 0.3) { // Lower threshold to allow more transactions to be reviewed
      setShowConfirmation(true);
    }
  };

  const handleUseTransaction = () => {
    if (parsedTransaction) {
      onUseParsedTransaction(parsedTransaction);
      setShowConfirmation(false);
      setInputText('');
      setParsedTransaction(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-blue-500" />
        <Label htmlFor="ai-transaction-input">AI Transaction Entry</Label>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="ai-transaction-input"
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type transaction in natural language (e.g., 'ate nasi padang for 35000')"
          className="flex-1"
        />
        <Button 
          onClick={handleParse} 
          disabled={isLoading || !inputText.trim()}
          variant="outline"
        >
          {isLoading ? 'Analyzing...' : 'Parse'}
        </Button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transaction Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Description:</span>
              <span className="col-span-3">
                {parsedTransaction?.description || 'Not detected'}
              </span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Amount:</span>
              <span className="col-span-3">
                {parsedTransaction?.amount ? `Rp ${parsedTransaction.amount.toLocaleString('id-ID')}` : 'Not detected'}
              </span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Category:</span>
              <span className="col-span-3">
                {parsedTransaction?.category || 'Not detected'}
              </span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Type:</span>
              <span className="col-span-3">
                {parsedTransaction?.type ? 
                  <Badge variant={parsedTransaction.type === 'income' ? 'default' : 'secondary'}>
                    {parsedTransaction.type}
                  </Badge> 
                  : 'Not detected'
                }
              </span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Confidence:</span>
              <div className="col-span-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      parsedTransaction?.confidence && parsedTransaction.confidence > 0.7 
                        ? 'bg-green-500' 
                        : parsedTransaction?.confidence && parsedTransaction.confidence > 0.4 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${(parsedTransaction?.confidence || 0) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {(parsedTransaction?.confidence || 0).toFixed(2)} 
                    {parsedTransaction?.confidence && parsedTransaction.confidence > 0.7 ? ' (High)' : 
                     parsedTransaction?.confidence && parsedTransaction.confidence > 0.4 ? ' (Medium)' : ' (Low)'}
                  </span>
                  <span>
                    {parsedTransaction?.confidence && parsedTransaction.confidence > 0.7 ? 'Accurate' : 
                     parsedTransaction?.confidence && parsedTransaction.confidence > 0.4 ? 'Review Recommended' : 'Verify Manually'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
            >
              Edit
            </Button>
            <Button onClick={handleUseTransaction}>
              Use Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}