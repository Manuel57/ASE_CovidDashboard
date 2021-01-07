import {Inject, Injectable} from '@angular/core';
import {CovidCasesDaily} from '../model/covid-cases-daily';
import {HttpClient} from '@angular/common/http';
import {SexDistribution} from '../model/sex-distribution';
import {HospitalBedsDaily} from '../model/hospital-beds-daily';
import {Provinces} from '../model/Provinces';
import {GeneralSituationDaily} from '../model/general-situation-daily';



@Injectable({
  providedIn: 'root',
})
export class CovidService {

  constructor(@Inject('BACKEND_API_URL') private apiUrl: string, private http: HttpClient) {
  }

  public getNewCasesPerDate(): Promise<CovidCasesDaily[]> {
    return this.http.get(this.apiUrl + '/daily/10')
      .toPromise().then(item => (item as { cases: CovidCasesDaily[] }).cases);
  }

  public getHospitalBedsPerDate(): Promise<HospitalBedsDaily[]> {
    return this.http.get(this.apiUrl + '/daily/hospital/10')
      .toPromise().then(item => (item as { situations: HospitalBedsDaily[] }).situations);
  }


  public getSexDistribution(): Promise<SexDistribution[]> {
    return this.http.get(this.apiUrl + '/distribution/sex/10')
      .toPromise().then(item => (item as { cases: SexDistribution[] }).cases);
  }

  public getGeneralSituationPerDate(): Promise<GeneralSituationDaily[]> {
    return this.http.get(this.apiUrl + '/daily/generalsituation/10')
      .toPromise().then(item => (item as {situations: GeneralSituationDaily[]}).situations);
  }

  public getProvinces(): Promise<Provinces> {
    return this.http.get<any>(this.apiUrl + '/provinces')
      .toPromise()
      .then(res => (res as { data: Provinces }).data)
      .then(data => {
        return data;
      });
  }

}
