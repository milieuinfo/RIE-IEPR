package be.vlaanderen.omgeving.riepr.controller;

import org.apache.spark.sql.SparkSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class MetricsController {

    private final SparkSession spark;

    public MetricsController(SparkSession spark) {
        this.spark = spark;
    }

    @GetMapping("/metrics")
    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // JVM metrics
        metrics.put("spark.executor.memory", spark.sparkContext().getConf().get("spark.executor.memory", "default"));
        metrics.put("spark.driver.memory", spark.sparkContext().getConf().get("spark.driver.memory", "default"));
        metrics.put("spark.master", spark.sparkContext().master());
        metrics.put("appName", spark.sparkContext().appName());

        // Add more metrics from Spark's status APIs if needed
        return metrics;
    }
}
