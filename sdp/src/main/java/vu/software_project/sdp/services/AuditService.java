package vu.software_project.sdp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vu.software_project.sdp.DTOs.action_log.ActionLogResponse;
import vu.software_project.sdp.entities.ActionLog;
import vu.software_project.sdp.entities.User;
import vu.software_project.sdp.repositories.ActionLogRepository;
import vu.software_project.sdp.repositories.UserRepository;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {

    private final ActionLogRepository actionLogRepository;
    private final UserRepository userRepository;

    public void logAction(Long actorUserId, String actionType, String targetType,
                          Long targetId, Long merchantId, Map<String, Object> dataBefore, Map<String, Object> dataAfter) {
        ActionLog log = ActionLog.builder()
                .actorUserId(actorUserId)
                .actionType(actionType)
                .targetType(targetType)
                .targetId(targetId)
                .merchantId(merchantId)
                .dataBefore(dataBefore)
                .dataAfter(dataAfter)
                .build();

        actionLogRepository.save(log);
    }

    /**
     * Creates a Pageable with sorting by the native column name 'created_at'.
     * Native queries need the actual database column name, not the JPA field name.
     */
    private Pageable withNativeSort(Pageable pageable) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "created_at"));
    }

    @Transactional(readOnly = true)
    public Page<ActionLogResponse> getAllLogs(Pageable pageable) {
        return actionLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ActionLogResponse> getLogsByMerchant(Long merchantId, Pageable pageable) {
        return actionLogRepository.findByMerchantIdOrderByCreatedAtDesc(merchantId, withNativeSort(pageable))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ActionLogResponse> getLogsByMerchantAndActionType(Long merchantId, String actionType, Pageable pageable) {
        return actionLogRepository.findByMerchantIdAndActionTypeOrderByCreatedAtDesc(merchantId, actionType, withNativeSort(pageable))
                .map(this::toResponse);
    }

    public ActionLogResponse toResponse(ActionLog log) {
        String actorName = null;
        if (log.getActorUserId() != null) {
            User actor = userRepository.findById(log.getActorUserId()).orElse(null);
            if (actor != null) {
                actorName = actor.getName();
            }
        }

        return ActionLogResponse.builder()
                .id(log.getId())
                .actorUserId(log.getActorUserId())
                .actorName(actorName != null ? actorName : "System")
                .actionType(log.getActionType())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .dataBefore(log.getDataBefore())
                .dataAfter(log.getDataAfter())
                .createdAt(log.getCreatedAt())
                .build();
    }

}
