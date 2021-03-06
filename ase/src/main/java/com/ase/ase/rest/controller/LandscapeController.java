package com.ase.ase.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import com.ase.ase.dao.PopulationRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin("*")
@RestController
public class LandscapeController {
   
    @Autowired
    private PopulationRepository populationRepository;

    @CrossOrigin
    @GetMapping(value = "/provinces", produces = "application/json")
    @ResponseBody
    public ResponseEntity getAllProvincesAndAustria(){
        return ResponseEntity.ok(populationRepository.getAllProvincesAndAustria());            
    }

    @CrossOrigin
    @GetMapping(value = "/districts", produces = "application/json")
    @ResponseBody
    public ResponseEntity getAllDistricts(){
        return ResponseEntity.ok(populationRepository.getAllDistricts());
    }
    
}
