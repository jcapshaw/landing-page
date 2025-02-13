"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormData {
  stockNumber: string;
  location: string;
  customerName: string;
  salesContact: string;
  itemDetails: string;
  status: string;
  bcaApproved: string;
  dealerPay: string;
  dealerPayAmount: string;
  customerPay: string;
  gwcWarranty: string;
  contactPerson: string;
}

const ServiceRequestForm = () => {
  const [formData, setFormData] = useState<FormData>({
    stockNumber: '',
    location: '',
    customerName: '',
    salesContact: 'Mike',
    itemDetails: '',
    status: 'not_funded',
    bcaApproved: 'no',
    dealerPay: 'no',
    dealerPayAmount: '',
    customerPay: 'no',
    gwcWarranty: 'no',
    contactPerson: 'sales_manager'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string, name: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Service Request Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stock Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Stock Number*</label>
            <Input
              name="stockNumber"
              value={formData.stockNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location*</label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Name*</label>
            <Input
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Sales Contact */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sales Contact</label>
            <Select
              value={formData.salesContact}
              onValueChange={(value) => handleSelectChange(value, 'salesContact')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sales contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mike">Mike</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Item Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Items to be Addressed</label>
            <textarea
              name="itemDetails"
              value={formData.itemDetails}
              onChange={handleInputChange}
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange(value, 'status')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_funded">Not Funded</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="not_delivered">Not Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* BCA Approved */}
          <div className="space-y-2">
            <label className="text-sm font-medium">BCA Approved?</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bcaApproved"
                  value="yes"
                  checked={formData.bcaApproved === 'yes'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="bcaApproved"
                  value="no"
                  checked={formData.bcaApproved === 'no'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          {/* Dealer Pay */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dealer Pay?</label>
            <div className="flex gap-4 items-center">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dealerPay"
                  value="yes"
                  checked={formData.dealerPay === 'yes'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dealerPay"
                  value="no"
                  checked={formData.dealerPay === 'no'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                No
              </label>
              {formData.dealerPay === 'yes' && (
                <Input
                  type="number"
                  name="dealerPayAmount"
                  value={formData.dealerPayAmount}
                  onChange={handleInputChange}
                  placeholder="Authorized amount"
                  className="w-40"
                />
              )}
            </div>
          </div>

          {/* Customer Pay */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Pay?</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="customerPay"
                  value="yes"
                  checked={formData.customerPay === 'yes'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="customerPay"
                  value="no"
                  checked={formData.customerPay === 'no'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          {/* GWC Warranty */}
          <div className="space-y-2">
            <label className="text-sm font-medium">GWC Warranty?</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gwcWarranty"
                  value="yes"
                  checked={formData.gwcWarranty === 'yes'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gwcWarranty"
                  value="no"
                  checked={formData.gwcWarranty === 'no'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Who will be contacted to arrange?</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactPerson"
                  value="sales_manager"
                  checked={formData.contactPerson === 'sales_manager'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Sales Manager
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactPerson"
                  value="customer"
                  checked={formData.contactPerson === 'customer'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Customer Directly
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md transition-colors"
          >
            Submit Request
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestForm;