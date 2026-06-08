package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryItemResponse {
    private Long id;
    private String category;
    private String name;
    private int qty;
    private int threshold;
    private String unit;
    private String location;
}
