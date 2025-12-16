package vu.software_project.sdp.config;

import jakarta.servlet.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CsrfLoggingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
//        CsrfToken csrf = (CsrfToken) ((HttpServletRequest) request).getAttribute("_csrf");
//        if (csrf != null) {
//            System.out.println("Expected CSRF token: " + csrf.getToken());
//        }
//        chain.doFilter(request, response);
        CsrfToken csrf = (CsrfToken) ((HttpServletRequest) request).getAttribute("_csrf");
        if (csrf != null) {
            System.out.println("Masked CSRF token: " + csrf.getToken());

            // If using CookieCsrfTokenRepository, the raw token is stored in the cookie value:
            Cookie[] cookies = ((HttpServletRequest) request).getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("XSRF-TOKEN".equals(cookie.getName())) {
                        System.out.println("Raw CSRF token from cookie: " + cookie.getValue());
                    }
                }
            }
        }
        chain.doFilter(request, response);

    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}
