import * as z from "zod"

export const vehicleSchema = z.object({
  images: z.array(z.string()).optional().default([]),
  location: z.string().min(1, "Location is required"),
  stock: z.string().default(""),
  year: z.string().min(1, "Year is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  trim: z.string().optional(),
  totalPrice: z.number().min(0, "Price must be positive"),
  mileage: z.number().min(0, "Mileage must be positive"),
  vin: z.string().min(17, "VIN must be 17 characters").max(17, "VIN must be 17 characters"),
  exteriorColor: z.string().min(1, "Exterior color is required"),
  engineSize: z.string().optional(),
  transmission: z.enum(["Automatic", "Manual", "CVT", "Other"]),
  fuelType: z.enum(["Gasoline", "Diesel", "Electric", "Hybrid", "Other"]),
  hasLift: z.boolean().default(false),
  hasWheels: z.boolean().default(false),
  hasTires: z.boolean().default(false),
  hasPaintMatch: z.boolean().default(false),
  hasLeather: z.boolean().default(false),
  hasOther: z.boolean().default(false),
  needsSmog: z.boolean().default(false),
  liftDescription: z.string().optional(),
  description: z.string().optional(),
  additions: z.object({
    lift: z.object({
      description: z.string(),
      price: z.number().min(0),
      installed: z.boolean()
    }).optional(),
    wheels: z.object({
      description: z.string(),
      price: z.number().min(0),
      installed: z.boolean()
    }).optional(),
    tires: z.object({
      description: z.string(),
      price: z.number().min(0),
      installed: z.boolean()
    }).optional(),
    paintMatch: z.object({
      description: z.string(),
      price: z.number().min(0),
      completed: z.boolean()
    }).optional(),
    leather: z.object({
      description: z.string(),
      price: z.number().min(0),
      installed: z.boolean()
    }).optional(),
    other: z.array(z.object({
      description: z.string(),
      price: z.number().min(0),
      completed: z.boolean()
    })).optional(),
    totalPrice: z.number()
  }).default({
    totalPrice: 0
  })
})

export type VehicleFormData = z.infer<typeof vehicleSchema>