package org.examples.quickfixapi.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {

    CUSTOMER, ADMIN, SERVICE_PROVIDER, SUPER_ADMIN;

    @JsonCreator
    public static Role fromString(String value) {
        return value == null ? null : valueOf(value.toUpperCase());
    }
}
