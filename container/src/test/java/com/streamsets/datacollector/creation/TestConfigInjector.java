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
package com.streamsets.datacollector.creation;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.streamsets.datacollector.config.ConfigDefinition;
import com.streamsets.datacollector.config.StageConfiguration;
import com.streamsets.datacollector.config.StageDefinition;
import com.streamsets.datacollector.config.StageLibraryDefinition;
import com.streamsets.datacollector.credential.CredentialEL;
import com.streamsets.datacollector.definition.StageDefinitionExtractor;
import com.streamsets.datacollector.validation.Issue;
import com.streamsets.pipeline.api.BatchMaker;
import com.streamsets.pipeline.api.Config;
import com.streamsets.pipeline.api.ConfigDef;
import com.streamsets.pipeline.api.ConfigDefBean;
import com.streamsets.pipeline.api.ListBeanModel;
import com.streamsets.pipeline.api.MultiValueChooserModel;
import com.streamsets.pipeline.api.StageDef;
import com.streamsets.pipeline.api.StageException;
import com.streamsets.pipeline.api.ValueChooserModel;
import com.streamsets.pipeline.api.base.BaseEnumChooserValues;
import com.streamsets.pipeline.api.base.BaseSource;
import com.streamsets.pipeline.api.credential.CredentialStore;
import com.streamsets.pipeline.api.credential.CredentialValue;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("unchecked")
public class TestConfigInjector {

  public enum E { A, B }

  public class MyConfigBean {
    public List<E> enums;
  }

  public static class SubBean {

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.STRING,
      defaultValue = "B",
      required = false
    )
    public String subBeanString;


    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.LIST,
      defaultValue = "[\"3\"]",
      required = true
    )
    public List<String> subBeanList;

  }

  public static class Bean {

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.NUMBER,
      defaultValue = "1",
      required = false
    )
    public int beanInt;

    @ConfigDefBean
    public SubBean beanSubBean;

  }

  public static class EValueChooser extends BaseEnumChooserValues<E> {
    public EValueChooser() {
      super(E.class);
    }
  }

  @StageDef(version = 1, label = "L", onlineHelpRefUrl = "")
  public static class MySource extends BaseSource {

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.LIST,
      defaultValue = "[\"1\"]",
      required = true
    )
    public List<String> list;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.LIST,
      defaultValue = "[\"2\"]",
      required = true,
      evaluation = ConfigDef.Evaluation.EXPLICIT
    )
    public List<String> listExplicit;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.MAP,
      defaultValue = "{\"a\" : \"1\"}",
      required = true
    )
    public Map<String, String> map;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.MAP,
      defaultValue = "{\"a\" : \"2\"}",
      required = true,
      evaluation = ConfigDef.Evaluation.EXPLICIT
    )
    public Map<String, String> mapExplicit;

    @ConfigDefBean
    public Bean bean;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.MODEL,
      required = true
    )
    @ListBeanModel
    public List<Bean> complexField;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.STRING,
      required = true
    )
    public String stringJavaDefault = "Hello";

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.NUMBER,
      required = true
    )
    public int intValue;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.NUMBER,
      required = true
    )
    public int intJavaDefault = 5;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.MODEL,
      required = true
    )
    @ValueChooserModel(EValueChooser.class)
    public E enumSJavaDefault = E.B;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.MODEL,
      required = true
    )
    @MultiValueChooserModel(EValueChooser.class)
    public List<E> enumMJavaDefault = Arrays.asList(E.A);

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.MODEL,
      required = true
    )
    @ValueChooserModel(EValueChooser.class)
    public E enumSNoDefaultAlAll;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.CREDENTIAL,
      required = true,
      defaultValue = "${credential:get('cs','all','g')}",
      elDefs = CredentialEL.class
    )
    public CredentialValue password1;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.CREDENTIAL,
      required = true,
      defaultValue = "${a}",
      elDefs = CredentialEL.class
    )
    public CredentialValue password2;

    @ConfigDef(
      label = "L",
      type = ConfigDef.Type.CREDENTIAL,
      required = true,
      defaultValue = "b",
      elDefs = CredentialEL.class
    )
    public CredentialValue password3;

    @Override
    public String produce(String lastSourceOffset, int maxBatchSize, BatchMaker batchMaker) throws StageException {
      return null;
    }
  }


  @Before
  public void setupCredentials() {
    CredentialStore cs = new CredentialStore() {
      @Override
      public List<CredentialStore.ConfigIssue> init(Context context) {
        return null;
      }

      @Override
      public CredentialValue get(String group, String name, String credentialStoreOptions) throws StageException {
        return () -> "secret";
      }

      @Override
      public void destroy() {

      }
    };
    CredentialEL.setCredentialStores(org.testcontainers.shaded.com.google.common.collect.ImmutableMap.of("cs", cs));
  }

  @After
  public void cleanupCredentials() {
    CredentialEL.setCredentialStores(null);
  }

  private static Map<String, Object> constants = ImmutableMap.of("a", "A");

  private ConfigInjector.StageInjectorContext context;
  private StageDefinition stageDef;
  private List<Issue> issues;
  private ConfigDefinition listConfig;
  private ConfigDefinition mapConfig;

  @Before
  public void setUp() {
    StageLibraryDefinition libraryDef = Mockito.mock(StageLibraryDefinition.class);
    Mockito.when(libraryDef.getClassLoader()).thenReturn(Thread.currentThread().getContextClassLoader());
    stageDef = StageDefinitionExtractor.get().extract(libraryDef, MySource.class, "");
    issues = new ArrayList<>();
    context = new ConfigInjector.StageInjectorContext(stageDef, Mockito.mock(StageConfiguration.class), constants, issues);
    listConfig = stageDef.getConfigDefinition("list");
    mapConfig = stageDef.getConfigDefinition("map");
  }

  @Test
  public void testInjectConfigsToObject() throws Exception {
    Map<String, Object> values = ImmutableMap.<String, Object>builder()
      .put("intValue", 666)
      .put("enumSNoDefaultAlAll", "A")
      .put("bean.beanInt", 1987)
      .put("bean.beanSubBean.subBeanString", "StreamSets")
      .put("complexField", ImmutableList.of(ImmutableMap.of(
        "beanInt", 55
      )))
      .build();

    StageConfiguration configuration = Mockito.mock(StageConfiguration.class);
    Mockito.when(configuration.getConfig(Mockito.anyString())).then(invocation -> {
      String name = (String)invocation.getArguments()[0];
      return new Config(name, values.get(name));
    });

    ConfigInjector.Context context = new ConfigInjector.StageInjectorContext(stageDef, configuration, constants, issues);

    MySource stage = new MySource();
    ConfigInjector.get().injectConfigsToObject(stage, context);

    Assert.assertTrue(issues.isEmpty());

    // Explicitly filled values
    Assert.assertEquals(1987, stage.bean.beanInt);
    Assert.assertEquals("StreamSets", stage.bean.beanSubBean.subBeanString);
    Assert.assertEquals(1, stage.bean.beanSubBean.subBeanList.size());
    Assert.assertEquals("3", stage.bean.beanSubBean.subBeanList.get(0));
    Assert.assertEquals(1, stage.complexField.size());
    Assert.assertEquals(55, stage.complexField.get(0).beanInt);
    Assert.assertEquals(666, stage.intValue);
    Assert.assertEquals(666, stage.intValue);

    // Credentials
    Assert.assertEquals("secret", stage.password1.get());
    Assert.assertEquals("A", stage.password2.get());
    Assert.assertEquals("b", stage.password3.get());

    // Values loaded from "defaults"
    Assert.assertEquals("Hello", stage.stringJavaDefault);
    Assert.assertEquals(5, stage.intJavaDefault);
    Assert.assertEquals(E.B, stage.enumSJavaDefault);
    Assert.assertEquals(E.A, stage.enumSNoDefaultAlAll);
    Assert.assertEquals(1, stage.enumMJavaDefault.size());
    Assert.assertEquals(E.A, stage.enumMJavaDefault.get(0));
  }

  @Test
  public void testToListBasic() {
    Object value = ImmutableList.of("A");
    Object v = ConfigInjector.get().toList(value, listConfig, "g", "s", context, null);
    Assert.assertEquals(ImmutableList.of("A"), v);
    Assert.assertTrue(issues.isEmpty());
  }

  @Test
  public void testToListResolveImplicitEL() {
    Object value = ImmutableList.of("${a}");
    Object v = ConfigInjector.get().toList(value, listConfig, "g", "s", context, null);
    Assert.assertEquals(ImmutableList.of("A"), v);
    Assert.assertTrue(issues.isEmpty());
  }

  @Test
  public void testToListErrorOnNullElement() {
    Object value = Arrays.asList(null, "A");
    Object v = ConfigInjector.get().toList(value, listConfig, "g", "s", context, null);
    Assert.assertNull(v);
    Assert.assertFalse(issues.isEmpty());
  }

  @Test
  public void testToListInvalidEL() {
    Object value = ImmutableList.of("${a");
    Object v = ConfigInjector.get().toList(value, listConfig, "g", "s", context, null);
    Assert.assertNull(v);
    Assert.assertFalse(issues.isEmpty());
  }

  @Test
  public void testToListInvalidInputType() {
    Object value = "x";
    Object v = ConfigInjector.get().toList(value, listConfig, "g", "s", context, null);
    Assert.assertNull(v);
    Assert.assertFalse(issues.isEmpty());
  }

  @Test
  public void testToListExplicitEL() {
    Object value = ImmutableList.of("${a}");
    Object v = ConfigInjector.get().toList(value, stageDef.getConfigDefinition("listExplicit"), "g", "s", context, null);
    Assert.assertEquals(ImmutableList.of("${a}"), v);
    Assert.assertTrue(issues.isEmpty());
  }

  @Test
  public void testToListWithList() throws Exception {
    Object value = ImmutableList.of("A");
    Object v = ConfigInjector.get().toList(value, listConfig, "g", "s", context, MyConfigBean.class.getField("enums"));
    Assert.assertEquals(ImmutableList.of(E.A), v);
    Assert.assertTrue(issues.isEmpty());
  }

  @Test
  public void testToMapBasic() {
    Object value = ImmutableList.of(ImmutableMap.of("key", "a", "value", 2));
    Object v = ConfigInjector.get().toMap(value, mapConfig, "g", "s", context);
    Assert.assertEquals(ImmutableMap.of("a", 2), v);
    Assert.assertTrue(issues.isEmpty());
  }

  @Test
  public void testToMapImplicitEL() {
    Object value = ImmutableList.of(ImmutableMap.of("key", "a", "value", "${a}"));
    Object v = ConfigInjector.get().toMap(value, mapConfig, "g", "s", context);
    Assert.assertEquals(ImmutableMap.of("a", "A"), v);
    Assert.assertTrue(issues.isEmpty());
  }

  @Test
  public void testToMapInvalidInputType() {
    Map map = new HashMap();
    map.put("key", null);
    map.put("value", "A");
    Object value = ImmutableList.of(map);
    Object v = ConfigInjector.get().toMap(value, mapConfig, "g", "s", context);
    Assert.assertNull(v);
    Assert.assertFalse(issues.isEmpty());

    value = "x";
    v = ConfigInjector.get().toMap(value, mapConfig, "g", "s", context);
    Assert.assertNull(v);
    Assert.assertFalse(issues.isEmpty());

    value = ImmutableList.of(1);
    v = ConfigInjector.get().toMap(value, mapConfig, "g", "s", context);
    Assert.assertNull(v);
    Assert.assertFalse(issues.isEmpty());
  }

  @Test
  public void testToMapExplicitEL() {
    Object value = ImmutableList.of(ImmutableMap.of("key", "a", "value", "${a}"));
    Object v = ConfigInjector.get().toMap(value, stageDef.getConfigDefinition("mapExplicit"), "g", "s", context);
    Assert.assertNotNull(v);
    Assert.assertEquals(ImmutableMap.of("a", "${a}"), v);
    Assert.assertTrue(issues.isEmpty());
  }

}
