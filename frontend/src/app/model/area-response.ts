export class CovidInformation {
  identifier: string;
  value: number;
}

export class InformationPerData {
  date?: string;
  sex?: string;
  values: CovidInformation[];
}

export class AreaResponse {
  areaId: number;
  areaName: string;
  data: InformationPerData[];
}
