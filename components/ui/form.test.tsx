import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './form';
import { Input } from './input';

const schema = z.object({ name: z.string().min(1, 'Tên là bắt buộc') });

function TestForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Gửi</button>
      </form>
    </Form>
  );
}

describe('Form', () => {
  it('shows the zod validation message when the field is invalid', async () => {
    render(<TestForm />);
    fireEvent.click(screen.getByText('Gửi'));
    await waitFor(() => {
      expect(screen.getByText('Tên là bắt buộc')).toBeInTheDocument();
    });
  });

  it('associates the label with the input for accessibility', () => {
    render(<TestForm />);
    expect(screen.getByLabelText('Tên')).toBeInTheDocument();
  });
});
