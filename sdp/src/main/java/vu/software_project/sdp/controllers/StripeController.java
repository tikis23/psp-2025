package vu.software_project.sdp.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.ApiResource;

import lombok.RequiredArgsConstructor;
import vu.software_project.sdp.services.PaymentService;
import vu.software_project.sdp.entities.Payment;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
public class StripeController {
    
    private final PaymentService paymentService;
    
    @PostMapping("/webhook")
    public ResponseEntity<?> handleStripeWebhook(@RequestBody String payload) {
        Event event = null;
     
        try {
            event = ApiResource.GSON.fromJson(payload, Event.class);
        } catch (Exception e) {
            System.out.println("Webhook error while parsing basic request.");
            return ResponseEntity.badRequest().build();
        }

        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = null;
        if (dataObjectDeserializer.getObject().isPresent()) {
            stripeObject = dataObjectDeserializer.getObject().get();
        } else {
            System.out.println("Unable to deserialize event data object.");
            return ResponseEntity.badRequest().build();
        }

        try {
            switch (event.getType()) {
                case "payment_intent.succeeded": {
                    PaymentIntent intent = (PaymentIntent) stripeObject;
                    paymentService.updateCardPaymentStatus(intent.getId(), Payment.Status.SUCCEEDED);
                    break;
                }
                case "payment_intent.processing": {
                    PaymentIntent intent = (PaymentIntent) stripeObject;
                    paymentService.updateCardPaymentStatus(intent.getId(), Payment.Status.PROCESSING);
                    break;
                }
                case "payment_intent.payment_failed": {
                    PaymentIntent intent = (PaymentIntent) stripeObject;
                    paymentService.updateCardPaymentStatus(intent.getId(), Payment.Status.FAILED);
                    break;
                }
                case "payment_intent.canceled": {
                    PaymentIntent intent = (PaymentIntent) stripeObject;
                    paymentService.updateCardPaymentStatus(intent.getId(), Payment.Status.CANCELED);
                    break;
                }
                default:
                    break;
                }
        } catch (Exception e) {
            System.out.println("Error processing webhook event: " + e.getMessage());
        }
        return ResponseEntity.ok().build();
    }
}
