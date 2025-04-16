"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DailyLogEntry } from "../daily-log/types"
import { getDailyLogEntryById, updateDailyLogEntry } from "../daily-log/services/dailyLogService"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { db } from "@/lib/firebase"
import { addDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore"

// Interface for Board Deal data
interface BoardDealData {
  entryId: string
  saleDate: string
  customerName: string
  stockNumber: string
  vehicle: string
  salePrice: number
  cost: number
  profit: number
  downPayment: number
  tradeValue: number
  tradeAllowance: number
  financedAmount: number
  term: number
  rate: number
  monthlyPayment: number
  bankName: string
  salesPerson: string
  salesManager: string
  deskManager: string
  dealNumber: string
  locationSold: string
  notes: string
  createdAt: string
}

const salespeople = [
  "Tom White",
  "Mary Black",
  "James Green",
  "Patricia Gray"
]

const managers = [
  "John Smith",
  "Sarah Johnson",
  "Michael Brown",
  "Jennifer Davis"
]

const locations = [
  "Main Dealership",
  "Downtown Branch",
  "West Side Location",
  "North County"
]

const banks = [
  "Chase Auto Finance",
  "Bank of America",
  "Wells Fargo",
  "Capital One",
  "Toyota Financial",
  "Honda Financial",
  "Credit Union",
  "In-House Financing"
]

export default function SoldLogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const entryId = searchParams.get("entry")
  const [entry, setEntry] = useState<DailyLogEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBoardDealOpen, setIsBoardDealOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<BoardDealData>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [boardDeals, setBoardDeals] = useState<BoardDealData[]>([])
  const [loadingDeals, setLoadingDeals] = useState(true)

  // Function to fetch board deals from Firestore
  const fetchBoardDeals = async (id: string) => {
    setLoadingDeals(true)
    try {
      const boardDealsQuery = query(
        collection(db, 'boardDeals'),
        where('entryId', '==', id),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(boardDealsQuery)
      const deals: BoardDealData[] = []
      
      querySnapshot.forEach((doc) => {
        deals.push(doc.data() as BoardDealData)
      })
      
      console.log("Fetched board deals:", deals)
      setBoardDeals(deals)
    } catch (err) {
      console.error("Error fetching board deals:", err)
    } finally {
      setLoadingDeals(false)
    }
  }

  useEffect(() => {
    async function fetchEntry() {
      if (!entryId) {
        setError("No entry ID provided")
        setLoading(false)
        return
      }

      try {
        console.log("Fetching entry with ID:", entryId)
        const entryData = await getDailyLogEntryById(entryId)
        console.log("Entry data received:", entryData)
        
        if (entryData) {
          setEntry(entryData)
          // Initialize form data with entry data
          setFormData({
            entryId: entryData.id,
            customerName: entryData.customerName,
            stockNumber: entryData.stockNumber,
            vehicle: entryData.voi,
            salesPerson: entryData.salesperson,
            saleDate: new Date().toISOString().split('T')[0],
          })
          
          // Fetch board deals for this entry
          await fetchBoardDeals(entryData.id)
        } else {
          setError("Entry not found")
        }
      } catch (err) {
        setError("Failed to load entry data")
        console.error("Error loading entry:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEntry()
  }, [entryId])

  const openBoardDealForm = () => {
    setIsBoardDealOpen(true)
    setSubmitSuccess(false)
  }

  const closeBoardDealForm = () => {
    setIsBoardDealOpen(false)
    setFormErrors({})
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    // Convert numeric fields to numbers
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : parseFloat(value)
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Calculate profit when sale price or cost changes
  useEffect(() => {
    if (formData.salePrice !== undefined && formData.cost !== undefined) {
      const profit = formData.salePrice - formData.cost
      setFormData(prev => ({
        ...prev,
        profit
      }))
    }
  }, [formData.salePrice, formData.cost])

  // Calculate financed amount when sale price, down payment, and trade allowance change
  useEffect(() => {
    if (
      formData.salePrice !== undefined &&
      formData.downPayment !== undefined &&
      formData.tradeAllowance !== undefined
    ) {
      const financedAmount = formData.salePrice - (formData.downPayment || 0) - (formData.tradeAllowance || 0)
      setFormData(prev => ({
        ...prev,
        financedAmount: financedAmount > 0 ? financedAmount : 0
      }))
    }
  }, [formData.salePrice, formData.downPayment, formData.tradeAllowance])

  // Calculate monthly payment when financed amount, term, and rate change
  useEffect(() => {
    if (
      formData.financedAmount !== undefined &&
      formData.term !== undefined &&
      formData.rate !== undefined &&
      formData.financedAmount > 0 &&
      formData.term > 0
    ) {
      const monthlyRate = (formData.rate / 100) / 12
      const monthlyPayment =
        (formData.financedAmount * monthlyRate * Math.pow(1 + monthlyRate, formData.term)) /
        (Math.pow(1 + monthlyRate, formData.term) - 1)
      
      setFormData(prev => ({
        ...prev,
        monthlyPayment: isNaN(monthlyPayment) ? 0 : parseFloat(monthlyPayment.toFixed(2))
      }))
    }
  }, [formData.financedAmount, formData.term, formData.rate])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const requiredFields = [
      'saleDate', 'customerName', 'stockNumber', 'vehicle',
      'salePrice', 'cost', 'salesPerson', 'dealNumber'
    ]
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof BoardDealData]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`
      }
    })
    
    // Validate numeric fields
    if (formData.salePrice !== undefined && formData.salePrice <= 0) {
      newErrors.salePrice = 'Sale price must be greater than 0'
    }
    
    if (formData.cost !== undefined && formData.cost <= 0) {
      newErrors.cost = 'Cost must be greater than 0'
    }
    
    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Create a complete board deal object
      const boardDeal: BoardDealData = {
        entryId: entryId || '',
        saleDate: formData.saleDate || new Date().toISOString().split('T')[0],
        customerName: formData.customerName || '',
        stockNumber: formData.stockNumber || '',
        vehicle: formData.vehicle || '',
        salePrice: formData.salePrice || 0,
        cost: formData.cost || 0,
        profit: formData.profit || 0,
        downPayment: formData.downPayment || 0,
        tradeValue: formData.tradeValue || 0,
        tradeAllowance: formData.tradeAllowance || 0,
        financedAmount: formData.financedAmount || 0,
        term: formData.term || 0,
        rate: formData.rate || 0,
        monthlyPayment: formData.monthlyPayment || 0,
        bankName: formData.bankName || '',
        salesPerson: formData.salesPerson || '',
        salesManager: formData.salesManager || '',
        deskManager: formData.deskManager || '',
        dealNumber: formData.dealNumber || '',
        locationSold: formData.locationSold || '',
        notes: formData.notes || '',
        createdAt: new Date().toISOString()
      }
      
      // Save to Firestore
      await addDoc(collection(db, 'boardDeals'), boardDeal)
      
      // Update the daily log entry status to SOLD! if not already
      if (entry && entry.status !== 'SOLD!') {
        await updateDailyLogEntry(entry.id, { status: 'SOLD!' })
      }
      
      // Refresh the board deals list
      if (entry) {
        await fetchBoardDeals(entry.id)
      }
      
      setSubmitSuccess(true)
      setTimeout(() => {
        closeBoardDealForm()
      }, 1500)
    } catch (err) {
      console.error('Error saving board deal:', err)
      setFormErrors({ submit: 'Failed to save board deal data' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // For debugging
  useEffect(() => {
    console.log("Entry ID from URL:", entryId);
    console.log("Entry loaded:", entry);
    console.log("Loading state:", loading);
    console.log("Error state:", error);
  }, [entryId, entry, loading, error]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Log Entry</h1>
        {entry && (
          <Button
            onClick={openBoardDealForm}
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 text-lg"
            size="lg"
          >
            Board Deal
          </Button>
        )}
      </div>
      
      {loading ? null : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Make sure you&apos;re accessing this page with a valid entry ID in the URL.
            <br />
            Example: /sold-log?entry=your-entry-id
          </p>
          
          <div className="mt-4 flex gap-4">
            <Button
              onClick={() => router.push('/daily-log')}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Go to Daily Log
            </Button>
            
            <Button
              onClick={openBoardDealForm}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              Create Board Deal Manually
            </Button>
          </div>
        </div>
      ) : entry ? (
        <>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">Customer Information</h3>
                <p className="text-sm">Name: {entry.customerName}</p>
                <p className="text-sm">Phone: {entry.customerPhone}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Vehicle Information</h3>
                <p className="text-sm">Stock #: {entry.stockNumber}</p>
                <p className="text-sm">Vehicle: {entry.voi}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Deal Status</h3>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  entry.status === 'SOLD!'
                    ? 'bg-green-100 text-green-800'
                    : entry.status === 'DEPOSIT'
                    ? 'bg-blue-100 text-blue-800'
                    : entry.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {entry.status}
                </span>
              </div>
            </div>
          </div>

          {/* Board Deals List */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Board Deals</h2>
            
            {loadingDeals ? null : boardDeals.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
                <p className="text-gray-600">No board deals have been added yet.</p>
                <p className="text-sm text-gray-500 mt-1">Click the Board Deal button to add a new deal.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {boardDeals.map((deal, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{deal.customerName}</h3>
                        <p className="text-sm text-gray-600">{deal.vehicle} (Stock #: {deal.stockNumber})</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">${deal.salePrice.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Profit: ${deal.profit.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Sale Date:</span> {new Date(deal.saleDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Deal #:</span> {deal.dealNumber}
                      </div>
                      <div>
                        <span className="font-medium">Salesperson:</span> {deal.salesPerson}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {deal.locationSold}
                      </div>
                    </div>
                    
                    {deal.financedAmount > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm">
                          <span className="font-medium">Financing:</span> ${deal.financedAmount.toLocaleString()} at {deal.rate}% for {deal.term} months
                          ({deal.bankName}) - ${deal.monthlyPayment.toLocaleString()}/mo
                        </p>
                      </div>
                    )}
                    
                    {deal.notes && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm"><span className="font-medium">Notes:</span> {deal.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Board Deal Dialog */}
      <Dialog open={isBoardDealOpen} onOpenChange={closeBoardDealForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Board Deal Information</DialogTitle>
          </DialogHeader>
          
          {submitSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p>Board deal successfully saved!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Basic Information</h3>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Sale Date</label>
                    <Input
                      type="date"
                      name="saleDate"
                      value={formData.saleDate || ''}
                      onChange={handleInputChange}
                      className={formErrors.saleDate ? "border-red-500" : ""}
                    />
                    {formErrors.saleDate && (
                      <span className="text-xs text-red-500">{formErrors.saleDate}</span>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Customer Name</label>
                    <Input
                      name="customerName"
                      value={formData.customerName || ''}
                      onChange={handleInputChange}
                      className={formErrors.customerName ? "border-red-500" : ""}
                    />
                    {formErrors.customerName && (
                      <span className="text-xs text-red-500">{formErrors.customerName}</span>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Stock Number</label>
                    <Input
                      name="stockNumber"
                      value={formData.stockNumber || ''}
                      onChange={handleInputChange}
                      className={formErrors.stockNumber ? "border-red-500" : ""}
                    />
                    {formErrors.stockNumber && (
                      <span className="text-xs text-red-500">{formErrors.stockNumber}</span>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Vehicle</label>
                    <Input
                      name="vehicle"
                      value={formData.vehicle || ''}
                      onChange={handleInputChange}
                      className={formErrors.vehicle ? "border-red-500" : ""}
                    />
                    {formErrors.vehicle && (
                      <span className="text-xs text-red-500">{formErrors.vehicle}</span>
                    )}
                  </div>
                </div>
                
                {/* Financial Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Financial Information</h3>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Sale Price ($)</label>
                    <Input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice || ''}
                      onChange={handleInputChange}
                      className={formErrors.salePrice ? "border-red-500" : ""}
                    />
                    {formErrors.salePrice && (
                      <span className="text-xs text-red-500">{formErrors.salePrice}</span>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Cost ($)</label>
                    <Input
                      type="number"
                      name="cost"
                      value={formData.cost || ''}
                      onChange={handleInputChange}
                      className={formErrors.cost ? "border-red-500" : ""}
                    />
                    {formErrors.cost && (
                      <span className="text-xs text-red-500">{formErrors.cost}</span>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Profit ($)</label>
                    <Input
                      type="number"
                      name="profit"
                      value={formData.profit || ''}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Down Payment ($)</label>
                    <Input
                      type="number"
                      name="downPayment"
                      value={formData.downPayment || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {/* Trade Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Trade Information</h3>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Trade Value ($)</label>
                    <Input
                      type="number"
                      name="tradeValue"
                      value={formData.tradeValue || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Trade Allowance ($)</label>
                    <Input
                      type="number"
                      name="tradeAllowance"
                      value={formData.tradeAllowance || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                {/* Financing Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Financing Information</h3>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Financed Amount ($)</label>
                    <Input
                      type="number"
                      name="financedAmount"
                      value={formData.financedAmount || ''}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Term (months)</label>
                    <Input
                      type="number"
                      name="term"
                      value={formData.term || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Rate (%)</label>
                    <Input
                      type="number"
                      name="rate"
                      value={formData.rate || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Monthly Payment ($)</label>
                    <Input
                      type="number"
                      name="monthlyPayment"
                      value={formData.monthlyPayment || ''}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Bank/Finance Company</label>
                    <Select
                      value={formData.bankName || ''}
                      onValueChange={(value) => handleSelectChange('bankName', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((bank) => (
                          <SelectItem key={bank} value={bank}>
                            {bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Deal Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-medium">Deal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm">Salesperson</label>
                      <Select
                        value={formData.salesPerson || ''}
                        onValueChange={(value) => handleSelectChange('salesPerson', value)}
                      >
                        <SelectTrigger className={formErrors.salesPerson ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select Salesperson" />
                        </SelectTrigger>
                        <SelectContent>
                          {salespeople.map((person) => (
                            <SelectItem key={person} value={person}>
                              {person}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.salesPerson && (
                        <span className="text-xs text-red-500">{formErrors.salesPerson}</span>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm">Sales Manager</label>
                      <Select
                        value={formData.salesManager || ''}
                        onValueChange={(value) => handleSelectChange('salesManager', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sales Manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {managers.map((manager) => (
                            <SelectItem key={manager} value={manager}>
                              {manager}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm">Desk Manager</label>
                      <Select
                        value={formData.deskManager || ''}
                        onValueChange={(value) => handleSelectChange('deskManager', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Desk Manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {managers.map((manager) => (
                            <SelectItem key={manager} value={manager}>
                              {manager}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm">Deal Number</label>
                      <Input
                        name="dealNumber"
                        value={formData.dealNumber || ''}
                        onChange={handleInputChange}
                        className={formErrors.dealNumber ? "border-red-500" : ""}
                      />
                      {formErrors.dealNumber && (
                        <span className="text-xs text-red-500">{formErrors.dealNumber}</span>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm">Location Sold</label>
                      <Select
                        value={formData.locationSold || ''}
                        onValueChange={(value) => handleSelectChange('locationSold', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-medium">Notes</h3>
                  <div className="grid gap-2">
                    <Input
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleInputChange}
                      placeholder="Additional notes about the deal"
                    />
                  </div>
                </div>
                
                {formErrors.submit && (
                  <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <p>{formErrors.submit}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={closeBoardDealForm}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-500 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Board Deal'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}