package org.examples.quickfixapi.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class ApiResponse {

    private int status;
    private String message;
    private Object data;
}
