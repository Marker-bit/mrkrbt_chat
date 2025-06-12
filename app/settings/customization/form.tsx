"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  additionalInfo: z.string().max(3000).optional(),
});

export default function CustomizationForm({
  defaultAdditionalInfo,
}: {
  defaultAdditionalInfo: string;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      additionalInfo: defaultAdditionalInfo,
    },
  });

  const characterCount = form.watch("additionalInfo")!.length;
  const limit = 3000;
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    await authClient.updateUser({ additionalInfo: values.additionalInfo });
    setLoading(false);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Anything you want mrkrbt.chat to know about you
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Interests, values or preferences to keep in mind"
                    maxLength={limit}
                    {...field}
                  />
                  <div
                    className="text-muted-foreground text-right text-xs tabular-nums absolute bottom-2 right-2"
                    role="status"
                    aria-live="polite"
                  >
                    {characterCount}/{limit}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
