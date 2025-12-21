package vu.software_project.sdp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vu.software_project.sdp.entities.GiftCard;
import vu.software_project.sdp.repositories.GiftCardRepository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GiftCardService {

    private final GiftCardRepository giftCardRepository;

    @Transactional
    public GiftCard createGiftCard(Long merchantId, BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Gift card amount must be positive");
        }

        GiftCard gc = new GiftCard();
        gc.setCode("GC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        gc.setMerchantId(merchantId);
        gc.setInitialBalance(amount);
        gc.setCurrentBalance(amount);
        gc.setActive(true);
        gc.setCreatedAt(OffsetDateTime.now());

        return giftCardRepository.save(gc);
    }

    @Transactional(readOnly = true)
    public List<GiftCard> getAll(Long merchantId) {
        return giftCardRepository.findAllByMerchantId(merchantId);
    }

    @Transactional
    public void deleteByCode(Long merchantId, String code) {
        if (!giftCardRepository.existsByCodeAndMerchantId(code, merchantId)) {
            throw new IllegalArgumentException("GIFT_CARD_NOT_FOUND");
        }
        giftCardRepository.deleteById(code);
    }

    @Transactional
    public GiftCard deduct(Long merchantId, String code, BigDecimal amount) {
        GiftCard card = giftCardRepository.findByCodeAndMerchantId(code, merchantId)
                .orElseThrow(() -> new IllegalArgumentException("GIFT_CARD_NOT_FOUND"));

        if (!card.getActive()) throw new IllegalStateException("GIFT_CARD_INACTIVE");
        if (card.getCurrentBalance().compareTo(amount) < 0)
            throw new IllegalArgumentException("INSUFFICIENT_GIFT_CARD_BALANCE");

        card.setCurrentBalance(card.getCurrentBalance().subtract(amount));
        if (card.getCurrentBalance().signum() == 0) card.setActive(false);

        return giftCardRepository.save(card);
    }

    @Transactional(readOnly = true)
    public GiftCard getByCode(Long merchantId, String code) {
        return giftCardRepository.findByCodeAndMerchantId(code, merchantId)
                .orElseThrow(() -> new IllegalArgumentException("GIFT_CARD_NOT_FOUND"));
    }
}

