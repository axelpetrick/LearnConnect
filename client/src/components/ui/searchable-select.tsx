import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return items.filter(item => 
      getSearchableText(item).toLowerCase().includes(lowerSearchTerm)
    );
  }, [items, searchTerm, getSearchableText]);

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="search-input">Buscar</Label>
        <Input
          id="search-input"
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
        />
      </div>
      
      <div>
        <Label>
          {label} {searchTerm ? `(${filteredItems.length} encontrados)` : `(${items.length} disponíveis)`}
        </Label>
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filteredItems.map((item) => (
              <SelectItem key={getItemValue(item)} value={getItemValue(item)}>
                {renderItem(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}