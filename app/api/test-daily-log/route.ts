import { NextResponse } from 'next/server';

// Mock data store
let mockEntries: any[] = [];

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Add timestamp if not provided
    if (!data.createdAt) {
      data.createdAt = new Date().toISOString();
    }
    
    // Generate a mock ID
    const mockId = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Store the data in our mock store
    const newEntry = {
      id: mockId,
      ...data
    };
    
    mockEntries.push(newEntry);
    
    console.log('Added mock entry:', newEntry);
    console.log('Total mock entries:', mockEntries.length);
    
    return NextResponse.json({
      success: true,
      id: mockId,
      message: 'Test entry added successfully (mock)',
      data: newEntry
    });
  } catch (error) {
    console.error('Error adding test entry:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to retrieve mock entries
export async function GET(request: Request) {
  // Get date from query params
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  let filteredEntries = [...mockEntries];
  
  // Filter by date if provided
  if (dateParam) {
    const date = new Date(dateParam);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    filteredEntries = mockEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfDay && entryDate <= endOfDay;
    });
  }
  
  return NextResponse.json({
    success: true,
    entries: filteredEntries
  });
}