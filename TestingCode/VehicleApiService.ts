import axios from "axios";
import IVehicleApiResponse, { IDecoderAttribute } from "../utilities/IVehicleApiResponse";

const VPIC_API_URI = "https://vpic.nhtsa.dot.gov/api/vehicles/";
const RESPONSE_FORMAT = "json";

const VehicleApiService = {
  decodeVin: function (vin: string) {
    const uri = `${VPIC_API_URI}/decodevinextended/${vin}?format=${RESPONSE_FORMAT}`;
    return axios.get<IVehicleApiResponse<IDecoderAttribute>>(uri);
  },
};

export default VehicleApiService;
