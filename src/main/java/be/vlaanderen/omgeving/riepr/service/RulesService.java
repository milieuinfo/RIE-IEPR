package be.vlaanderen.omgeving.riepr.service;

import org.apache.jena.reasoner.Reasoner;
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner;
import org.apache.jena.reasoner.rulesys.Rule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class RulesService {

    @Value("classpath:be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules")
    private Resource rulesFile;

    private Reasoner reasoner;
    private List<Rule> rules = new ArrayList<>();

    @PostConstruct
    public void loadRules() {
        try {
            // Load rules from the rules file
            List<Rule> rules = Rule.rulesFromURL(rulesFile.getURL().toString());
            
            // Create a GenericRuleReasoner with the loaded rules
            reasoner = new GenericRuleReasoner(rules);
            reasoner.setDerivationLogging(true);
            
            System.out.println("Successfully loaded rules from: " + getRulesFilePath());
        } catch (Exception e) {
            System.err.println("Error loading rules: " + e.getMessage());
            e.printStackTrace();
            // Create a default reasoner with no rules
            reasoner = new GenericRuleReasoner(new ArrayList<>());
        }
    }

    public Reasoner getReasoner() {
        return reasoner;
    }

    public String getRulesFilePath() {
        try {
            return rulesFile.getFile().getAbsolutePath();
        } catch (IOException e) {
            return "Rules file not found";
        }
    }
}