import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { insertCourseSchema, type InsertCourse } from '@shared/schema';
import { X } from 'lucide-react';

interface CourseFormProps {
  defaultValues?: Partial<InsertCourse>;
  onSubmit: (data: InsertCourse) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const courseCategories = [
  'Programação',
  'Design',
  'Marketing',
  'Negócios',
  'Ciência de Dados',
  'Desenvolvimento Web',
  'Mobile',
  'DevOps',
  'Inteligência Artificial',
  'Outros'
];

export function CourseForm({ defaultValues, onSubmit, isLoading = false, submitLabel = 'Criar Curso' }: CourseFormProps) {
  const [tags, setTags] = useState<string[]>(defaultValues?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      category: '',
      tags: [],
      isPublished: false,
      ...defaultValues,
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      form.setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags);
  };

  const handleSubmit = (data: InsertCourse) => {
    onSubmit({ ...data, tags });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
        <CardDescription>
          Preencha as informações do curso abaixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="title">Título do Curso *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Digite o título do curso"
              className={form.formState.errors.title ? 'border-red-500' : ''}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Descreva o curso brevemente"
              rows={3}
              className={form.formState.errors.description ? 'border-red-500' : ''}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="content">Conteúdo do Curso</Label>
            <Textarea
              id="content"
              {...form.register('content')}
              placeholder="Descreva o conteúdo detalhado do curso"
              rows={6}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select onValueChange={(value) => form.setValue('category', value)}>
              <SelectTrigger className={form.formState.errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {courseCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Adicionar tag"
              />
              <Button type="button" onClick={handleAddTag} disabled={!tagInput.trim()}>
                Adicionar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublished"
              checked={form.watch('isPublished')}
              onCheckedChange={(checked) => form.setValue('isPublished', checked)}
            />
            <Label htmlFor="isPublished">Publicar curso imediatamente</Label>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
