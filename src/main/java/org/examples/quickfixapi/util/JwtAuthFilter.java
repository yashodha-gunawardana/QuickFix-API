package org.examples.quickfixapi.util;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

        private final JwtUtil jwtUtil;
        private final UserDetailsService userDetailsService;
}
