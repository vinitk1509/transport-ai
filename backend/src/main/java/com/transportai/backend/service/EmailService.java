package com.transportai.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String from;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String to, String code) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new RuntimeException("Email service is not configured. Set MAIL_USERNAME, MAIL_PASSWORD, and MAIL_FROM.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from != null && !from.isBlank() ? from : username);
        message.setTo(to);
        message.setSubject("Verify your TransportAI account");
        message.setText("""
                Your TransportAI verification code is:

                %s

                This code expires in 10 minutes. If you did not request this, you can ignore this email.
                """.formatted(code));
        mailSender.send(message);
    }
}
