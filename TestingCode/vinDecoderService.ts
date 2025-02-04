// utilities/vinDecoderService.ts
import axios from "axios";

const BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin";

export const decodeVIN = async (vin: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/${vin}`, {
      params: {
        format: "json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error decoding VIN:", error);
    throw error;
  }
};
