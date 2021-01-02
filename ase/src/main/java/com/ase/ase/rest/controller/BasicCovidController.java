package com.ase.ase.rest.controller;

import com.ase.ase.dao.TimelineRepository;
import com.ase.ase.rest.response.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin("*")
@RestController
@RequestMapping("/daily")
public class BasicCovidController {

    @Autowired
    private TimelineRepository timelineRepository;

    @CrossOrigin
    @GetMapping(value = "/{province-id}", produces = "application/json")
    @ResponseBody
    public ResponseEntity<DailyCasesPerProvinceDto> listNewCasesFor(@PathVariable("province-id") int provinceId) {
        return ResponseEntity.ok(
                new DailyCasesPerProvinceDto(
                        provinceId,
                        timelineRepository.findAllBy(provinceId)));
    }


    @CrossOrigin
    @GetMapping(value = "/hospital/{province-id}", produces = "application/json")
    @ResponseBody
    public static ResponseEntity<HospitalSituationPerDateDto> listHospitalCasesFor(@PathVariable("province-id") int provinceId) {
        return ResponseEntity.ok(
                new HospitalSituationPerDateDto(provinceId, Arrays.asList(
                        new HospitalSituationPerDate("10.10.2020", 12, 10),
                        new HospitalSituationPerDate("12.10.2020", 12, 12))));

    }

    @CrossOrigin
    @GetMapping(value = "/tableData/{province-id}", produces = "application/json")
    @ResponseBody
    public ResponseEntity<TableDataPerProvinceDto> listNewTableDataFor(@PathVariable("province-id") int provinceId) {
        return ResponseEntity.ok(
                new TableDataPerProvinceDto(provinceId, Arrays.asList(
                        new TableDataPerDate("10.10.2020", 12, 10, Arrays.asList(
                                new HospitalSituationPerDate("10.10.2020", 12, 10),
                                new HospitalSituationPerDate("12.10.2020", 12, 12))),
                        new TableDataPerDate("12.10.2020", 12, 12, Arrays.asList(
                                new HospitalSituationPerDate("10.10.2020", 12, 10),
                                new HospitalSituationPerDate("12.10.2020", 12, 12))))));


    }

}
