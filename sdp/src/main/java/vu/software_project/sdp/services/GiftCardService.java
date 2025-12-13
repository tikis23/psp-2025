package vu.software_project.sdp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vu.software_project.sdp.entities.GiftCard;
import vu.software_project.sdp.repositories.GiftCardRepository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GiftCardService {

    private final GiftCardRepository giftCardRepository;

    @Transactional
    public GiftCard createGiftCard(BigDecimal initialAmount) {
        if (initialAmount == null || initialAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Gift card amount must be positive");
        }

        GiftCard gc = new GiftCard();
        gc.setCode(generateCode());
        gc.setInitialBalance(initialAmount);
        gc.setCurrentBalance(initialAmount);
        gc.setActive(true);
        gc.setCreatedAt(OffsetDateTime.now());

        return giftCardRepository.save(gc);
    }

    @Transactional
    public GiftCard deduct(String code, BigDecimal amount) {
        GiftCard card = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("GIFT_CARD_NOT_FOUND"));

        if (!Boolean.TRUE.equals(card.getActive())) {
            throw new IllegalStateException("GIFT_CARD_INACTIVE");
        }
        if (card.getExpiryDate() != null &&
            card.getExpiryDate().isBefore(OffsetDateTime.now())) {
            throw new IllegalStateException("GIFT_CARD_EXPIRED");
        }
        if (card.getCurrentBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("INSUFFICIENT_GIFT_CARD_BALANCE");
        }

        card.setCurrentBalance(card.getCurrentBalance().subtract(amount));
        if (card.getCurrentBalance().compareTo(BigDecimal.ZERO) == 0) {
            card.setActive(false);
        }

        return giftCardRepository.save(card);
    }

    private String generateCode() {
        return "GC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
