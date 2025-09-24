'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateStudentAction } from './actions';
import type { Student } from '@/lib/types';

const studentSchema = z.object({
  id: z.string(),
  studentId: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Registration number must be exactly 10 digits.'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .transform((name) => name.replace(/[^a-zA-Z0-9\s]/g, '')),
});

type StudentFormValues = z.infer<typeof studentSchema>;

type EditStudentFormProps = {
  student: Student;
  onFinished: () => void;
};

export function EditStudentForm({ student, onFinished }: EditStudentFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
    },
  });

  const onSubmit = (data: StudentFormValues) => {
    startTransition(async () => {
      const result = await updateStudentAction(data);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        onFinished();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'An unknown error occurred.',
        });
         if (result.errors) {
            const fieldErrors = result.errors as Record<string, any>;
            if (fieldErrors.studentId) {
                form.setError("studentId", { type: 'server', message: fieldErrors.studentId[0] });
            }
            if (fieldErrors.name) {
                form.setError("name", { type: 'server', message: fieldErrors.name[0] });
            }
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2021000001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Alice Johnson" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onFinished}>
                Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
