package com.ase.ase.rest.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class DailyHospitalSituationPerProvinceDto {

    private final int provinceId;
    private final List<HospitalSituationPerDate> situations;

    public DailyHospitalSituationPerProvinceDto(int provinceId, List<HospitalSituationPerDate> situations) {
        this.provinceId = provinceId;
        this.situations = situations;
    }


    @JsonProperty("provinceId")
    public int getProvinceId() {
        return provinceId;
    }
    @JsonProperty("situations")
    public List<HospitalSituationPerDate> getSituations() {
        return situations;
    }
}
