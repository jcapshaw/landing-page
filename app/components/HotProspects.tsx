"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Prospect, ProspectData } from "@/lib/prospects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Modified to use Date instead of Timestamp for the form
type NewProspectFormData = Omit<ProspectData, 'status' | 'updatedAt' | 'archivedAt' | 'date'> & {
  date: Date;
};

type NewProspectData = Omit<ProspectData, 'status' | 'updatedAt' | 'archivedAt'>;

const formSchema = z.object({
  dealType: z.string().min(1, "Deal type is required"),
  customerName: z.string().min(1, "Customer name is required"),
  salesperson: z.string().min(1, "Salesperson is required"),
  deskManager: z.string().min(1, "Desk manager is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  hasDeposit: z.boolean().default(false),
  depositAmount: z.string().optional(),
  isOOS: z.boolean().default(false),
  disposition: z.string().default("Working"),
});

type FormValues = z.infer<typeof formSchema>;

interface HotProspectsProps {
  onSubmit: (values: NewProspectData | Prospect) => void;
  initialData?: Prospect | null;
  onCancel?: () => void;
  mode?: 'add' | 'edit';
}

export function HotProspects({ onSubmit, initialData, onCancel, mode = 'add' }: HotProspectsProps) {
  const [hasDeposit, setHasDeposit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealType: "",
      customerName: "",
      salesperson: "",
      deskManager: "",
      date: new Date(),
      hasDeposit: false,
      depositAmount: "",
      isOOS: false,
      disposition: "Working",
    },
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset({
        dealType: initialData.dealType,
        customerName: initialData.customerName,
        salesperson: initialData.salesperson,
        deskManager: initialData.deskManager,
        date: initialData.date?.toDate() || new Date(),
        hasDeposit: initialData.hasDeposit,
        depositAmount: initialData.depositAmount,
        isOOS: initialData.isOOS,
        disposition: initialData.disposition,
      });
      setHasDeposit(initialData.hasDeposit);
    }
  }, [initialData, form, mode]);

  function handleSubmit(formValues: FormValues) {
    const values: NewProspectData = {
      ...formValues,
      date: Timestamp.fromDate(formValues.date),
    };

    if (mode === 'edit' && initialData) {
      onSubmit({
        ...initialData,
        ...values,
      });
    } else {
      onSubmit(values);
    }

    if (mode === 'add') {
      form.reset();
      setHasDeposit(false);
      setIsOpen(false);
    }
  }

  const formFields = (
    <>
      <FormField
        control={form.control}
        name="dealType"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-1.5">
            <FormLabel>Deal or Stock</FormLabel>
            <FormControl>
              <Input placeholder="Enter deal or stock" {...field} className="h-10" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-1.5">
            <FormLabel>Date</FormLabel>
            <FormControl>
              <DatePicker
                selected={field.value}
                onChange={(date: Date | null) => field.onChange(date || new Date())}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background"
                dateFormat="MM/dd/yyyy"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customerName"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-1.5">
            <FormLabel>Customer Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter customer name" {...field} className="h-10" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="salesperson"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-1.5">
            <FormLabel>Salesperson</FormLabel>
            <FormControl>
              <Input placeholder="Enter salesperson name" {...field} className="h-10" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="deskManager"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-1.5">
            <FormLabel>Desk Manager</FormLabel>
            <FormControl>
              <Input placeholder="Enter desk manager name" {...field} className="h-10" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex space-x-6 col-span-2">
        <FormField
          control={form.control}
          name="hasDeposit"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setHasDeposit(!!checked);
                  }}
                />
              </FormControl>
              <FormLabel className="font-normal">Deposit</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isOOS"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">OOS</FormLabel>
            </FormItem>
          )}
        />
      </div>

      {hasDeposit && (
        <FormField
          control={form.control}
          name="depositAmount"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-1.5">
              <FormLabel>Deposit Amount</FormLabel>
              <FormControl>
                <Input
                  className="h-10"
                  type="text"
                  placeholder="Enter deposit amount"
                  {...field}
                  onChange={(e) => {
                    const input = e.target;
                    const cursorPos = input.selectionStart;
                    const value = input.value.replace(/[^0-9.]/g, "");
                    const formatted = new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                      .format(Number(value) || 0)
                      .replace(/^(\D+)/, "$");
                    
                    field.onChange(formatted);
                    
                    setTimeout(() => {
                      input.setSelectionRange(cursorPos, cursorPos);
                    }, 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="flex space-x-4 col-span-2 mt-2">
        <Button type="submit" className="flex-1">
          {mode === 'add' ? 'Add Hot Prospect' : 'Save Changes'}
        </Button>
        {mode === 'edit' && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </>
  );

  return (
    <div>
      {mode === 'add' ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Hot Prospect</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Hot Prospect</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
                {formFields}
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white shadow-sm rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Edit Hot Prospect</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
              {formFields}
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}