export interface DailyLogEntry {
  id: string
  date: string
  hasAppointment: "YES" | "NO"
  appointmentSalesperson?: string
  salesperson: string
  isSplit: boolean
  secondSalesperson?: string
  salesManager?: string
  stockNumber: string
  voi: string
  hasTrade: "YES" | "NO"
  tradeDetails?: string
  customerName: string
  customerPhone: string
  status: "SOLD!" | "DEPOSIT" | "NO DEAL" | "PENDING"
  createdAt: string
  isBeBack: boolean
  isBDC?: boolean
  comments?: string
}