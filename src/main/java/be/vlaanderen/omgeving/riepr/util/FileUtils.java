package be.vlaanderen.omgeving.riepr.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class FileUtils {

    public static List<File> findFilesRecursively(File dir, String extension) throws IOException {
        List<File> result = new ArrayList<>();
        if (dir.exists() && dir.isDirectory()) {
            Files.walk(dir.toPath())
                .filter(path -> path.toString().endsWith(extension))
                .forEach(path -> result.add(path.toFile()));
        }
        return result;
    }

    public static void ensureDirectoryExists(File directory) throws IOException {
        if (!directory.exists()) {
            Files.createDirectories(directory.toPath());
        }
    }

    public static String getRelativePath(File file, File baseDir) {
        Path filePath = file.toPath();
        Path basePath = baseDir.toPath();
        return basePath.relativize(filePath).toString();
    }

    public static void copyDirectoryStructure(File source, File target) throws IOException {
        if (!source.exists() || !source.isDirectory()) {
            return;
        }
        
        if (!target.exists()) {
            Files.createDirectories(target.toPath());
        }
        
        File[] files = source.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    File newTargetDir = new File(target, file.getName());
                    copyDirectoryStructure(file, newTargetDir);
                }
            }
        }
    }
}