import _ from "lodash";
import {
  IDecoderAttribute,
  IDecoderResults,
} from "./IVehicleApiResponse";

const ATTRIBUTE_MAP = {
  vin: 1,
  make: 26,
  manufacturer_name: 27,
  model: 28,
  model_year: 29,
  plant_city: 31,
  series: 34,
  trim: 38,
  vehicle_type: 39,
  plant_country: 75,
  plant_state: 77,
  fuel_type: 24,         // Added Fuel Type - Primary
  displacement_l: 13,    // Added Displacement (L)
  // Add more attributes as needed
};

class DecodedVehicle {
  private static attributeMap = ATTRIBUTE_MAP;
  private vehicle: IDecoderResults | undefined;
  private attributes: IDecoderAttribute[];

  constructor(attributes: IDecoderAttribute[]) {
    this.vehicle = this.transformAttributes(attributes) || undefined;
    this.attributes = attributes || [];
  }

  private transformAttributes(attributes: IDecoderAttribute[]) {
    return _.transform(
      attributes,
      (memo: IDecoderResults, attribute) => {
        memo[attribute.VariableId] = {
          attribute: attribute,
        };
      },
      {}
    );
  }

  public static getAttributeMap() {
    return this.attributeMap;
  }

  public getAttributes() {
    return this.attributes;
  }

  public getAttribute(attributeId: number): IDecoderAttribute | undefined {
    return _.get(this.vehicle, [attributeId, "attribute"], undefined);
  }

  public getAttributeValue(attributeId: number): string | null | undefined {
    return _.get(this.vehicle, [attributeId, "attribute", "Value"], undefined);
  }
}

export default DecodedVehicle;