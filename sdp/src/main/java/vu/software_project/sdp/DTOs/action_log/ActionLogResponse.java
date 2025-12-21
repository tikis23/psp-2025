package vu.software_project.sdp.DTOs.action_log;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionLogResponse {
    private Long id;
    private Long actorUserId;
    private String actorName;
    private String actionType;
    private String targetType;
    private Long targetId;
    private Map<String, Object> dataBefore;
    private Map<String, Object> dataAfter;
    private LocalDateTime createdAt;
}
