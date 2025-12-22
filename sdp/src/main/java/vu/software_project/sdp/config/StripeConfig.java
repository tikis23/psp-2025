package vu.software_project.sdp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.stripe.Stripe;

@Component
public class StripeConfig {
    public StripeConfig(@Value("${stripe.secret-key}") String key) {
        Stripe.apiKey = key;
    }
}
