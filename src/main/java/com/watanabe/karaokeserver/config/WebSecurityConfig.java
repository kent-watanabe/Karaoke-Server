package com.watanabe.karaokeserver.config;

import static jakarta.servlet.DispatcherType.ERROR;
import static jakarta.servlet.DispatcherType.FORWARD;

import com.watanabe.karaokeserver.data.auth.CustomAuthenticationProvider;
import com.watanabe.karaokeserver.data.auth.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.function.Supplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

  @Autowired
  UserRepository userRepository;

  @Autowired
  private CustomAuthenticationProvider authProvider;

  private static final class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
      CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
      // Render the token value to a cookie by causing the deferred token to be loaded
      csrfToken.getToken();
      filterChain.doFilter(request, response);
    }

  }


  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http)
      throws Exception {

    XorCsrfTokenRequestAttributeHandler delegate = new XorCsrfTokenRequestAttributeHandler();
    // set the name of the attribute the CsrfToken will be populated on
    delegate.setCsrfRequestAttributeName("_csrf");
    CsrfTokenRequestHandler requestHandler = new CsrfTokenRequestHandler() {
      /**
       * Handles a request using a {@link CsrfToken}.
       *
       * @param request   the {@code HttpServletRequest} being handled
       * @param response  the {@code HttpServletResponse} being handled
       * @param csrfToken the {@link CsrfToken} created by the {@link CsrfTokenRepository}
       */
      @Override
      public void handle(HttpServletRequest request, HttpServletResponse response,
          Supplier<CsrfToken> csrfToken) {
        delegate.handle(request, response, csrfToken);
      }

      @Override
      public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
        String tokenValue = CsrfTokenRequestHandler.super.resolveCsrfTokenValue(request, csrfToken);
        if (tokenValue.length() == 36) {
          return tokenValue;
        }
        return delegate.resolveCsrfTokenValue(request, csrfToken);
      }
    };

    http.authorizeHttpRequests((authorize) ->
            authorize
                .dispatcherTypeMatchers(FORWARD, ERROR).permitAll()
                .anyRequest().authenticated())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(c->c.csrfTokenRepository
                (CookieCsrfTokenRepository.withHttpOnlyFalse())
            .csrfTokenRequestHandler(requestHandler))
        .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
        .formLogin(Customizer.withDefaults());

    return http.build();
  }

  @Bean
  public AuthenticationManager authManager(HttpSecurity http) throws Exception {
    AuthenticationManagerBuilder authenticationManagerBuilder =
        http.getSharedObject(AuthenticationManagerBuilder.class);
    authenticationManagerBuilder.authenticationProvider(authProvider);
    return authenticationManagerBuilder.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedHeader("Content-Type");
    configuration.setAllowedOrigins(Arrays.asList("*"));
    configuration.setAllowedMethods(Arrays.asList("*"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

}
