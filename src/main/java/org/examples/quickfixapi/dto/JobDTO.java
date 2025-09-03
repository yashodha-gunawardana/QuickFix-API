package org.examples.quickfixapi.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Budget must be positive")
    private Double budget;

    private String preferredDate;

    private String preferredTime;
}