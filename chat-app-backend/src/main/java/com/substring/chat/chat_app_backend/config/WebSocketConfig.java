package com.substring.chat.chat_app_backend.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


    @SuppressWarnings("null") // Suppressing null pointer exception
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker with the "/topic" prefix for subscriptions
        config.enableSimpleBroker("/topic");

        // Set the application destination prefix for messages sent from the client
        config.setApplicationDestinationPrefixes("/app");
    }

    @SuppressWarnings("null")// Suppressing null pointer exception
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/chat" endpoint for WebSocket connections
        registry.addEndpoint("/chat") // Connection established
                .setAllowedOrigins("AppConstant.FRONT_END_BASE_URL") // Allow connections from the frontend
                .withSockJS(); // Enable fallback options for browsers that don't support WebSocket
    }
}
