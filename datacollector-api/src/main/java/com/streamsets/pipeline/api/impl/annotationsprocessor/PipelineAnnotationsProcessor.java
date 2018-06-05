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
package com.streamsets.pipeline.api.impl.annotationsprocessor;

import com.streamsets.pipeline.api.ElDef;
import com.streamsets.pipeline.api.ErrorStage;
import com.streamsets.pipeline.api.Executor;
import com.streamsets.pipeline.api.GenerateResourceBundle;
import com.streamsets.pipeline.api.Processor;
import com.streamsets.pipeline.api.PushSource;
import com.streamsets.pipeline.api.Source;
import com.streamsets.pipeline.api.StageDef;
import com.streamsets.pipeline.api.StageType;
import com.streamsets.pipeline.api.StatsAggregatorStage;
import com.streamsets.pipeline.api.Target;
import com.streamsets.pipeline.api.credential.CredentialStoreDef;
import com.streamsets.pipeline.api.impl.Utils;
import com.streamsets.pipeline.api.lineage.LineagePublisherDef;
import com.streamsets.pipeline.api.service.ServiceDef;

import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.ProcessingEnvironment;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedOptions;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.lang.model.type.TypeMirror;
import javax.lang.model.util.Types;
import javax.tools.Diagnostic;
import javax.tools.FileObject;
import javax.tools.StandardLocation;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Set;


@SupportedAnnotationTypes({
    "com.streamsets.pipeline.api.StageDef",
    "com.streamsets.pipeline.api.GenerateResourceBundle",
    "com.streamsets.pipeline.api.ElDef",
    "com.streamsets.pipeline.api.lineage.LineagePublisherDef",
    "com.streamsets.pipeline.api.credential.CredentialStoreDef",
    "com.streamsets.pipeline.api.service.ServiceDef"
})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@SupportedOptions(PipelineAnnotationsProcessor.SKIP_PROCESSOR)
public class PipelineAnnotationsProcessor extends AbstractProcessor {
  static final String SKIP_PROCESSOR = "streamsets.datacollector.annotationsprocessor.skip";

  public static final String STAGES_FILE = "PipelineStages.json";
  public static final String LINEAGE_PUBLISHERS_FILE = "LineagePublishers.json";
  public static final String SERVICES_FILE = "Services.json";
  public static final String ELDEFS_FILE = "ElDefinitions.json";
  public static final String BUNDLES_FILE = "datacollector-resource-bundles.json";
  public static final String CREDENTIAL_STORE_FILE = "CredentialStores.json";
  public static final String STAGE_DEF_LIST_FILE = "StageDefList.json";

  private boolean skipProcessor;
  private ProcessingEnvironment processingEnv;
  private final List<String> stagesClasses;
  private final List<String> lineagePublishersClasses;
  private final List<String> servicesClasses;
  private final List<String> elDefClasses;
  private final List<String> bundleClasses;
  private final List<String> credentialStoreClasses;
  private final List<String> stageDefJsonList;
  private boolean error;
  private TypeMirror typeOfSource;
  private TypeMirror typeOfPushSource;
  private TypeMirror typeOfProcessor;
  private TypeMirror typeOfExecutor;
  private TypeMirror typeOfTarget;

  public PipelineAnnotationsProcessor() {
    super();
    stagesClasses = new ArrayList<>();
    lineagePublishersClasses = new ArrayList<>();
    servicesClasses = new ArrayList<>();
    elDefClasses = new ArrayList<>();
    bundleClasses = new ArrayList<>();
    credentialStoreClasses = new ArrayList<>();
    stageDefJsonList = new ArrayList<>();
  }

  @Override
  public synchronized void init(ProcessingEnvironment processingEnv) {
    super.init(processingEnv);
    skipProcessor = processingEnv.getOptions().containsKey(SKIP_PROCESSOR);
    this.processingEnv = processingEnv;
    typeOfSource = processingEnv.getElementUtils().getTypeElement(Source.class.getName()).asType();
    typeOfPushSource = processingEnv.getElementUtils().getTypeElement(PushSource.class.getName()).asType();
    typeOfProcessor = processingEnv.getElementUtils().getTypeElement(Processor.class.getName()).asType();
    typeOfExecutor = processingEnv.getElementUtils().getTypeElement(Executor.class.getName()).asType();
    typeOfTarget = processingEnv.getElementUtils().getTypeElement(Target.class.getName()).asType();
  }

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {

    if (skipProcessor) {
      return true;
    }
    // Collect @StageDef classes
    for(Element e : roundEnv.getElementsAnnotatedWith(StageDef.class)) {
      StageDef stageDef = e.getAnnotation(StageDef.class);

      if(e.getKind().isClass()) {
        String className = ((TypeElement)e).getQualifiedName().toString();
        stagesClasses.add(className);

        boolean statsAggregatorStage = e.getAnnotation(StatsAggregatorStage.class) != null;
        boolean errorStage = e.getAnnotation(ErrorStage.class) != null;
        stageDefJsonList.add(stageDefToJson(
            stageDef,
            getStageName(className),
            extractStageType(e.asType()),
            statsAggregatorStage,
            errorStage
        ));
      } else {
        printError("'{}' is not a class, cannot be @StageDef annotated", e);
        error = true;
      }
    }

    // Collect @LineagePublisherDef classes
    for(Element e : roundEnv.getElementsAnnotatedWith(LineagePublisherDef.class)) {
      if(e.getKind().isClass()) {
        lineagePublishersClasses.add(((TypeElement)e).getQualifiedName().toString());
      } else {
        printError("'{}' is not a class, cannot be @LineagePublisherDef annotated", e);
        error = true;
      }
    }

    // Collect @ServiceDef classes
    for(Element e : roundEnv.getElementsAnnotatedWith(ServiceDef.class)) {
      if(e.getKind().isClass()) {
        servicesClasses.add(((TypeElement)e).getQualifiedName().toString());
      } else {
        printError("'{}' is not a class, cannot be @ServiceDef annotated", e);
        error = true;
      }
    }

    // Collect @CredentialStoreDef classes
    for(Element e : roundEnv.getElementsAnnotatedWith(CredentialStoreDef.class)) {
      if(e.getKind().isClass()) {
        credentialStoreClasses.add(((TypeElement)e).getQualifiedName().toString());
      } else {
        printError("'{}' is not a class, cannot be @CredentialStoreDef annotated", e);
        error = true;
      }
    }

    // Collect @ElDef classes
    for(Element e : roundEnv.getElementsAnnotatedWith(ElDef.class)) {
      if(e.getKind().isClass()) {
        elDefClasses.add(((TypeElement)e).getQualifiedName().toString());
      } else {
        printError("'{}' is not a class, cannot be @ELDef annotated", e);
        error = true;
      }
    }

    // Collect @GenerateResourceBundle classes
    for(Element e : roundEnv.getElementsAnnotatedWith(GenerateResourceBundle.class)) {
      if(e.getKind().isClass()) {
        bundleClasses.add(((TypeElement) e).getQualifiedName().toString());
      } else {
        printError("'{}' is not a class, cannot be @GenerateResourceBundle annotated", e);
        error = true;
      }
    }

    // Generate files only if this is the last round and there is no error
    if(roundEnv.processingOver() && !error) {
      generateFiles();
    }
    return true;
  }

  private void printError(String template, Object... args) {
    processingEnv.getMessager().printMessage(Diagnostic.Kind.ERROR, Utils.format(template, args));
  }

  private void generateFiles() {
    generateFile(STAGES_FILE, stagesClasses,"  \"", "\"");
    generateFile(LINEAGE_PUBLISHERS_FILE, lineagePublishersClasses,"  \"", "\"");
    generateFile(SERVICES_FILE, servicesClasses,"  \"", "\"");
    generateFile(ELDEFS_FILE, elDefClasses,"  \"", "\"");
    generateFile(BUNDLES_FILE, bundleClasses,"  \"", "\"");
    generateFile(CREDENTIAL_STORE_FILE, credentialStoreClasses,"  \"", "\"");
    generateFile(STAGE_DEF_LIST_FILE, stageDefJsonList," ", "");
  }

  static String toJson(List<String> elements) {
    return toJson(elements,"  \"", "\"");
  }

  private static String toJson(List<String> elements, String prefix, String postfix) {
    StringBuilder sb = new StringBuilder();
    sb.append("[");
    String separator = "\n";
    for (String e : elements) {
      sb.append(separator).append(prefix).append(e).append(postfix);
      separator = ",\n";
    }
    sb.append("\n]\n");
    return sb.toString();
  }

  private void generateFile(String fileName, List<String> elements, String prefix, String postfix) {
    try {
      FileObject resource = processingEnv.getFiler().createResource(StandardLocation.CLASS_OUTPUT, "", fileName);
      try (Writer writer = new OutputStreamWriter(resource.openOutputStream())) {
        writer.write(toJson(elements, prefix, postfix));
      }
    } catch (IOException e) {
      printError("Could not create/write '{}' file: {}", e.toString());
    }
  }

  private String stageDefToJson(
      StageDef stageDef,
      String stageName,
      StageType stageType,
      boolean statsAggregatorStage,
      boolean errorStage
  ) {

    String base64Image = getBase64Image(stageDef);

    StringBuilder sb = new StringBuilder();

    sb.append("{\n");

    sb.append("\t\"").append("name").append("\"").append(": \"")
        .append(stageName).append("\"");
    sb.append(",\n");

    sb.append("\t\"").append("type").append("\"").append(": \"")
        .append(stageType).append("\"");
    sb.append(",\n");

    sb.append("\t\"").append("label").append("\"").append(": \"")
        .append(stageDef.label()).append("\"");
    sb.append(",\n");

    sb.append("\t\"").append("description").append("\"").append(": \"")
        .append(stageDef.description()).append("\"");
    sb.append(",\n");

    sb.append("\t\"").append("version").append("\"").append(": \"")
        .append(stageDef.version()).append("\"");
    sb.append(",\n");

    sb.append("\t\"").append("statsAggregatorStage").append("\"").append(": ")
        .append(statsAggregatorStage);
    sb.append(",\n");

    sb.append("\t\"").append("errorStage").append("\"").append(": ")
        .append(errorStage);
    sb.append(",\n");

    sb.append("\t\"").append("beta").append("\"").append(": \"")
        .append(stageDef.beta()).append("\"");
    sb.append(",\n");

    sb.append("\t\"").append("icon").append("\"").append(": \"")
        .append(base64Image).append("\"");
    sb.append("\n }");

    return sb.toString();
  }

  private StageType extractStageType(TypeMirror stageType) {
    Types typeUtils = processingEnv.getTypeUtils();
    StageType type;
    if (typeUtils.isAssignable(stageType, typeOfSource) || typeUtils.isAssignable(stageType, typeOfPushSource)) {
      type = StageType.SOURCE;
    } else if (typeUtils.isSubtype(stageType, typeOfProcessor)) {
      type = StageType.PROCESSOR;
    } else if (typeUtils.isSubtype(stageType, typeOfExecutor)) {
      type = StageType.EXECUTOR;
    } else if (typeUtils.isSubtype(stageType, typeOfTarget)) {
      type = StageType.TARGET;
    } else {
      type = null;
    }
    return type;
  }

  private static String getStageName(String className) {
    return className.replace(".", "_").replace("$", "_");
  }

  private String getBase64Image(StageDef stageDef) {
    String base64Image = null;
    if (stageDef.icon().length() > 0) {
      try(InputStream inputStream = processingEnv.getFiler()
          .getResource( StandardLocation.CLASS_OUTPUT, "", stageDef.icon()).openInputStream()) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int read;
        while ((read = inputStream.read(buffer, 0, buffer.length)) != -1) {
          byteArrayOutputStream.write(buffer, 0, read);
        }
        byteArrayOutputStream.flush();
        base64Image = Base64.getEncoder().encodeToString(byteArrayOutputStream.toByteArray());
      } catch (Exception e) {
        printError("Failed to convert stage icons to Base64 - " + e.getLocalizedMessage());
      }
    }
    return base64Image;
  }

}
