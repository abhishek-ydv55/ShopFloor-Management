package com.manuvya.shopfloor.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Serves the Angular SPA from classpath:/static/ and falls back to index.html
 * for any path that does not resolve to a real static file.
 *
 * Routing contract:
 *   /api/**           → handled by @RestController beans (never reaches here)
 *   /swagger-ui/**    → handled by Springdoc (never reaches here)
 *   /*.js, /*.css … → resolved from static/ as normal files
 *   /admin/workers    → no file found → forward to index.html (Angular router takes over)
 *
 * spring.web.resources.add-mappings=false must be set in application.properties
 * so Spring Boot's default /** resource handler does NOT compete with this one.
 */
@Configuration
public class SpaWebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location)
                            throws IOException {
                        Resource requested = location.createRelative(resourcePath);
                        return (requested.exists() && requested.isReadable())
                                ? requested
                                : new ClassPathResource("/static/index.html");
                    }
                });
    }
}
