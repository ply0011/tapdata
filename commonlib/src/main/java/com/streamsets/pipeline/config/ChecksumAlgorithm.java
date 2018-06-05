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
package com.streamsets.pipeline.config;

import com.streamsets.pipeline.api.Label;
import com.streamsets.pipeline.lib.hashing.HashingUtil;

public enum ChecksumAlgorithm implements Label {
  //Adler32, Siphash24, CRC and CRC32 are not supported for guavas < 14.0 (There are some stages which use guavas 11)
  MD5(HashingUtil.HashType.MD5),
  SHA1(HashingUtil.HashType.SHA1),
  SHA256(HashingUtil.HashType.SHA256),
  SHA512(HashingUtil.HashType.SHA512),
  MURMUR3_32(HashingUtil.HashType.MURMUR3_32),
  MURMUR3_128(HashingUtil.HashType.MURMUR3_128),
  ;

  HashingUtil.HashType hashType;

  ChecksumAlgorithm(HashingUtil.HashType hashType) {
    this.hashType = hashType;
  }

  public String getLabel() {
    return hashType.name();
  }

  public HashingUtil.HashType getHashType() {
    return this.hashType;
  }

}
