import {Inject, Injectable} from '@angular/core';
import {CovidCasesDaily} from '../model/covid-cases-daily';
import {HttpClient} from '@angular/common/http';
import {SexDistribution} from "../model/sex-distribution";

@Injectable({
  providedIn: 'root',
})
export class CovidService {

  constructor(@Inject('BACKEND_API_URL') private apiUrl: string, private http: HttpClient) {
  }

  public getNewCasesPerDate(): Promise<CovidCasesDaily[]> {
    return this.http.get(this.apiUrl + '/daily/10')
      .toPromise().then(item => (item as {cases: CovidCasesDaily[]}).cases);
  }

  public getSexDistribution(): Promise<SexDistribution[]> {
    return this.http.get(this.apiUrl + '/distribution/sex/10')
      .toPromise().then(item => (item as {cases: SexDistribution[]}).cases);
  }


}
