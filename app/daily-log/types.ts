export interface DailyLogEntry {
  id: string
  date: string
  hasAppointment: "YES" | "NO"
  appointmentSalesperson?: string
  salesperson: string
  isSplit: boolean
  secondSalesperson?: string
  stockNumber: string
  voi: string
  hasTrade: "YES" | "NO"
  tradeDetails?: string
  customerPhone: string
  status: "SOLD!" | "DEPOSIT" | "NO DEAL" | "PENDING"
  createdAt: string
}