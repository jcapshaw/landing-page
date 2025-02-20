"use client"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DailyLogEntry } from "../types"

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }).nullable().transform(val => val || new Date()),
  customerName: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  hasAppointment: z.enum(["YES", "NO"], {
    required_error: "Please select if this was an appointment.",
  }),
  isBeBack: z.boolean().default(false),
  appointmentSalesperson: z.string().min(2, {
    message: "Appointment salesperson name must be at least 2 characters.",
  }).optional(),
  salesperson: z.string().min(2, {
    message: "Salesperson name must be at least 2 characters.",
  }),
  isSplit: z.boolean().default(false),
  secondSalesperson: z.string().min(2, {
    message: "Second salesperson name must be at least 2 characters.",
  }).optional(),
  stockNumber: z.string().min(1, {
    message: "Stock number is required.",
  }),
  voi: z.string().min(1, {
    message: "VOI is required.",
  }),
  hasTrade: z.enum(["YES", "NO"], {
    required_error: "Please select if there is a trade-in.",
  }),
  tradeDetails: z.string().optional(),
  customerPhone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  status: z.enum(["SOLD!", "DEPOSIT", "NO DEAL", "PENDING"], {
    required_error: "Please select a status.",
  }),
}).refine((data) => {
  // If there's an appointment, require appointmentSalesperson
  if (data.hasAppointment === "YES") {
    return !!data.appointmentSalesperson;
  }
  return true;
}, {
  message: "Please select which salesperson the appointment belongs to",
  path: ["appointmentSalesperson"],
})

type FormValues = z.infer<typeof formSchema>

interface DailyLogFormProps {
  onSubmit?: (data: Omit<DailyLogEntry, 'id' | 'createdAt'>) => void
  initialData?: Partial<DailyLogEntry>
  isEditing?: boolean
}

function DailyLogFormContent({ onSubmit, initialData, isEditing }: DailyLogFormProps) {
  const [isSplit, setIsSplit] = useState(initialData?.isSplit || false)
  const [hasAppointment, setHasAppointment] = useState(initialData?.hasAppointment === "YES")
  const [hasTrade, setHasTrade] = useState(initialData?.hasTrade === "YES" || false)
  const [isBeBack, setIsBeBack] = useState(initialData?.isBeBack || false)

  const formatPhoneNumber = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 0) return ''
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      hasAppointment: initialData?.hasAppointment || "NO",
      isBeBack: initialData?.isBeBack || false,
      appointmentSalesperson: initialData?.appointmentSalesperson || "",
      salesperson: initialData?.salesperson || "",
      isSplit: initialData?.isSplit || false,
      secondSalesperson: initialData?.secondSalesperson || undefined,
      stockNumber: initialData?.stockNumber || "",
      voi: initialData?.voi || "",
      hasTrade: initialData?.hasTrade || "NO",
      tradeDetails: initialData?.tradeDetails || "",
      customerPhone: initialData?.customerPhone || "",
      status: initialData?.status || "PENDING",
    },
  })

  console.log('Form initialized with values:', form.getValues())

  const handleSubmit = (data: FormValues) => {
    console.log('Form submitted with data:', data);
    
    // Ensure all required fields are present
    const requiredFields = [
      'date',
      'hasAppointment',
      'salesperson',
      'stockNumber',
      'voi',
      'hasTrade',
      'customerPhone',
      'status'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field as keyof FormValues]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return;
    }

    // Format the date properly
    const formattedDate = new Date(data.date);
    formattedDate.setHours(new Date().getHours());
    formattedDate.setMinutes(new Date().getMinutes());
    
    const submissionData = {
      ...data,
      date: formattedDate.toISOString()
    };
    
    console.log('Transformed data for submission:', submissionData);
    onSubmit?.(submissionData);
    if (!isEditing) {
      form.reset()
      setIsSplit(false)
      setHasTrade(false)
      setHasAppointment(false)
      setIsBeBack(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          (data) => {
            console.log('Form is valid, submitting with data:', data);
            handleSubmit(data);
          },
          (errors) => {
            console.error('Form validation errors:', errors);
          }
        )}
        className="w-full space-y-6 bg-white p-6 rounded-lg shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="flex space-x-4 md:col-span-3 lg:col-span-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="w-40">
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date | null) => field.onChange(date || new Date())}
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      wrapperClassName="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasAppointment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-1 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === "YES"}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? "YES" : "NO");
                        setHasAppointment(checked as boolean);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Appointment</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isBeBack"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setIsBeBack(checked as boolean);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Be Back</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSplit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setIsSplit(checked as boolean);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Split Deal</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="salesperson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salesperson</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Smith"
                    {...field}
                    className="h-8 text-sm uppercase"
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isSplit && (
            <FormField
              control={form.control}
              name="secondSalesperson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second Salesperson</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      className="h-8 text-sm uppercase"
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        field.onChange(value || undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {hasAppointment && (
            <FormField
              control={form.control}
              name="appointmentSalesperson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Belongs To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select salesperson" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {form.getValues("salesperson") && (
                        <SelectItem value={form.getValues("salesperson")}>
                          {form.getValues("salesperson")}
                        </SelectItem>
                      )}
                      {isSplit && (() => {
                        const secondSalesperson = form.getValues("secondSalesperson");
                        return secondSalesperson && secondSalesperson.length > 0 ? (
                          <SelectItem value={secondSalesperson}>
                            {secondSalesperson}
                          </SelectItem>
                        ) : null;
                      })()}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="stockNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="12345"
                    {...field}
                    className="h-8 text-sm uppercase"
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VOI</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Vehicle of Interest"
                    {...field}
                    className="h-8 text-sm uppercase"
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    className="h-8 text-sm uppercase"
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(555) 555-5555"
                    {...field}
                    className="h-8 text-sm"
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                    maxLength={14}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasTrade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trade-in</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setHasTrade(value === "YES");
                    // Clear tradeDetails when trade-in is set to NO
                    if (value === "NO") {
                      form.setValue("tradeDetails", "");
                    }
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select trade-in status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">YES</SelectItem>
                    <SelectItem value="NO">NO</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {hasTrade && (
            <FormField
              control={form.control}
              name="tradeDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade-in Details</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Year Make Model"
                      {...field}
                      className="h-8 text-sm uppercase"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="SOLD!">SOLD!</SelectItem>
                    <SelectItem value="DEPOSIT">DEPOSIT</SelectItem>
                    <SelectItem value="NO DEAL">NO DEAL</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-4 mt-4 flex justify-center">
          <Button type="submit" className="w-48">
            {isEditing ? "Save Changes" : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default function DailyLogForm(props: DailyLogFormProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Add Store Visit</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>New Store Visit</DrawerTitle>
          <DrawerDescription>Add a new store visit to the daily log.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <DailyLogFormContent {...props} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}