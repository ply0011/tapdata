/*
 * Copyright 2018 StreamSets Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.streamsets.pipeline.lib.dirspooler;

import com.streamsets.pipeline.lib.io.DirectoryPathCreationWatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.FileVisitOption;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.PathMatcher;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.attribute.FileTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;

import static com.streamsets.pipeline.lib.dirspooler.PathMatcherMode.GLOB;
import static com.streamsets.pipeline.lib.dirspooler.PathMatcherMode.REGEX;

public class LocalFileSystem implements WrappedFileSystem {
  private final static Logger LOG = LoggerFactory.getLogger(LocalFileSystem.class);

  public static final String PERMISSIONS = "permissions";

  private final FileSystem fs;
  private PathMatcher matcher;

  public LocalFileSystem(String filePattern, PathMatcherMode mode) {
    fs = FileSystems.getDefault();

    if (mode == GLOB) {
      matcher = fs.getPathMatcher("glob:" + filePattern);
    } else if (mode == REGEX) {
      matcher = fs.getPathMatcher("regex:" + filePattern);
    } else {
      throw new IllegalArgumentException("Unrecognized Path Matcher Mode: " + mode.getLabel());
    }
  }

  public boolean exists(WrappedFile filePath) {
    return Files.exists(Paths.get(filePath.getAbsolutePath()));
  }

  public void delete(WrappedFile filePath) throws IOException {
    Files.delete(Paths.get(filePath.getAbsolutePath()));
  }

  public void move(WrappedFile filePath, WrappedFile destFilePath) throws IOException {
    Files.move(Paths.get(filePath.getAbsolutePath()), Paths.get(destFilePath.getAbsolutePath()));
  }

  public long getLastModifiedTime(WrappedFile filePath) throws IOException {
    return getLastModifiedTime(Paths.get(filePath.getAbsolutePath()));
  }

  public long getChangedTime(WrappedFile filePath) throws IOException {
    return getChangedTime(Paths.get(filePath.getAbsolutePath()));
  }

  private long getLastModifiedTime(Path filePath) throws IOException {
    return Files.getLastModifiedTime(filePath).toMillis();
  }

  private long getChangedTime(Path filePath) throws IOException {
    return ((FileTime) Files.getAttribute(filePath, "unix:ctime")).toMillis();
  }

  public boolean isDirectory(WrappedFile filePath) {
    return Files.isDirectory(Paths.get(filePath.getAbsolutePath()));
  }

  public void addFiles(WrappedFile dirFile, WrappedFile startingFile, List<WrappedFile> toProcess, boolean includeStartingFile, boolean useLastModified) throws IOException {
    final long scanTime = System.currentTimeMillis();

    DirectoryStream.Filter<Path> filter = new DirectoryStream.Filter<Path>() {
      @Override
      public boolean accept(Path entry) throws IOException {
        boolean accept = false;
        // SDC-3551: Pick up only files with mtime strictly less than scan time.
        long mtime = getLastModifiedTime(entry);
        long ctime = getChangedTime(entry);
        long time = Math.max(mtime, ctime);

        if (entry != null && patternMatches(entry.getFileName().toString()) && time < scanTime) {
          if (startingFile == null || startingFile.toString().isEmpty()) {
            accept = true;
          } else {
            int compares = compare(getFile(entry.toString()), startingFile, useLastModified);
            accept = (compares == 0 && includeStartingFile) || (compares > 0);
          }
        }
        return accept;
      }
    };

    try (DirectoryStream<Path> matchingFile = Files.newDirectoryStream(Paths.get(dirFile.getAbsolutePath()), filter)) {
      for (Path file : matchingFile) {
        toProcess.add(getFile(file.toString()));
      }
    }
  }

  public void archiveFiles(WrappedFile archiveDirPath, List<WrappedFile> toProcess, long timeThreshold) throws IOException {
  EnumSet<FileVisitOption> opts = EnumSet.noneOf(FileVisitOption.class);
    Files.walkFileTree(Paths.get(archiveDirPath.getAbsolutePath()), opts, Integer.MAX_VALUE, new SimpleFileVisitor<Path>() {
      @Override
      public FileVisitResult visitFile(
          Path entry, BasicFileAttributes attributes
      ) throws IOException {
        if (matcher.matches(entry.getFileName()) && (
            timeThreshold - getLastModifiedTime(getFile(entry.toString())) > 0
        )) {
          toProcess.add(getFile(entry.toString()));
        }
        return FileVisitResult.CONTINUE;
      }
    });
  }

  public void addDirectory(WrappedFile dirPath, List<WrappedFile> directories) throws Exception {
    EnumSet<FileVisitOption> opts = EnumSet.noneOf(FileVisitOption.class);
      Files.walkFileTree(Paths.get(dirPath.getAbsolutePath()), opts, Integer.MAX_VALUE, new SimpleFileVisitor<Path>() {
        @Override
        public FileVisitResult preVisitDirectory(
            Path dirPath, BasicFileAttributes attributes
        ) throws IOException {
          directories.add(getFile(dirPath.toString()));
          return FileVisitResult.CONTINUE;
        }
      });
  }

  public WrappedFile getFile(String filePath) {
    Path path = Paths.get(filePath);
    return new LocalFile(path);
  }

  public WrappedFile getFile(String dirPath, String filePath) {
    Path path = Paths.get(dirPath, filePath);
    return new LocalFile(path);
  }

  public void mkdir(WrappedFile filePath) {
    new File(filePath.getAbsolutePath()).mkdir();
  }

  public boolean patternMatches(String fileName) {
    return matcher.matches(Paths.get(fileName));
  }

  public void handleOldFiles(WrappedFile dirpath, WrappedFile startingFile, boolean useLastModified, List<WrappedFile> toProcess) throws IOException {
    EnumSet<FileVisitOption> opts = EnumSet.noneOf(FileVisitOption.class);
    Files.walkFileTree(Paths.get(dirpath.getAbsolutePath()), opts, Integer.MAX_VALUE, new SimpleFileVisitor<Path>() {
      @Override
      public FileVisitResult visitFile(
          Path dirPath, BasicFileAttributes attributes
      ) throws IOException {

        if (compare(getFile(dirPath.toString()), startingFile, useLastModified) < 0) {
          toProcess.add(getFile(dirPath.toString()));
        }

        return FileVisitResult.CONTINUE;
      }
    });
  }

  // This method is a simple wrapper that lets us find the NoSuchFileException if that was the cause.
  public int compare(WrappedFile path1, WrappedFile path2, boolean useLastModified) {
    // why not just check if the file exists? Well, there is a possibility file gets moved/archived/deleted right after
    // that check. In that case we will still fail. So fail, and recover.
    try {
      if (useLastModified && !exists(path2)) {
        return 1;
      }
      return getComparator(useLastModified).compare(path1, path2);
    } catch (RuntimeException ex) {
      Throwable cause = ex.getCause();
      // Happens only in timestamp ordering.
      // Very unlikely this will happen, new file has to be added to the queue at the exact time when
      // the currentFile was consumed and archived while a new file has not yet been picked up for processing.
      // Ignore - we just add the new file, since this means this file is indeed newer
      // (else this would have been consumed and archived first)
      if (cause != null && cause instanceof NoSuchFileException) {
        LOG.debug("Starting file may have already been archived.", cause);
        return 1;
      }

      LOG.warn("Error while comparing files", ex);
      throw ex;
    }
  }

  public Comparator<WrappedFile> getComparator(boolean useLastModified) {
    return new Comparator<WrappedFile>() {
      @Override
      public int compare(WrappedFile file1, WrappedFile file2) {
        try {
          if (useLastModified) {
            // if comparing with folder last modified timestamp, always return true
            if (file2.toString().isEmpty()) {
              return 1;
            }

            if (!exists(file1)) {
              return 1;
            }

            long mtime1 = getLastModifiedTime(file1);
            long mtime2 = getLastModifiedTime(file2);

            long ctime1 = getChangedTime(file1);
            long ctime2 = getChangedTime(file2);

            long time1 = Math.max(mtime1, ctime1);
            long time2 = Math.max(mtime2, ctime2);

            int compares = Long.compare(time1, time2);
            if (compares != 0) {
              return compares;
            }
          }
          return file1.getFileName().compareTo(file2.getFileName());
        } catch (NoSuchFileException ex) {
          // Logged later, so don't log here.
          throw new RuntimeException(ex);
        } catch (IOException ex) {
          LOG.warn("Could not sort files due to IO Exception", ex);
          throw new RuntimeException(ex);
        }
      }
    };
  }

  public boolean findDirectoryPathCreationWatcher(List<WrappedFile> spoolDirPath) {
    List<Path> files = new ArrayList<>();
    for (WrappedFile wrappedFile : spoolDirPath) {
      files.add(Paths.get(wrappedFile.getAbsolutePath()));
    }
    DirectoryPathCreationWatcher watcher = new DirectoryPathCreationWatcher(files, 0);
    return !watcher.find().isEmpty();
  }
}
