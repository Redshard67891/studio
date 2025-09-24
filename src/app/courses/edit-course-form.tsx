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
import { updateCourseAction } from './actions';
import type { Course } from '@/lib/types';

const courseSchema = z.object({
  id: z.string(),
  code: z.string().min(1, 'Course code is required'),
  title: z.string().min(1, 'Course title is required'),
  schedule: z.string().min(1, 'Schedule is required'),
});

type CourseFormValues = z.infer<typeof courseSchema>;

type EditCourseFormProps = {
  course: Course;
  onFinished: () => void;
};

export function EditCourseForm({ course, onFinished }: EditCourseFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      id: course.id,
      code: course.code,
      title: course.title,
      schedule: course.schedule,
    },
  });

  const onSubmit = (data: CourseFormValues) => {
    startTransition(async () => {
      const result = await updateCourseAction(data);
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
          if (fieldErrors.code) {
            form.setError('code', { type: 'server', message: fieldErrors.code[0] });
          }
          if (fieldErrors.title) {
            form.setError('title', { type: 'server', message: fieldErrors.title[0] });
          }
           if (fieldErrors.schedule) {
            form.setError('schedule', { type: 'server', message: fieldErrors.schedule[0] });
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., CS101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Introduction to Programming" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Mon/Wed 10:00-11:30" {...field} />
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
