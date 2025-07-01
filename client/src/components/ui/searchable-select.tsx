import { useState, useMemo, KeyboardEvent } from 'react';
import { Search, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  items: any[];
  value: string;
  onValueChange: (value: string) => void;
  renderItem: (item: any) => React.ReactNode;
  getItemValue: (item: any) => string;
  getSearchableText: (item: any) => string;
  disabled?: boolean;
}

export function SearchableSelect({
  label,
  placeholder,
  searchPlaceholder,
  items,
  value,
  onValueChange,
  renderItem,
  getItemValue,
  getSearchableText,
  disabled = false
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return items.filter(item => 
      getSearchableText(item).toLowerCase().includes(lowerSearchTerm)
    ).sort((a, b) => {
      const aText = getSearchableText(a).toLowerCase();
      const bText = getSearchableText(b).toLowerCase();
      
      // Priorizar matches que começam com o termo de busca
      const aStartsWith = aText.startsWith(lowerSearchTerm);
      const bStartsWith = bText.startsWith(lowerSearchTerm);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Ordenar alfabeticamente
      return aText.localeCompare(bText);
    });
  }, [items, searchTerm, getSearchableText]);

  const selectedItem = items.find(item => getItemValue(item) === value);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        setShowResults(true);
      }
    }
  };

  const handleSelect = (item: any) => {
    onValueChange(getItemValue(item));
    setShowResults(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onValueChange('');
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{label}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="pl-10"
          />
        </div>
      </div>

      {selectedItem && !showResults && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Selecionado:</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2">
              {renderItem(selectedItem)}
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && searchTerm.trim() && (
        <Card>
          <CardContent className="p-0">
            <div className="p-3 border-b bg-muted/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {filteredItems.length} resultado(s) para "{searchTerm}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResults(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum resultado encontrado
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {filteredItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto hover:bg-muted/50 rounded-none"
                    onClick={() => handleSelect(item)}
                    disabled={disabled}
                  >
                    {renderItem(item)}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}