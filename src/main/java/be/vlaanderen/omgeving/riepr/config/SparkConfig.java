package be.vlaanderen.omgeving.riepr.config;

import org.apache.spark.SparkConf;
import org.apache.spark.sql.SparkSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SparkConfig {

    @Bean
    public SparkSession sparkSession() {
        SparkConf conf = new SparkConf()
                .setAppName("RieprApp")
                .setMaster("local[*]")       // adjust for cluster if needed
                .set("spark.ui.enabled", "false"); // disable Spark UI to avoid javax.servlet

        return SparkSession.builder()
                .config(conf)
                .getOrCreate();
    }
}
