/*
 * Copyright 2017 StreamSets Inc.
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
package com.streamsets.datacollector.util;

import com.fasterxml.jackson.annotation.JsonValue;
import com.google.common.base.Preconditions;
import com.google.common.base.Splitter;
import com.streamsets.pipeline.api.impl.Utils;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

public class Configuration {
  private static File fileRefsBaseDir;

  // Only RuntimeModules should be calling this
  public static void setFileRefsBaseDir(File dir) {
    fileRefsBaseDir = dir;
  }

  public abstract static class Ref {
    private String unresolvedValue;

    protected Ref(String unresolvedValue) {
      this.unresolvedValue = unresolvedValue;
    }

    public abstract String getPrefix();
    public abstract String getSuffix();
    @Deprecated
    public abstract String getDelimiter();

    protected static boolean isValueMyRef(String prefix, String suffix, String value) {
      String trimmed = value.trim();
      return trimmed.startsWith(prefix) && trimmed.endsWith(suffix);
    }

    @Deprecated
    protected static boolean isValueMyRef(String tokenDelimiter, String value) {
      String trimmed = value.trim();
      return trimmed.startsWith(tokenDelimiter) && trimmed.endsWith(tokenDelimiter);
    }

    public String getUnresolvedValue() {
      return unresolvedValue;
    }

    public static String getUnresolvedValueWithoutDelimiter(
        String unresolvedValue, String prefix, String suffix, String delimiter
    ) {
      String unquoted = unresolvedValue.replace("\"", "").replace("'", "");
      if (isValueMyRef(prefix, suffix, unresolvedValue)) {
        return unquoted.substring(prefix.length(), unquoted.length() - suffix.length());
      }
      return unquoted.substring(delimiter.length(), unquoted.length() - delimiter.length());
    }

    protected String getUnresolvedValueWithoutDelimiter() {
      return getUnresolvedValueWithoutDelimiter(unresolvedValue, getPrefix(), getSuffix(), getDelimiter());
    }

    public abstract String getValue();

    @Override
    public String toString() {
      return Utils.format("{}='{}'", getClass().getSimpleName(), unresolvedValue);
    }

  }

  private static class StringRef extends Ref {

    protected StringRef(String unresolvedValue) {
      super(unresolvedValue);
    }

    @Override
    public String getPrefix() {
      return "";
    }

    @Override
    public String getSuffix() {
      return "";
    }

    @Override
    public String getDelimiter() {
      return "";
    }

    @Override
    public String getValue() {
      return getUnresolvedValue();
    }

  }


  public static class FileRef extends Ref {
    @Deprecated
    public static final String DELIMITER = "@";
    public static final String PREFIX = "${file(";
    public static final String SUFFIX = ")}";

    public FileRef(String unresolvedValue) {
      super(unresolvedValue);
      Preconditions.checkState(fileRefsBaseDir != null, "fileRefsBaseDir has not been set");
    }

    public static boolean isValueMyRef(String value) {
      return isValueMyRef(PREFIX, SUFFIX, value) || isValueMyRef(DELIMITER, value);
    }

    @Override
    public String getPrefix() {
      return PREFIX;
    }

    @Override
    public String getSuffix() {
      return SUFFIX;
    }

    @Override
    public String getDelimiter() {
      return DELIMITER;
    }

    @Override
    public String getValue() {
      StringBuilder sb = new StringBuilder();
      File configFile;
      String configFileName = getUnresolvedValueWithoutDelimiter();
      if (Paths.get(configFileName).isAbsolute()) {
        configFile = new File(configFileName);
      } else {
        configFile = new File(fileRefsBaseDir, configFileName);
      }
      try (Reader reader = new FileReader(configFile)) {
        int c = reader.read();
        while (c > -1) {
          sb.append((char) c);
          c = reader.read();
        }
        return sb.toString();
      } catch (IOException ex) {
        throw new RuntimeException(ex);
      }
    }

  }

  private static class EnvRef extends Ref {
    @Deprecated
    private static final String DELIMITER = "$";
    private static final String PREFIX = "${env(";
    private static final String SUFFIX = ")}";

    protected EnvRef(String unresolvedValue) {
      super(unresolvedValue);
    }

    public static boolean isValueMyRef(String value) {
      return isValueMyRef(PREFIX, SUFFIX, value) || isValueMyRef(DELIMITER, value);
    }

    @Override
    public String getPrefix() {
      return PREFIX;
    }

    @Override
    public String getSuffix() { return SUFFIX; }

    @Override
    public String getDelimiter() {
      return DELIMITER;
    }

    @Override
    public String getValue() {
      return System.getenv(getUnresolvedValueWithoutDelimiter());
    }
  }

  public static Ref createRef(String value) {
    Ref ref;
    if (FileRef.isValueMyRef(value)) {
      ref = new FileRef(value);
    } else if (EnvRef.isValueMyRef(value)) {
      ref = new EnvRef(value);
    } else {
      ref = new StringRef(value);
    }
    return ref;
  }

  private Map<String, Ref> map;

  public Configuration() {
    this(new LinkedHashMap<String, Ref>());
  }

  private Configuration(Map<String, Ref> map) {
    this.map = map;
  }

  public Configuration getUnresolvedConfiguration() {
    Map<String, Ref> subSetMap = new LinkedHashMap<>();
    for (Map.Entry<String, Ref> entry : map.entrySet()) {
      subSetMap.put(entry.getKey(), new StringRef(entry.getValue().getUnresolvedValue()));
    }
    return new Configuration(subSetMap);
  }

  public Configuration getSubSetConfiguration(String namePrefix) {
    Preconditions.checkNotNull(namePrefix, "namePrefix cannot be null");
    Map<String, Ref> subSetMap = new LinkedHashMap<>();
    for (Map.Entry<String, Ref> entry : map.entrySet()) {
      if (entry.getKey().startsWith(namePrefix)) {
        subSetMap.put(entry.getKey(), entry.getValue());
      }
    }
    return new Configuration(subSetMap);
  }

  @JsonValue
  public Map<String, String> getValues() {
    Map<String, String> values = new LinkedHashMap<>();
    for (Map.Entry<String, Ref> entry : map.entrySet()) {
      values.put(entry.getKey(), entry.getValue().getValue());
    }
    return values;
  }

  public Set<String> getNames() {
    return new HashSet<>(map.keySet());
  }

  public boolean hasName(String name) {
    Preconditions.checkNotNull(name, "name cannot be null");
    return map.containsKey(name);
  }

  public void set(String name, String value) {
    Preconditions.checkNotNull(name, "name cannot be null");
    Preconditions.checkNotNull(value, "value cannot be null, use unset");
    map.put(name, createRef(value));
  }

  public void unset(String name) {
    Preconditions.checkNotNull(name, "name cannot be null");
    map.remove(name);
  }

  public void set(String name, int value) {
    set(name, Integer.toString(value));
  }

  public void set(String name, long value) {
    set(name, Long.toString(value));
  }

  public void set(String name, boolean value) {
    set(name, Boolean.toString(value));
  }

  private String get(String name) {
    Preconditions.checkNotNull(name, "name cannot be null");
    return map.containsKey(name) ? map.get(name).getValue() : null;
  }

  public String get(String name, String defaultValue) {
    String value = get(name);
    return (value != null) ? value : defaultValue;
  }

  public long get(String name, long defaultValue) {
    String value = get(name);
    return (value != null) ? Long.parseLong(value) : defaultValue;
  }

  public int get(String name, int defaultValue) {
    String value = get(name);
    return (value != null) ? Integer.parseInt(value) : defaultValue;
  }

  public boolean get(String name, boolean defaultValue) {
    String value = get(name);
    return (value != null) ? Boolean.parseBoolean(value) : defaultValue;
  }

  public void load(Reader reader, boolean loadIncludes) throws IOException {
    Preconditions.checkNotNull(reader, "reader cannot be null");
    Properties props = new Properties();
    props.load(reader);
    for (Map.Entry entry : props.entrySet()) {
      map.put((String) entry.getKey(), createRef((String) entry.getValue()));
    }
    if (loadIncludes) {
      loadConfigIncludes();
    }
    reader.close();
  }

  public void load(Reader reader) throws IOException {
    load(reader, true);
  }

  public static final String CONFIG_INCLUDES = "config.includes";

  void loadConfigIncludes() {
    String includes = get(CONFIG_INCLUDES, null);
    if (includes != null) {
      map.remove(CONFIG_INCLUDES);
      for (String include : Splitter.on(",").trimResults().omitEmptyStrings().split(includes)) {
        File file = new File(fileRefsBaseDir, include);
        try (Reader reader = new FileReader(file)) {
          Configuration conf = new Configuration();
          conf.load(reader);
          conf.map.remove(CONFIG_INCLUDES);
          for (Map.Entry<String, Ref> entry : conf.map.entrySet()) {
            map.put(entry.getKey(), entry.getValue());
          }
        } catch (IOException ex) {
          throw new IllegalArgumentException(Utils.format("Include config file '{}' could not be read: {}",
              file.getAbsolutePath(),
              ex.toString()
          ));
        }
      }
    }
  }

  public void save(Writer writer) throws IOException {
    Preconditions.checkNotNull(writer, "writer cannot be null");
    Properties props = new Properties();
    for (Map.Entry<String, Ref> entry : map.entrySet()) {
      props.setProperty(entry.getKey(), entry.getValue().getUnresolvedValue());
    }
    props.store(writer, "");
    writer.close();
  }

  @Override
  public String toString() {
    return Utils.format("Configuration['{}']", map);
  }

}
