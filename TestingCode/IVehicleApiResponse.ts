export default interface IVehicleApiResponse<T> {
    Count: number;
    Message: string;
    SearchCriteria: string | null;
    Results: T[];
  }
  
  export interface IDecoderAttribute {
    VariableId: number;
    Variable: string;
    ValueId: string | null;
    Value: string | null;
  }
  
  export interface IDecoderResults {
    [attributeId: number | string]: {
      attribute: IDecoderAttribute;
    };
  }