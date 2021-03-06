import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Area} from '../model/area';
import {AreaResponse} from '../model/area-response';
import {TreeNode} from 'primeng/api';
import {CovidOverview} from '../model/covid-overview';
import {DatePipe} from '@angular/common';
import {CovidDataMap} from '../model/covid-data-map';
import {of} from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class CovidService {

  constructor(@Inject('BACKEND_API_URL') private apiUrl: string, private http: HttpClient,
              private datePipe: DatePipe) {
  }

  private async executeRequest(path: string, params: { [key: string]: string | string[] }, formatLabel: boolean = true): Promise<any> {
    return this.mapResponseDataToObject(await this.http.get(this.apiUrl + path, {params})
        .toPromise().then(item => (item as { items: AreaResponse[] }).items),
      formatLabel,
    );
  }

  public getNewCasesPerDate(areas: string[]): Promise<any> {
    return this.executeRequest('/daily/new-cases', {area: areas});
  }

  public getHospitalBedsPerDate(areas: string[]): Promise<any> {
    return this.executeRequest('/daily/hospital', {area: areas});
  }

  public async getSexDistributionCases(areas: string[]): Promise<AreaResponse[]> {
    return await this.http.get(this.apiUrl + '/distribution/sex',
      {params: {area: areas}})
      .toPromise().then(item => (item as { items: AreaResponse[] }).items);
  }

  public getGeneralSituationPerDate(area: string): Promise<any> {
    return this.http.get<any>(this.apiUrl + '/daily/generalSituation', {params: {area: [area]}})

      .toPromise().then(item => (item as { items: AreaResponse[] }).items[0].data.map(data => ({
          date: this.formatIfDate(data.date),
          values: {
            ...data.values.reduce((obj, curr) => ({...obj, [curr.identifier]: curr.value}), {}),
          },
        }
      )));
  }

  public async getHospitalUtilizationPerProvince(chartType, areaId: number): Promise<any> {
    const data = this.mapResponseDataToObject(await this.http.get<any>(this.apiUrl + '/hospital-bed-utilizations',
      {params: {area: [areaId.toString(10)], type: chartType}})
      .toPromise()
      .then(res => (res as { items: AreaResponse[] }).items));
    return {...data};
  }

  public async getAgeSexDistributionData(areaId: number, selectedData): Promise<any> {

    let postfix = '';
    if (selectedData === 'cured cases') {
      postfix = 'cured';
    } else if (selectedData === 'dead cases') {
      postfix = 'deaths';
    } else {
      postfix = 'cases';
    }

    const data = this.mapResponseDataToObject(await this.http.get<any>(this.apiUrl + '/distribution/age-sex/' + postfix,
      {params: {area: [areaId.toString()]}})
      .toPromise()
      .then(res => (res as { items: AreaResponse[] }).items), false, 'ageInterval');
    return {...data};
  }

  public async getComparisonData(regions: Area[]): Promise<any> {
    const data = this.mapResponseDataToObject(await this.http.get<any>(this.apiUrl + '/comparison/cases',
      {params: {area: regions.map(item => item.areaId.toString())}})
      .toPromise()
      .then(res => (res as { items: AreaResponse[] }).items));
    return {...data};
  }

  public async getComparisonCasesData(areaId: number, relative: boolean): Promise<any> {
    return this.executeRequest('/daily/cases', {
      area: [areaId.toString(10)],
      relative: relative + '',
    }, true).then(result => {
      const obj = {labels: result.labels} as any;
      Object.entries(result).forEach((item: [string, any]) => {
        if (item[0] !== 'labels') {
          obj[item[0]] = {
            activeCases: item[1].activeCases,
            deaths: item[1].deaths,
            cured: item[1].cured,
          };
        }
      });
      return obj;
    });
  }


  public getProvinces(): Promise<Area[]> {
    return this.http.get<any>(this.apiUrl + '/provinces')
      .toPromise()
      .then(res => (res as { items: Area[] }).items);
  }

  public getDistricts(): Promise<Area[]> {
    return this.http.get<any>(this.apiUrl + '/districts')
      .toPromise()
      .then(res => (res as { items: Area[] }).items);
  }

  async getDetailedInformationForMap(areaid: string): Promise<CovidDataMap[]> {
    const provinces = (await this.http.get(this.apiUrl + '/districts').toPromise() as any)
      .items.filter(item => item.areaId.toString(10)[0] === areaid);

    const absolute = await this.http.get(this.apiUrl + '/area-info',
      {params: {area: provinces.map(i => i.areaId)}}).toPromise() as any;
    const relative = await this.http.get(this.apiUrl + '/area-info',
      {params: {area: provinces.map(i => i.areaId), relative: 'true'}}).toPromise() as any;
    console.log(absolute);
    console.log(relative);
    return absolute.items.map(item => {
      let obj: any = {};

      obj.provinceId = item.areaId;
      obj.provinceName = item.areaName;
      obj.geoId = `AUT.${item.areaId.toString(10)[0]}.${item.areaId.toString(10)[1]}${item.areaId.toString(10)[2]}_1`;
      obj = {
        ...obj, ...item.data.reduce((p, c: any) => ({...p, [c.identifier]: c.value}), {}),
        ...relative.items.find(ir => ir.areaId === item.areaId).data.reduce((p, c: any) => ({
          ...p,
          [c.identifier + 'Relative']: c.value,
        }), {}),
      };
      return obj;
    }) as CovidDataMap[];
  }

  async getSimpleDataForMap(): Promise<CovidDataMap[]> {
    const provinces = await this.http.get(this.apiUrl + '/provinces').toPromise() as any;
    console.log(provinces);
    const absolute = await this.http.get(this.apiUrl + '/area-info',
      {params: {area: provinces.items.map(i => i.areaId)}}).toPromise() as any;
    const relative = await this.http.get(this.apiUrl + '/area-info',
      {params: {area: provinces.items.map(i => i.areaId), relative: 'true'}}).toPromise() as any;
    console.log(absolute);
    console.log(relative);
    return absolute.items.map(item => {
      let obj: any = {};

      obj.provinceId = item.areaId;
      obj.provinceName = item.areaName;
      obj.geoId = `AUT.${item.areaId}_1`;
      obj = {
        ...obj, ...item.data.reduce((p, c: any) => ({...p, [c.identifier]: c.value}), {}),
        ...relative.items.find(ir => ir.areaId === item.areaId).data.reduce((p, c: any) => ({
          ...p,
          [c.identifier + 'Relative']: c.value,
        }), {}),
      };
      return obj;
    }) as CovidDataMap[];
  }


  async getInfosForAndMap(data: any, regions: Area[], forceUpdate: boolean): Promise<any> {
    const casesValuesToLoad = regions.filter(item => (!data[item.areaId] || forceUpdate));

    let newData = {};
    if (casesValuesToLoad.length > 0) {
      newData = this.mapResponseDataToObject(await this.http.get<any>(this.apiUrl + '/daily/cases',
        {params: {area: casesValuesToLoad.map(item => item.areaId.toString())}})
        .toPromise()
        .then(res => (res as { items: AreaResponse[] }).items));
    }
    return {...data, ...newData};
  }

  private mapResponseDataToObject(responseData: AreaResponse[], formatLabel = true, fieldname = 'date'): any {
    const obj = {labels: []};
    responseData.forEach((item, idx) => {
      obj[item.areaId] = item.data.reduce((d, c) => {
        c.values.forEach(e => d[e.identifier] = [...d[e.identifier] || [], e.value]);
        if (idx === 0) {
          obj.labels.push(formatLabel ? this.formatIfDate(c[fieldname]) : c[fieldname]);
        }
        return d;
      }, {});
    });
    return obj;
  }

  private formatIfDate(value: string): string {
    return !!Date.parse(value) ? this.datePipe.transform(new Date(value), 'dd.MM.yyyy') : value;
  }

  public buildCurrentChartData(loadedData: { labels: string[] }, selectedRegions: Area[], selectedElements: any[]):
    { colors: string[][], names: string[], labels: string[], values: number[][] } {
    const dataToShow = {dates: loadedData.labels};

    selectedRegions.forEach(item => dataToShow[item.areaId] = loadedData[item.areaId]);

    const chartData: { colors: string[][], names: string[], labels: string[], values: number[][] } = {
      values: [],
      colors: [],
      labels: [],
      names: [],
    };
    let idx = 0;
    const idxFromAreaIds = selectedRegions.filter(reg => reg.areaId < 10).map(item => item.areaId);
    const idxNotAreaIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !idxFromAreaIds.includes(n));

    chartData.colors = selectedRegions
      .reduce((arr, reg, i) => [...arr, ...selectedElements
        .map(e => this.getColorsFromMatrixAt(e.idx, reg.areaId < 10 ? reg.areaId :
          (idx >= idxNotAreaIds.length ? ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])[idx++ % 10] : idxNotAreaIds[idx++])))], []);
    chartData.names = selectedRegions.map(item => item.areaName)
      .reduce((p, c) => [...p, ...selectedElements
        .map(i => c + ' ' + i.text)], []);
    chartData.labels = loadedData.labels;
    chartData.values = selectedRegions
      .reduce((arr, reg) => [...arr, ...selectedElements
        .map(item => dataToShow[reg.areaId][item.id])], []);
    return chartData;
  }

  public getColorsFromMatrixAt(col: number, row: number): string {
    return ([[
      '#F5A9A9', '#FE2E2E', '#B40404', '#8A0808',
      '#8A4B08', '#FF8000', '#FA8258', '#F5DA81',
      '#F6D8CE', '#F6CECE'],
      [
        '#BCF5A9', '#80FF00', '#688A08', '#21610B',
        '#088A29', '#01DF3A', '#2EFE64', '#0B3B0B', '#81F79F',
        '#088A68'],
      [
        '#A9BCF5', '#2E9AFE', '#084B8A', '#5858FA',
        '#0101DF', '#210B61', '#3A01DF',
        '#8000FF', '#AC58FA', '#BCA9F5',
      ], [
        '#FF8000', '#FAAC58', '#F5D0A9', '#8A4B08',
        '#3B240B', '#61380B', '#F7BE81', '#F7BE81',
        '#F5BCA9',
      ], [
        '#A9F5F2', '#E0F8F7', '#58FAF4', '#01DFD7',
        '#0B615E', '#0A2A29', '#045FB4', '#81DAF5',
        '#00BFFF',
      ], [
        '#F6CEF5', '#F781F3', '#FE2EF7', '#B404AE',
        '#610B5E', '#B40486', '#FF00BF', '#F781D8',
        '#E2A9F3',
      ]])[col][row];
  }

  async loadProvinces(): Promise<TreeNode[]> {
    return this.getProvinces().then(result => result.map(p => ({
      data: {
        areaName: p.areaName,
        areaId: p.areaId,
        selectable: false,
      },
    })));
  }

  async loadProvincesAndDistrictsAsTableData(): Promise<TreeNode[]> {
    const provinces = await this.getProvinces();
    const districts = await this.getDistricts();

    return provinces.map(p =>
      ({
        data: {
          areaName: p.areaName,
          areaId: p.areaId,
          selectable: false,
        },
        children: districts.filter(d => d.areaId.toString(10).charAt(0) === p.areaId.toString(10))
          .map(d => ({
            data: {
              areaName: d.areaName, areaId: d.areaId, selectable: true,
            },
          })),
      }));
  }

  public getProvinceSituationPerDate(): Promise<Area[]> {
    return this.http.get<any>(this.apiUrl + '/daily/generalSituation', {params: {area: ['10']}})
      .toPromise().then(item => (item as { items: AreaResponse[] }).items);
  }

  getBasicInformation(): Promise<CovidOverview> {
    return this.http.get<CovidOverview>(this.apiUrl + '/overview').toPromise();
  }
}
