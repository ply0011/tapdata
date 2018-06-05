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
package com.streamsets.lib.security.http;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

public class HttpUtils {
  static final String CLIENT_IP_HEADER = "CLIENT-IP";
  static final String UNKNOWN_IP = "unknown";

  public static String getClientIpAddress(HttpServletRequest request) {
    String ip = request.getHeader(CLIENT_IP_HEADER);
    if (ip == null || ip.length() == 0 || UNKNOWN_IP.equalsIgnoreCase(ip)) {
      ip = request.getRemoteAddr();
    }
    return ip;
  }

  public static String getLoginCookieName() {
    return SSOConstants.AUTHENTICATION_COOKIE_PREFIX + "LOGIN";
  }

  public static Cookie getLoginCookie(HttpServletRequest req) {
    Cookie[] cookies = req.getCookies();
    if (cookies != null) {
      String authCookieName = getLoginCookieName();
      for (Cookie cookie : cookies) {
        if (cookie.getName().equals(authCookieName)) {
          return cookie;
        }
      }
    }
    return null;
  }
}
