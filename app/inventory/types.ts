export interface Vehicle {
  // Basic Vehicle Information
  id: string
  vin: string
  stock: string
  location: string
  year: string
  make: string
  model: string
  trim?: string
  description?: string
  totalPrice: number
  mileage: number
  exteriorColor: string
  engineSize?: string
  transmission: "Automatic" | "Manual" | "CVT" | "Other"
  fuelType: "Gasoline" | "Diesel" | "Electric" | "Hybrid" | "Other"
  features?: string

  // Status Information
  status: "AVAILABLE" | "DEPOSIT" | "SOLD" | "PENDING_RECON" // UI enum
  statusData: {
    current: "Available" | "Pending Recon" | "Deposit" | "Sold"
    updatedAt: string
    updatedBy: {
      uid: string
      name: string
    }
    depositDetails?: {
      locationSold: string
      deskManagerName: string
      dealNumber: string
      depositAmount: number
    }
    soldDetails?: {
      locationSold: string
      deskManagerName: string
      financeManagerName: string
      salespersonName: string
      dealNumber: string
      dateSold: string
    }
  }

  // Additions/Modifications
  additions: {
    lift?: {
      description: string
      price: number
      installed: boolean
    }
    wheels?: {
      description: string
      price: number
      installed: boolean
    }
    tires?: {
      description: string
      price: number
      installed: boolean
    }
    paintMatch?: {
      description: string
      price: number
      completed: boolean
    }
    leather?: {
      description: string
      price: number
      installed: boolean
    }
    other?: Array<{
      description: string
      price: number
      completed: boolean
    }>
    totalPrice: number
  }

  // UI Helper Fields for Additions
  hasLift: boolean
  hasWheels: boolean
  hasTires: boolean
  hasPaintMatch: boolean
  hasLeather: boolean
  hasOther: boolean
  liftDescription?: string
  liftPrice?: number
  addsPrice?: number

  // Metadata
  metadata: {
    createdAt: string
    createdBy: {
      uid: string
      name: string
    }
    lastUpdated: string
    lastUpdatedBy: {
      uid: string
      name: string
    }
  }

  // Search Index Fields
  searchIndex: {
    makeModel: string
    yearMakeModel: string
    priceRange: string
  }

  // UI Date Fields
  dateAdded: { seconds: number; nanoseconds: number } | string // Maps to metadata.createdAt
  lastStatusUpdate: { seconds: number; nanoseconds: number } | string // Maps to statusData.updatedAt

  // Vehicle Compliance
  needsSmog?: boolean // Indicates if the vehicle needs smog certification
  
  // Vehicle Images
  images?: string[] // Array of image URLs
}

export interface User {
  uid: string
  name: string
  email: string
  role: string
  active: boolean
}