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
package com.streamsets.pipeline.stage.processor.http;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Sets;
import com.google.common.io.Resources;
import com.streamsets.pipeline.api.Field;
import com.streamsets.pipeline.api.Processor;
import com.streamsets.pipeline.api.Record;
import com.streamsets.pipeline.config.Compression;
import com.streamsets.pipeline.config.DataFormat;
import com.streamsets.pipeline.lib.http.AuthenticationType;
import com.streamsets.pipeline.lib.http.HttpMethod;
import com.streamsets.pipeline.lib.http.oauth2.OAuth2ConfigBean;
import com.streamsets.pipeline.lib.http.oauth2.OAuth2GrantTypes;
import com.streamsets.pipeline.lib.http.oauth2.SigningAlgorithms;
import com.streamsets.pipeline.sdk.ProcessorRunner;
import com.streamsets.pipeline.sdk.RecordCreator;
import com.streamsets.pipeline.sdk.StageRunner;
import com.streamsets.pipeline.stage.util.http.HttpStageTestUtil;
import com.streamsets.pipeline.stage.util.http.HttpStageUtil;
import com.streamsets.testing.SingleForkNoReuseTest;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.test.JerseyTest;
import org.glassfish.jersey.test.TestProperties;
import org.junit.Test;
import org.junit.experimental.categories.Category;

import javax.inject.Singleton;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Signature;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static com.streamsets.pipeline.lib.http.oauth2.OAuth2GrantTypes.CLIENT_CREDENTIALS;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@Category(SingleForkNoReuseTest.class)
public class HttpProcessorIT extends JerseyTest {
  private static String token;
  private static int tokenGetCount = 0;
  private static final String CLIENT_ID = "streamsets";
  private static final String CLIENT_SECRET = "awesomeness";
  private static final String USERNAME = "streamsets";
  private static final String PASSWORD = "live long and prosper";

  public static final String JWT_BEARER_TOKEN = "urn:ietf:params:oauth:grant-type:jwt-bearer";
  private static final String ALGORITHM = "{\"alg\":\"RS256\",\"typ\":\"JWT\"}";
  private static final String JWT = "{" +
      "\"iss\":\"tester@testaccount.com\"," +
      "\"scope\":\"https://www.sdc.com/pipelines/awesomeness\"," +
      "\"aud\":\"https://www.sdc.com/token\"," +
      "\"exp\":1328554385," +
      "\"iat\":1328550785" +
      "}";

  private static KeyPair keyPair;

  private static String getBody(String path) {
    try {
      return Resources.toString(Resources.getResource(path), Charsets.UTF_8);
    } catch (IOException e) {
      throw new RuntimeException("Failed to read test resource: " + path);
    }
  }

  @Path("/test/get")
  @Produces(MediaType.APPLICATION_JSON)
  public static class TestGet {
    @GET
    public Response get(@Context HttpHeaders headers) {
      if (token != null && !headers.getRequestHeader(HttpHeaders.AUTHORIZATION).get(0).equals("Bearer " + token)) {
        return Response.status(Response.Status.FORBIDDEN).build();
      }
      return Response.ok(getBody("http/get_response.json"))
          .header("x-test-header", "StreamSets")
          .header("x-list-header", ImmutableList.of("a", "b"))
          .build();
    }
  }

  @Path("/test/getzip")
  @Produces(MediaType.APPLICATION_OCTET_STREAM)
  public static class TestGetZip {
    @GET
    public Response get(@Context HttpHeaders headers) throws Exception {
      if (token != null && !headers.getRequestHeader(HttpHeaders.AUTHORIZATION).get(0).equals("Bearer " + token)) {
        return Response.status(Response.Status.FORBIDDEN).build();
      }
      return Response.ok(new File(Resources.getResource("http/compressed.gz").getPath()))
          .header("x-test-header", "StreamSets")
          .header("x-list-header", ImmutableList.of("a", "b"))
          .build();
    }
  }

  public static class TestInput {
    public TestInput() {};

    public TestInput(String hello) {
      this.hello = hello;
    }

    @JsonProperty("hello")
    public String hello;
  }

  @Path("/tokenresetstream")
  @Produces("application/json")
  public static class StreamTokenResetResource {

    @GET
    public Response getStream(@Context HttpHeaders headers) {
      if (token != null) {
        String auth = headers.getRequestHeader(HttpHeaders.AUTHORIZATION).get(0);
        if (auth == null || !auth.equals("Bearer " + token)) {
          return Response.status(Response.Status.FORBIDDEN).build();
        }
      }
      if (tokenGetCount == 1) {
        // Force the source to get a new token
        token = RandomStringUtils.randomAlphanumeric(16);
      }
      return Response.ok(getBody("http/get_response.json"))
          .header("x-test-header", "StreamSets")
          .header("x-list-header", ImmutableList.of("a", "b"))
          .build();
    }
  }

  @Path("/credentialsToken")
  @Singleton
  public static class Auth2Resource {

    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    @POST
    public Response post(
        @FormParam(OAuth2ConfigBean.GRANT_TYPE_KEY) String type,
        @FormParam(OAuth2ConfigBean.CLIENT_ID_KEY) String clientId,
        @FormParam(OAuth2ConfigBean.CLIENT_SECRET_KEY) String clientSecret,
        @FormParam(OAuth2ConfigBean.RESOURCE_OWNER_KEY) String username,
        @FormParam(OAuth2ConfigBean.PASSWORD_KEY) String password
    ) {
      if ((OAuth2ConfigBean.CLIENT_CREDENTIALS_GRANT.equals(type) && CLIENT_ID.equals(clientId) && CLIENT_SECRET.equals(clientSecret)) ||
          (OAuth2ConfigBean.RESOURCE_OWNER_GRANT.equals(type) && USERNAME.equals(username) && PASSWORD.equals(password))) {
        token = RandomStringUtils.randomAlphanumeric(16);
        String tokenResponse = "{\n" +
            "  \"token_type\": \"Bearer\",\n" +
            "  \"expires_in\": \"3600\",\n" +
            "  \"ext_expires_in\": \"0\",\n" +
            "  \"expires_on\": \"1484788319\",\n" +
            "  \"not_before\": \"1484784419\",\n" +
            "  \"access_token\": \"" + token + "\"\n" +
            "}";
        tokenGetCount++;
        return Response.ok().entity(tokenResponse).build();
      }
      return Response.status(Response.Status.FORBIDDEN).build();
    }
  }

  @Path("/basicToken")
  @Singleton
  public static class Auth2BasicResource {

    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    @POST
    public Response post(
        @Context HttpHeaders h,
        @FormParam(OAuth2ConfigBean.GRANT_TYPE_KEY) String type
    ) {
      String[] creds = new String(
          Base64.decodeBase64(h.getHeaderString(HttpHeaders.AUTHORIZATION).substring("Basic ".length())), org.apache.commons.codec.Charsets.UTF_8)
          .split(":");
      if (creds.length == 2 && creds[0].equals(CLIENT_ID) && creds[1].equals(CLIENT_SECRET)) {
        token = RandomStringUtils.randomAlphanumeric(16);
        String tokenResponse = "{\n" +
            "  \"token_type\": \"Bearer\",\n" +
            "  \"expires_in\": \"3600\",\n" +
            "  \"ext_expires_in\": \"0\",\n" +
            "  \"expires_on\": \"1484788319\",\n" +
            "  \"not_before\": \"1484784419\",\n" +
            "  \"access_token\": \"" + token + "\"\n" +
            "}";
        tokenGetCount++;
        return Response.ok().entity(tokenResponse).build();
      }
      return Response.status(Response.Status.FORBIDDEN).build();
    }
  }

  @Path("/jwtToken")
  @Singleton
  public static class Auth2JWTResource {

    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    @POST
    public Response post(
        @Context HttpHeaders h,
        @FormParam(OAuth2ConfigBean.GRANT_TYPE_KEY) String type,
        @FormParam(OAuth2ConfigBean.ASSERTION_KEY) String assertion
    ) throws Exception {
      type = URLDecoder.decode(type, "UTF-8");
      if (!type.equals(JWT_BEARER_TOKEN)) {
        return Response.status(Response.Status.FORBIDDEN).build();
      }
      String[] creds = assertion.split("\\.");
      Signature sig = Signature.getInstance("SHA256WithRSA");
      sig.initSign(keyPair.getPrivate());
      sig.update((creds[0] + "." + creds[1]).getBytes());
      byte[] signatureBytes = sig.sign();
      if (!Arrays.equals(signatureBytes, Base64.decodeBase64(creds[2]))) {
        return Response.status(Response.Status.FORBIDDEN).build();
      }
      String base64dAlg = new String(Base64.decodeBase64(creds[0]));
      String base64dJWT = new String(Base64.decodeBase64(creds[1]));
      if (base64dAlg.equals(ALGORITHM) &&
          base64dJWT.equals(JWT)) {
        token = RandomStringUtils.randomAlphanumeric(16);
        String tokenResponse = "{\n" +
            "  \"token_type\": \"Bearer\",\n" +
            "  \"expires_in\": \"3600\",\n" +
            "  \"ext_expires_in\": \"0\",\n" +
            "  \"expires_on\": \"1484788319\",\n" +
            "  \"not_before\": \"1484784419\",\n" +
            "  \"access_token\": \"" + token + "\"\n" +
            "}";
        tokenGetCount++;
        return Response.ok().entity(tokenResponse).build();
      }
      return Response.status(Response.Status.FORBIDDEN).build();
    }
  }

  @Path("/resourceToken")
  @Singleton
  public static class Auth2ResourceOwnerWithIdResource {

    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    @POST
    public Response post(
        @FormParam(OAuth2ConfigBean.GRANT_TYPE_KEY) String type,
        @FormParam(OAuth2ConfigBean.CLIENT_ID_KEY) String clientId,
        @FormParam(OAuth2ConfigBean.CLIENT_SECRET_KEY) String clientSecret,
        @FormParam(OAuth2ConfigBean.RESOURCE_OWNER_KEY) String username,
        @FormParam(OAuth2ConfigBean.PASSWORD_KEY) String password
    ) {
      token = RandomStringUtils.randomAlphanumeric(16);
      String tokenResponse = "{\n" +
          "  \"token_type\": \"Bearer\",\n" +
          "  \"expires_in\": \"3600\",\n" +
          "  \"ext_expires_in\": \"0\",\n" +
          "  \"expires_on\": \"1484788319\",\n" +
          "  \"not_before\": \"1484784419\",\n" +
          "  \"access_token\": \"" + token + "\"\n" +
          "}";
      if ((OAuth2ConfigBean.RESOURCE_OWNER_GRANT.equals(type) &&
          USERNAME.equals(username) &&
          PASSWORD.equals(password) &&
          CLIENT_ID.equals(clientId) &&
          CLIENT_SECRET.equals(clientSecret)
      )) {
        tokenGetCount++;
        return Response.ok().entity(tokenResponse).build();
      }
      return Response.status(Response.Status.FORBIDDEN).build();
    }
  }

  @Path("/test/put")
  @Consumes(MediaType.APPLICATION_JSON)
  public static class TestPut {
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response put(TestInput input) {
      return Response.ok(
          "{\"hello\":\"" + input.hello + "\"}"
      ).build();
    }
  }

  @Path("/test/xml/get")
  @Produces(MediaType.APPLICATION_XML)
  public static class TestXmlGet {
    @GET
    public Response get() {
      return Response.ok("<r><e>Hello</e><e>Bye</e></r>").build();
    }
  }

  @Override
  protected Application configure() {
    forceSet(TestProperties.CONTAINER_PORT, "0");
    return new ResourceConfig(
        Sets.newHashSet(
            TestGet.class,
            TestGetZip.class,
            TestPut.class,
            HttpStageTestUtil.TestPostCustomType.class,
            TestXmlGet.class,
            StreamTokenResetResource.class,
            Auth2Resource.class,
            Auth2ResourceOwnerWithIdResource.class,
            Auth2BasicResource.class,
            Auth2JWTResource.class
        )
    );
  }

  @Test
  public void testHttpGetDefaultHeaderOutput() throws Exception {
    HttpProcessorConfig conf = new HttpProcessorConfig();
    conf.httpMethod = HttpMethod.GET;
    conf.outputField = "/output";
    conf.dataFormat = DataFormat.TEXT;
    conf.resourceUrl = getBaseUri() + "test/get";
    conf.headerOutputLocation = HeaderOutputLocation.HEADER;

    Record record = RecordCreator.create();
    record.set("/", Field.create(new HashMap<String, Field>()));

    List<Record> records = ImmutableList.of(record);
    Processor processor = new HttpProcessor(conf);
    ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
        .addOutputLane("lane")
        .build();
    runner.runInit();
    try {
      StageRunner.Output output = runner.runProcess(records);
      List<Record> outputRecords = output.getRecords().get("lane");
      assertTrue(runner.getErrorRecords().isEmpty());
      assertEquals(1, outputRecords.size());
      assertTrue(outputRecords.get(0).has("/output"));
      assertEquals("{\"hello\":\"world!\"}", outputRecords.get(0).get("/output").getValueAsString());
      assertEquals("StreamSets", outputRecords.get(0).getHeader().getAttribute("x-test-header"));
      assertEquals("[a, b]", outputRecords.get(0).getHeader().getAttribute("x-list-header"));
    } finally {
      runner.runDestroy();
    }
  }

  @Test
  public void testHttpGetPrefixedHeaderOutput() throws Exception {
    HttpProcessorConfig conf = new HttpProcessorConfig();
    conf.httpMethod = HttpMethod.GET;
    conf.outputField = "/output";
    conf.dataFormat = DataFormat.TEXT;
    conf.resourceUrl = getBaseUri() + "test/get";
    conf.headerOutputLocation = HeaderOutputLocation.HEADER;
    conf.headerAttributePrefix = "test-prefix-";

    Record record = RecordCreator.create();
    record.set("/", Field.create(new HashMap<String, Field>()));

    List<Record> records = ImmutableList.of(record);
    Processor processor = new HttpProcessor(conf);
    ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
        .addOutputLane("lane")
        .build();
    runner.runInit();
    try {
      StageRunner.Output output = runner.runProcess(records);
      List<Record> outputRecords = output.getRecords().get("lane");
      assertTrue(runner.getErrorRecords().isEmpty());
      assertEquals(1, outputRecords.size());
      assertTrue(outputRecords.get(0).has("/output"));
      assertEquals("{\"hello\":\"world!\"}", outputRecords.get(0).get("/output").getValueAsString());
      assertEquals(
          "StreamSets",
          outputRecords.get(0).getHeader().getAttribute(conf.headerAttributePrefix + "x-test-header")
      );
      assertEquals(
          "[a, b]",
          outputRecords.get(0).getHeader().getAttribute(conf.headerAttributePrefix + "x-list-header")
      );
    } finally {
      runner.runDestroy();
    }
  }

  @Test
  public void testHttpGetHeaderFieldOutput() throws Exception {
    HttpProcessorConfig conf = new HttpProcessorConfig();
    conf.httpMethod = HttpMethod.GET;
    conf.outputField = "/output";
    conf.dataFormat = DataFormat.TEXT;
    conf.resourceUrl = getBaseUri() + "test/get";
    conf.headerOutputLocation = HeaderOutputLocation.FIELD;
    conf.headerOutputField = "/headers";

    Record record = RecordCreator.create();
    record.set("/", Field.create(new HashMap<String, Field>()));

    List<Record> records = ImmutableList.of(record);
    Processor processor = new HttpProcessor(conf);
    ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
        .addOutputLane("lane")
        .build();
    runner.runInit();
    try {
      StageRunner.Output output = runner.runProcess(records);
      List<Record> outputRecords = output.getRecords().get("lane");
      assertTrue(runner.getErrorRecords().isEmpty());
      assertEquals(1, outputRecords.size());
      assertTrue(outputRecords.get(0).has("/output"));
      assertEquals("{\"hello\":\"world!\"}", outputRecords.get(0).get("/output").getValueAsString());
      assertEquals(
          "StreamSets",
          outputRecords.get(0).get(conf.headerOutputField).getValueAsMap().get("x-test-header").getValueAsString()
      );
      assertEquals(
          "[a, b]",
          outputRecords.get(0).get(conf.headerOutputField).getValueAsMap().get("x-list-header").getValueAsString()
      );
    } finally {
      runner.runDestroy();
    }
  }

  @Test
  public void testHttpGetJson() throws Exception {
    doTestGetJson(false);
  }

  @Test
  public void testHttpGetJsonCompressed() throws Exception {
    doTestGetJson(true);
  }

  private void doTestGetJson(boolean compressed) throws com.streamsets.pipeline.api.StageException {
    HttpProcessorConfig conf = new HttpProcessorConfig();
    conf.httpMethod = HttpMethod.GET;
    conf.outputField = "/output";
    conf.dataFormat = DataFormat.JSON;
    conf.resourceUrl = getBaseUri() + "test/get";
    if (compressed) {
      conf.resourceUrl = conf.resourceUrl + "zip";
      conf.dataFormatConfig.compression = Compression.COMPRESSED_FILE;
    }
    System.out.println(conf.resourceUrl);

    Record record = RecordCreator.create();
    record.set("/", Field.create(new HashMap<>()));

    List<Record> records = ImmutableList.of(record);
    Processor processor = new HttpProcessor(conf);
    ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
        .addOutputLane("lane")
        .build();
    runner.runInit();
    try {
      StageRunner.Output output = runner.runProcess(records);
      List<Record> outputRecords = output.getRecords().get("lane");
      assertTrue(runner.getErrorRecords().isEmpty());
      assertEquals(1, outputRecords.size());
      assertTrue(outputRecords.get(0).has("/output"));
      Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
      assertTrue(!outputMap.isEmpty());
      assertTrue(outputMap.containsKey("hello"));
      assertEquals("world!", outputMap.get("hello").getValueAsString());

    } finally {
      runner.runDestroy();
    }
  }

  @Test
  public void testHttpPutJson() throws Exception {
    HttpProcessorConfig conf = new HttpProcessorConfig();
    conf.httpMethod = HttpMethod.POST;
    conf.outputField = "/output";
    conf.dataFormat = DataFormat.JSON;
    conf.resourceUrl = getBaseUri() + "test/put";
    conf.headers.put(HttpStageUtil.CONTENT_TYPE_HEADER, "application/json");
    conf.requestBody = "{\"hello\":\"world!\"}";

    Record record = RecordCreator.create();
    record.set("/", Field.create(new HashMap<String, Field>()));

    List<Record> records = ImmutableList.of(record);
    Processor processor = new HttpProcessor(conf);
    ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
        .addOutputLane("lane")
        .build();
    runner.runInit();
    try {
      StageRunner.Output output = runner.runProcess(records);
      List<Record> outputRecords = output.getRecords().get("lane");
      assertTrue(runner.getErrorRecords().isEmpty());
      assertEquals(1, outputRecords.size());
      assertTrue(outputRecords.get(0).has("/output"));
      Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
      assertTrue(!outputMap.isEmpty());
      assertTrue(outputMap.containsKey("hello"));
      assertEquals("world!", outputMap.get("hello").getValueAsString());

    } finally {
      runner.runDestroy();
    }
  }

  @Test
  public void testHttpPostDifferentTypes() throws Exception {
    final Random random = new Random();

    String fallbackContentType = "application/default";

    for (Map.Entry<String, String> requestEntry : HttpStageTestUtil.CONTENT_TYPE_TO_BODY.entrySet()) {

      String expectedContentType = requestEntry.getKey();

      HttpProcessorConfig conf = new HttpProcessorConfig();
      conf.httpMethod = HttpMethod.POST;
      conf.outputField = "/output";
      conf.dataFormat = DataFormat.JSON;
      conf.resourceUrl = getBaseUri() + "test/postCustomType";
      conf.defaultRequestContentType = fallbackContentType;

      if (StringUtils.isBlank(expectedContentType)) {
        expectedContentType = fallbackContentType;
      } else {
        String contentTypeHeader = HttpStageUtil.CONTENT_TYPE_HEADER;
        String header = HttpStageTestUtil.randomizeCapitalization(random, contentTypeHeader);
        conf.headers.put(header.toString(), expectedContentType);
      }

      conf.requestBody = requestEntry.getValue();

      Record record = RecordCreator.create();
      record.set("/", Field.create(new HashMap<String, Field>()));

      List<Record> records = ImmutableList.of(record);
      Processor processor = new HttpProcessor(conf);
      ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
          .addOutputLane("lane")
          .build();
      runner.runInit();
      try {
        StageRunner.Output output = runner.runProcess(records);
        List<Record> outputRecords = output.getRecords().get("lane");
        assertTrue(runner.getErrorRecords().isEmpty());
        assertEquals(1, outputRecords.size());
        assertTrue(outputRecords.get(0).has("/output"));
        Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
        assertTrue(!outputMap.isEmpty());
        assertTrue(outputMap.containsKey(HttpStageUtil.CONTENT_TYPE_HEADER));
        assertEquals(expectedContentType, outputMap.get(HttpStageUtil.CONTENT_TYPE_HEADER).getValueAsString());
        assertTrue(outputMap.containsKey("Content"));
        assertEquals(requestEntry.getValue(), outputMap.get("Content").getValueAsString());

      } finally {
        runner.runDestroy();
      }

    }
  }

  @Test
  public void testHttpGetXml() throws Exception {
    HttpProcessorConfig conf = new HttpProcessorConfig();
    conf.httpMethod = HttpMethod.GET;
    conf.outputField = "/output";
    conf.dataFormat = DataFormat.XML;
    conf.resourceUrl = getBaseUri() + "test/xml/get";

    Record record = RecordCreator.create();
    record.set("/", Field.create(new HashMap<String, Field>()));

    List<Record> records = ImmutableList.of(record);
    Processor processor = new HttpProcessor(conf);
    ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
        .addOutputLane("lane")
        .build();
    runner.runInit();
    try {
      StageRunner.Output output = runner.runProcess(records);
      List<Record> outputRecords = output.getRecords().get("lane");
      assertTrue(runner.getErrorRecords().isEmpty());
      assertEquals(1, outputRecords.size());
      assertTrue(outputRecords.get(0).has("/output"));
      Map<String, Field> outputField = outputRecords.get(0).get("/output").getValueAsMap();
      List<Field> xmlFields = outputField.get("e").getValueAsList();
      assertEquals("Hello", xmlFields.get(0).getValueAsMap().get("value").getValueAsString());
      assertEquals("Bye", xmlFields.get(1).getValueAsMap().get("value").getValueAsString());
    } finally {
      runner.runDestroy();
    }
  }

  @Test
  public void testHttpGetJsonOAuth2() throws Exception {
    try {
      HttpProcessorConfig conf = new HttpProcessorConfig();
      conf.httpMethod = HttpMethod.GET;
      conf.outputField = "/output";
      conf.dataFormat = DataFormat.JSON;
      conf.resourceUrl = getBaseUri() + "test/get";
      conf.client.authType = AuthenticationType.NONE;
      conf.client.useOAuth2 = true;
      conf.client.oauth2.clientSecret = () -> CLIENT_SECRET;
      conf.client.oauth2.clientId = () -> CLIENT_ID;
      conf.client.oauth2.tokenUrl = getBaseUri() + "credentialsToken";
      conf.client.oauth2.credentialsGrantType = OAuth2GrantTypes.CLIENT_CREDENTIALS;

      Record record = RecordCreator.create();
      record.set("/", Field.create(new HashMap<String, Field>()));

      List<Record> records = ImmutableList.of(record);
      Processor processor = new HttpProcessor(conf);
      ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
          .addOutputLane("lane")
          .build();
      runner.runInit();
      try {
        StageRunner.Output output = runner.runProcess(records);
        List<Record> outputRecords = output.getRecords().get("lane");
        assertTrue(runner.getErrorRecords().isEmpty());
        assertEquals(1, outputRecords.size());
        assertTrue(outputRecords.get(0).has("/output"));
        Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
        assertTrue(!outputMap.isEmpty());
        assertTrue(outputMap.containsKey("hello"));
        assertEquals("world!", outputMap.get("hello").getValueAsString());

      } finally {
        runner.runDestroy();
      }
      assertEquals(1, tokenGetCount);
    } finally {
      token = null;
      tokenGetCount = 0;
    }
  }

  @Test
  public void testHttpGetJsonOAuth2BasicAuth() throws Exception {
    try {
      HttpProcessorConfig conf = new HttpProcessorConfig();
      conf.httpMethod = HttpMethod.GET;
      conf.outputField = "/output";
      conf.dataFormat = DataFormat.JSON;
      conf.resourceUrl = getBaseUri() + "test/get";
      conf.client.authType = AuthenticationType.BASIC;
      conf.client.useOAuth2 = true;
      conf.client.oauth2.credentialsGrantType = CLIENT_CREDENTIALS;
      conf.client.basicAuth.password = () -> CLIENT_SECRET;
      conf.client.basicAuth.username = () -> CLIENT_ID;
      conf.client.oauth2.tokenUrl = getBaseUri() + "basicToken";
      conf.client.oauth2.credentialsGrantType = OAuth2GrantTypes.CLIENT_CREDENTIALS;

      Record record = RecordCreator.create();
      record.set("/", Field.create(new HashMap<String, Field>()));

      List<Record> records = ImmutableList.of(record);
      Processor processor = new HttpProcessor(conf);
      ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
          .addOutputLane("lane")
          .build();
      runner.runInit();
      try {
        StageRunner.Output output = runner.runProcess(records);
        List<Record> outputRecords = output.getRecords().get("lane");
        assertTrue(runner.getErrorRecords().isEmpty());
        assertEquals(1, outputRecords.size());
        assertTrue(outputRecords.get(0).has("/output"));
        Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
        assertTrue(!outputMap.isEmpty());
        assertTrue(outputMap.containsKey("hello"));
        assertEquals("world!", outputMap.get("hello").getValueAsString());

      } finally {
        runner.runDestroy();
      }
      assertEquals(1, tokenGetCount);
    } finally {
      token = null;
      tokenGetCount = 0;
    }
  }

  @Test
  public void testHttpGetJsonOAuth2MultipleTimes() throws Exception {
    try {
      HttpProcessorConfig conf = new HttpProcessorConfig();
      conf.httpMethod = HttpMethod.GET;
      conf.outputField = "/output";
      conf.dataFormat = DataFormat.JSON;
      conf.resourceUrl = getBaseUri() + "tokenresetstream";
      conf.client.authType = AuthenticationType.NONE;
      conf.client.useOAuth2 = true;
      conf.client.oauth2.clientSecret = () -> CLIENT_SECRET;
      conf.client.oauth2.clientId = () -> CLIENT_ID;
      conf.client.oauth2.tokenUrl = getBaseUri() + "credentialsToken";
      conf.client.oauth2.credentialsGrantType = OAuth2GrantTypes.CLIENT_CREDENTIALS;
      Processor processor = new HttpProcessor(conf);
      ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
          .addOutputLane("lane")
          .build();
      runner.runInit();
      try {
        for (int i = 0; i < 3; i++) {
          Record record = RecordCreator.create();
          record.set("/", Field.create(new HashMap<String, Field>()));

          List<Record> records = ImmutableList.of(record);
          StageRunner.Output output = runner.runProcess(records);
          List<Record> outputRecords = output.getRecords().get("lane");
          assertTrue(runner.getErrorRecords().isEmpty());
          assertEquals(1, outputRecords.size());
          assertTrue(outputRecords.get(0).has("/output"));
          Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
          assertTrue(!outputMap.isEmpty());
          assertTrue(outputMap.containsKey("hello"));
          assertEquals("world!", outputMap.get("hello").getValueAsString());
        }
        assertEquals(2, tokenGetCount);
      } finally {
        runner.runDestroy();
      }
    } finally {
      token = null;
      tokenGetCount = 0;
    }
  }

  @Test
  public void testHttpGetJsonOAuth2ResourceOwner() throws Exception {
    try {
      HttpProcessorConfig conf = new HttpProcessorConfig();
      conf.httpMethod = HttpMethod.GET;
      conf.outputField = "/output";
      conf.dataFormat = DataFormat.JSON;
      conf.resourceUrl = getBaseUri() + "test/get";
      conf.client.authType = AuthenticationType.NONE;
      conf.client.useOAuth2 = true;
      conf.client.oauth2.username = () -> USERNAME;
      conf.client.oauth2.password = () -> PASSWORD;
      conf.client.oauth2.tokenUrl = getBaseUri() + "credentialsToken";
      conf.client.oauth2.credentialsGrantType = OAuth2GrantTypes.RESOURCE_OWNER;

      Record record = RecordCreator.create();
      record.set("/", Field.create(new HashMap<String, Field>()));

      List<Record> records = ImmutableList.of(record);
      Processor processor = new HttpProcessor(conf);
      ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
          .addOutputLane("lane")
          .build();
      runner.runInit();
      try {
        StageRunner.Output output = runner.runProcess(records);
        List<Record> outputRecords = output.getRecords().get("lane");
        assertTrue(runner.getErrorRecords().isEmpty());
        assertEquals(1, outputRecords.size());
        assertTrue(outputRecords.get(0).has("/output"));
        Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
        assertTrue(!outputMap.isEmpty());
        assertTrue(outputMap.containsKey("hello"));
        assertEquals("world!", outputMap.get("hello").getValueAsString());

      } finally {
        runner.runDestroy();
      }
      assertEquals(1, tokenGetCount);
    } finally {
      token = null;
      tokenGetCount = 0;
    }
  }

  @Test
  public void testHttpGetJsonResourceOwnerOAuth2MultipleTimes() throws Exception {
    try {
      HttpProcessorConfig conf = new HttpProcessorConfig();
      conf.httpMethod = HttpMethod.GET;
      conf.outputField = "/output";
      conf.dataFormat = DataFormat.JSON;
      conf.resourceUrl = getBaseUri() + "tokenresetstream";
      conf.client.authType = AuthenticationType.NONE;
      conf.client.useOAuth2 = true;
      conf.client.oauth2.username = () -> USERNAME;
      conf.client.oauth2.password = () -> PASSWORD;
      conf.client.oauth2.tokenUrl = getBaseUri() + "credentialsToken";
      conf.client.oauth2.credentialsGrantType = OAuth2GrantTypes.RESOURCE_OWNER;

      Processor processor = new HttpProcessor(conf);
      ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
          .addOutputLane("lane")
          .build();
      runner.runInit();
      try {
        for (int i = 0; i < 3; i++) {
          Record record = RecordCreator.create();
          record.set("/", Field.create(new HashMap<String, Field>()));

          List<Record> records = ImmutableList.of(record);
          StageRunner.Output output = runner.runProcess(records);
          List<Record> outputRecords = output.getRecords().get("lane");
          assertTrue(runner.getErrorRecords().isEmpty());
          assertEquals(1, outputRecords.size());
          assertTrue(outputRecords.get(0).has("/output"));
          Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
          assertTrue(!outputMap.isEmpty());
          assertTrue(outputMap.containsKey("hello"));
          assertEquals("world!", outputMap.get("hello").getValueAsString());
        }
        assertEquals(2, tokenGetCount);
      } finally {
        runner.runDestroy();
      }
    } finally {
      token = null;
      tokenGetCount = 0;
    }
  }

  @Test
  public void testHttpGetJsonOAuth2ResourceOwnerClientId() throws Exception {
    try {
      HttpProcessorConfig conf = new HttpProcessorConfig();
      conf.httpMethod = HttpMethod.GET;
      conf.outputField = "/output";
      conf.dataFormat = DataFormat.JSON;
      conf.resourceUrl = getBaseUri() + "test/get";
      conf.client.authType = AuthenticationType.NONE;
      conf.client.useOAuth2 = true;
      conf.client.oauth2.username = () -> USERNAME;
      conf.client.oauth2.password = () -> PASSWORD;
      conf.client.oauth2.resourceOwnerClientSecret = () -> CLIENT_SECRET;
      conf.client.oauth2.resourceOwnerClientId = () -> CLIENT_ID;
      conf.client.oauth2.tokenUrl = getBaseUri() + "resourceToken";
      conf.client.oauth2.credentialsGrantType = OAuth2GrantTypes.RESOURCE_OWNER;

      Record record = RecordCreator.create();
      record.set("/", Field.create(new HashMap<String, Field>()));

      List<Record> records = ImmutableList.of(record);
      Processor processor = new HttpProcessor(conf);
      ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
          .addOutputLane("lane")
          .build();
      runner.runInit();
      try {
        StageRunner.Output output = runner.runProcess(records);
        List<Record> outputRecords = output.getRecords().get("lane");
        assertTrue(runner.getErrorRecords().isEmpty());
        assertEquals(1, outputRecords.size());
        assertTrue(outputRecords.get(0).has("/output"));
        Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
        assertTrue(!outputMap.isEmpty());
        assertTrue(outputMap.containsKey("hello"));
        assertEquals("world!", outputMap.get("hello").getValueAsString());

      } finally {
        runner.runDestroy();
      }
      assertEquals(1, tokenGetCount);
    } finally {
      token = null;
      tokenGetCount = 0;
    }
  }

  @Test
  public void testHttpGetJsonResourceOwnerClientIdOAuth2MultipleTimes() throws Exception {
    try {
      HttpProcessorConfig conf = new HttpProcessorConfig();
      conf.httpMethod = HttpMethod.GET;
      conf.outputField = "/output";
      conf.dataFormat = DataFormat.JSON;
      conf.resourceUrl = getBaseUri() + "tokenresetstream";
      conf.client.authType = AuthenticationType.NONE;
      conf.client.useOAuth2 = true;
      conf.client.oauth2.username = () -> USERNAME;
      conf.client.oauth2.password = () -> PASSWORD;
      conf.client.oauth2.resourceOwnerClientSecret = () -> CLIENT_SECRET;
      conf.client.oauth2.resourceOwnerClientId = () -> CLIENT_ID;
      conf.client.oauth2.tokenUrl = getBaseUri() + "resourceToken";
      conf.client.oauth2.credentialsGrantType = OAuth2GrantTypes.RESOURCE_OWNER;

      Processor processor = new HttpProcessor(conf);
      ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
          .addOutputLane("lane")
          .build();
      runner.runInit();
      try {
        for (int i = 0; i < 3; i++) {
          Record record = RecordCreator.create();
          record.set("/", Field.create(new HashMap<String, Field>()));

          List<Record> records = ImmutableList.of(record);
          StageRunner.Output output = runner.runProcess(records);
          List<Record> outputRecords = output.getRecords().get("lane");
          assertTrue(runner.getErrorRecords().isEmpty());
          assertEquals(1, outputRecords.size());
          assertTrue(outputRecords.get(0).has("/output"));
          Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
          assertTrue(!outputMap.isEmpty());
          assertTrue(outputMap.containsKey("hello"));
          assertEquals("world!", outputMap.get("hello").getValueAsString());
        }
        assertEquals(2, tokenGetCount);
      } finally {
        runner.runDestroy();
      }
    } finally {
      token = null;
      tokenGetCount = 0;
    }
  }

  @Test
  public void testOAuth2Jwt() throws Exception {
    tokenGetCount = 0;
    keyPair = KeyPairGenerator.getInstance("RSA").generateKeyPair();
    try {
      HttpProcessorConfig conf = new HttpProcessorConfig();
      conf.httpMethod = HttpMethod.GET;
      conf.outputField = "/output";
      conf.dataFormat = DataFormat.JSON;
      conf.resourceUrl = getBaseUri() + "test/get";
      conf.client.useOAuth2 = true;
      conf.client.oauth2.credentialsGrantType = OAuth2GrantTypes.JWT;
      conf.client.oauth2.algorithm = SigningAlgorithms.RS256;
      conf.client.oauth2.jwtClaims = JWT;
      conf.client.oauth2.key = () -> Base64.encodeBase64String(keyPair.getPrivate().getEncoded());
      conf.client.oauth2.tokenUrl = getBaseUri() + "jwtToken";

      Record record = RecordCreator.create();
      record.set("/", Field.create(new HashMap<String, Field>()));

      List<Record> records = ImmutableList.of(record);
      Processor processor = new HttpProcessor(conf);
      ProcessorRunner runner = new ProcessorRunner.Builder(HttpDProcessor.class, processor)
          .addOutputLane("lane")
          .build();
      runner.runInit();
      try {
        StageRunner.Output output = runner.runProcess(records);
        List<Record> outputRecords = output.getRecords().get("lane");
        assertTrue(runner.getErrorRecords().isEmpty());
        assertEquals(1, outputRecords.size());
        assertTrue(outputRecords.get(0).has("/output"));
        Map<String, Field> outputMap = outputRecords.get(0).get("/output").getValueAsMap();
        assertTrue(!outputMap.isEmpty());
        assertTrue(outputMap.containsKey("hello"));
        assertEquals("world!", outputMap.get("hello").getValueAsString());

      } finally {
        runner.runDestroy();
      }
      assertEquals(1, tokenGetCount);
    } finally {
      token = null;
      tokenGetCount = 0;
    }
  }
}
