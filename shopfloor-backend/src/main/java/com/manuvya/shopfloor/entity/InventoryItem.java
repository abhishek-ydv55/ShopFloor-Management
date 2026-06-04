package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Maps to Angular's StockItem interface in inventory.component.ts */
@Entity
@Table(name = "inventory_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private int qty = 0;

    @Column(nullable = false)
    @Builder.Default
    private int threshold = 10;

    @Column(name = "unit", length = 20)
    @Builder.Default
    private String unit = "pcs";

    @Column(name = "location", length = 50)
    @Builder.Default
    private String location = "Warehouse-A";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
