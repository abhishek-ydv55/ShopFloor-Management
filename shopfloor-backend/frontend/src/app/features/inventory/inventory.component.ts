import { Component, signal, computed, OnInit, inject, DestroyRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DashboardTopbarComponent } from '../../ui/dashboard-topbar/dashboard-topbar.component';
import { CardComponent } from '../../ui/card/card.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { FormFieldComponent } from '../../ui/form-field/form-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InventoryApiService, InventoryItemResponse } from '../../core/services/api/inventory-api.service';
import { TicketApiService, TicketResponse } from '../../core/services/api/ticket-api.service';
import { SpareRequestApiService, SpareRequestResponse } from '../../core/services/api/spare-request-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmService } from '../../core/services/confirm.service';

interface AddForm    { category: string; name: string; qty: number; threshold: number; unit: string; location: string; }
interface AddErrors  { category: string; name: string; qty: string; threshold: string; unit: string; location: string; }
interface UpdateForm   { qty: number; threshold: number; unit: string; location: string; }
interface UpdateErrors { qty: string; threshold: string; unit: string; location: string; }

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [DecimalPipe, FormsModule, DashboardTopbarComponent, CardComponent, ModalComponent, FormFieldComponent, ButtonComponent],
  template: `
    <div class="app-shell">
      <app-dashboard-topbar title="Inventory"></app-dashboard-topbar>

      <div class="app-body">
      <aside class="sidebar" role="navigation" aria-label="Inventory navigation">
        <nav>
          <button [class.active]="activeTab() === 'stock'"     (click)="activeTab.set('stock')">Stock</button>
          <button [class.active]="activeTab() === 'spare'"     (click)="activeTab.set('spare')">Spare Parts</button>
          <button [class.active]="activeTab() === 'tickets'"   (click)="activeTab.set('tickets')">Tickets</button>
          <button [class.active]="activeTab() === 'threshold'" (click)="activeTab.set('threshold')">Threshold Alerts</button>
        </nav>
        <button class="logout-btn" (click)="logout()">Log Out</button>
      </aside>

      <div class="main-content">
        <div class="page-content">
          <h2 class="page-title">Inventory Dashboard</h2>

          <!-- Stats -->
          <div class="cards-grid">
            <app-card variant="stat">
              <span>Total Items</span>
              <h3>{{ items().length }}</h3>
            </app-card>
            <app-card variant="stat">
              <span>Low Stock</span>
              <h3 style="color:var(--accent-red);">{{ lowStockCount() }}</h3>
            </app-card>
            <app-card variant="stat">
              <span>Spare Requests</span>
              <h3 style="color:#f59e0b;">{{ pendingSpare().length }}</h3>
            </app-card>
            <app-card variant="stat">
              <span>Total Tickets</span>
              <h3>{{ tickets().length }}</h3>
            </app-card>
          </div>

          <!-- Stock Tab -->
          @if (activeTab() === 'stock') {

            <!-- Charts (only on stock page) -->
            @if (items().length > 0) {
              <div class="charts-row">
                <app-card>
                  <h3 class="section-title">Stock Health</h3>
                  <div class="chart-area">
                    <div class="donut" [style.background]="stockDonutStyle()">
                      <div class="donut__hole">
                        <span class="donut__val">{{ items().length }}</span>
                        <span class="donut__lbl">Items</span>
                      </div>
                    </div>
                    <div class="donut-legend">
                      <div class="legend-item"><span class="legend-dot" style="background:var(--accent-green);"></span>OK ({{ items().length - lowStockCount() }})</div>
                      <div class="legend-item"><span class="legend-dot" style="background:var(--accent-red);"></span>Low Stock ({{ lowStockCount() }})</div>
                    </div>
                  </div>
                </app-card>
                <app-card>
                  <h3 class="section-title">Items by Category</h3>
                  <div class="bar-wrap">
                    <svg viewBox="0 0 310 150" width="100%" style="display:block;">
                      <line x1="0" y1="30"  x2="310" y2="30"  stroke="#eee" stroke-width="1"/>
                      <line x1="0" y1="75"  x2="310" y2="75"  stroke="#eee" stroke-width="1"/>
                      <line x1="0" y1="120" x2="310" y2="120" stroke="#eee" stroke-width="1"/>
                      @for (bar of categoryBarData(); track bar.label; let i = $index) {
                        <g [attr.transform]="'translate(' + (i * 60 + 10) + ',0)'">
                          <rect [attr.y]="120 - bar.height" width="42" [attr.height]="bar.height || 2" fill="var(--red-700)" rx="3"/>
                          @if (bar.value > 0) {
                            <text [attr.x]="21" [attr.y]="114 - bar.height" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-dark)">{{ bar.value }}</text>
                          }
                          <text [attr.x]="21" y="135" text-anchor="middle" font-size="9" fill="var(--text-muted)">{{ bar.label }}</text>
                        </g>
                      }
                    </svg>
                  </div>
                </app-card>
              </div>
            }

            <app-card>
              <div class="section-header" style="flex-wrap:wrap; gap:10px;">
                <h3 class="section-title">Stock Summary</h3>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <input type="text" [ngModel]="stockSearch()" (ngModelChange)="stockSearch.set($event)"
                    placeholder="Search name, category, location..."
                    style="padding:6px 12px; border:1px solid var(--gray-border); border-radius:var(--radius-md); font-size:var(--font-sm); min-width:220px;" />
                  <app-button variant="primary" size="sm" (clicked)="openAddModal()">+ Add Item</app-button>
                </div>
              </div>

              @if (filteredItems().length > 0) {
                <div style="overflow-x:auto; margin-top:12px;">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th><th>Item</th><th>Qty</th><th>Unit</th><th>Threshold</th><th>Stock Status</th><th>Procurement</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of filteredItems(); track item.id) {
                        <tr>
                          <td>{{ item.category }}</td>
                          <td>{{ item.name }}</td>
                          <td>
                            <span [style.color]="item.qty < item.threshold ? 'var(--accent-red)' : 'var(--accent-green)'" style="font-weight:600;">
                              {{ item.qty }}
                            </span>
                          </td>
                          <td>{{ item.unit }}</td>
                          <td>{{ item.threshold }}</td>
                          <td>
                            <span class="badge"
                              [class.badge--high]="item.qty < item.threshold"
                              [class.badge--approved]="item.qty >= item.threshold"
                            >{{ item.qty < item.threshold ? 'Low Stock' : 'OK' }}</span>
                          </td>
                          <td>
                            @if (itemProcStatus().get(item.name.trim().toLowerCase()); as ps) {
                              <span class="badge"
                                [class.badge--approved]="ps === 'ProcurementApproved'"
                                [class.badge--pending]="ps === 'Approved' || ps === 'SentToExternal'"
                                [class.badge--high]="ps === 'Rejected'">{{ procStatusLabel(ps) }}</span>
                            } @else {
                              <span style="color:var(--text-muted); font-size:var(--font-xs);">—</span>
                            }
                          </td>
                          <td>
                            <div style="display:flex; gap:6px; align-items:center;">
                              <app-button size="sm" variant="secondary" (clicked)="openUpdateModal(item)">Update</app-button>
                              <button class="icon-btn" title="Remove item" (click)="removeItem(item.id)">&#10005;</button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else if (items().length === 0) {
                <div class="empty-state" style="margin-top:12px;">
                  <div class="empty-state__title">No stock items</div>
                  <div class="empty-state__msg">Click "+ Add Item" to register your first stock item.</div>
                </div>
              } @else {
                <p style="color:var(--text-muted); font-size:var(--font-sm); padding:var(--space-4) 0;">No items match your search.</p>
              }
            </app-card>
          }

          <!-- Spare Parts Tab -->
          @if (activeTab() === 'spare') {
            <div class="page-header">
              <h2 class="page-title" style="margin-bottom:0;">Spare Part Requests</h2>
            </div>

            <!-- Sub-tab switcher -->
            <div class="spare-sub-tabs">
              <button
                [class.active]="spareSubTab() === 'spare-requests'"
                (click)="spareSubTab.set('spare-requests')">
                Spare Requests
              </button>
              <button
                [class.active]="spareSubTab() === 'procurement-tickets'"
                (click)="spareSubTab.set('procurement-tickets')">
                Procurement Tickets
                @if (procurementTicketsPending().length > 0) {
                  <span class="sub-tab-badge">{{ procurementTicketsPending().length }}</span>
                }
              </button>
            </div>

            <!-- ── Spare Requests sub-tab ── -->
            @if (spareSubTab() === 'spare-requests') {
              <app-card>
                <div class="section-header">
                  <h3 class="section-title">Pending Action</h3>
                  <span style="font-size:var(--font-sm); color:var(--text-muted);">Approved by Procurement — please provide from stock</span>
                </div>
                @if (spareActionMsg()) {
                  <p [style.color]="spareActionError() ? 'var(--accent-red)' : 'var(--accent-green)'"
                     style="font-weight:600; margin-bottom:12px;">{{ spareActionMsg() }}</p>
                }
                @if (pendingSpare().length > 0) {
                  <div style="overflow-x:auto;">
                    <table>
                      <thead>
                        <tr>
                          <th>Request ID</th><th>Item</th><th>Qty</th><th>Machine / Task</th>
                          <th>Priority</th><th>Requested By</th><th>In Stock?</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (r of pendingSpare(); track r.id) {
                          <tr>
                            <td><strong>{{ r.requestCode }}</strong></td>
                            <td>{{ r.item }}</td>
                            <td>{{ r.qty }}</td>
                            <td style="max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ r.machine }}</td>
                            <td>
                              <span class="badge"
                                [class.badge--high]="r.priority === 'High'"
                                [class.badge--medium]="r.priority === 'Medium'"
                                [class.badge--low]="r.priority === 'Low'">{{ r.priority }}</span>
                            </td>
                            <td>{{ r.requestedBy }}</td>
                            <td>
                              @if (stockStatusFor(r) === 'available') {
                                <span class="badge badge--approved">&#10003; Available</span>
                              } @else if (stockStatusFor(r) === 'low') {
                                <span class="badge badge--medium">&#9888; Low Stock</span>
                              } @else {
                                <span class="badge badge--high">&#10005; Not in Stock</span>
                              }
                            </td>
                            <td>
                              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                                <app-button size="sm" variant="primary"
                                  [disabled]="stockStatusFor(r) !== 'available'"
                                  (clicked)="fulfillRequest(r.id)"
                                  title="{{ stockStatusFor(r) !== 'available' ? 'Not enough stock' : 'Deduct from inventory and close' }}">
                                  Fulfill
                                </app-button>
                                <app-button size="sm" variant="secondary"
                                  (clicked)="requestExternal(r.id)"
                                  title="Raise external procurement request">
                                  Request External
                                </app-button>
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <div class="empty-state">
                    <div class="empty-state__title">No pending spare requests</div>
                    <div class="empty-state__msg">Manager-approved requests will appear here for inventory action.</div>
                  </div>
                }
              </app-card>

              @if (historySpare().length > 0) {
                <app-card style="margin-top: var(--space-5);">
                  <div class="section-header">
                    <h3 class="section-title">Handled Requests</h3>
                    <app-button variant="danger" size="sm" (clicked)="clearSpareHistory()">Clear All</app-button>
                  </div>
                  <div style="overflow-x:auto;">
                    <table>
                      <thead>
                        <tr>
                          <th>Request ID</th><th>Item</th><th>Qty</th><th>Priority</th><th>Status</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (r of historySpare(); track r.id) {
                          <tr>
                            <td><strong>{{ r.requestCode }}</strong></td>
                            <td>{{ r.item }}</td>
                            <td>{{ r.qty }}</td>
                            <td>
                              <span class="badge"
                                [class.badge--high]="r.priority === 'High'"
                                [class.badge--medium]="r.priority === 'Medium'"
                                [class.badge--low]="r.priority === 'Low'">{{ r.priority }}</span>
                            </td>
                            <td>
                              <span class="badge"
                                [class.badge--approved]="r.status === 'Fulfilled'"
                                [class.badge--pending]="r.status === 'SentToExternal'">
                                {{ r.status === 'SentToExternal' ? 'Sent to External' : r.status }}
                              </span>
                            </td>
                            <td>
                              <button class="icon-btn" title="Delete record" (click)="deleteSpareRequest(r.id)">&#10005;</button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </app-card>
              }
            }

            <!-- ── Procurement Tickets sub-tab ── -->
            @if (spareSubTab() === 'procurement-tickets') {
              <app-card>
                <div class="section-header">
                  <h3 class="section-title">Pending Fulfillment</h3>
                  <span style="font-size:var(--font-sm); color:var(--text-muted);">Raised by Procurement team — fulfill from stock</span>
                </div>
                @if (spareActionMsg()) {
                  <p [style.color]="spareActionError() ? 'var(--accent-red)' : 'var(--accent-green)'"
                     style="font-weight:600; margin-bottom:12px;">{{ spareActionMsg() }}</p>
                }
                @if (procurementTicketsPending().length > 0) {
                  <div style="overflow-x:auto;">
                    <table>
                      <thead>
                        <tr>
                          <th>Request ID</th><th>Item</th><th>Qty</th><th>Department</th>
                          <th>Priority</th><th>Requested By</th><th>In Stock?</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (r of procurementTicketsPending(); track r.id) {
                          <tr>
                            <td><strong>{{ r.requestCode }}</strong></td>
                            <td>{{ r.item }}</td>
                            <td>{{ r.qty }}</td>
                            <td>{{ r.machine }}</td>
                            <td>
                              <span class="badge"
                                [class.badge--high]="r.priority === 'High'"
                                [class.badge--medium]="r.priority === 'Medium'"
                                [class.badge--low]="r.priority === 'Low'">{{ r.priority }}</span>
                            </td>
                            <td>{{ r.requestedBy }}</td>
                            <td>
                              @if (stockStatusFor(r) === 'available') {
                                <span class="badge badge--approved">&#10003; Available</span>
                              } @else if (stockStatusFor(r) === 'low') {
                                <span class="badge badge--medium">&#9888; Low Stock</span>
                              } @else {
                                <span class="badge badge--high">&#10005; Not in Stock</span>
                              }
                            </td>
                            <td>
                              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                                <app-button size="sm" variant="primary"
                                  [disabled]="stockStatusFor(r) !== 'available'"
                                  (clicked)="fulfillRequest(r.id)"
                                  title="{{ stockStatusFor(r) !== 'available' ? 'Not enough stock' : 'Deduct from inventory and close' }}">
                                  Fulfill
                                </app-button>
                                <app-button size="sm" variant="secondary"
                                  (clicked)="requestExternal(r.id)"
                                  title="Raise external procurement request">
                                  Request External
                                </app-button>
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <div class="empty-state">
                    <div class="empty-state__title">No pending procurement tickets</div>
                    <div class="empty-state__msg">When the procurement team approves an internal request, it will appear here.</div>
                  </div>
                }
              </app-card>

              @if (procurementTicketsFulfilled().length > 0) {
                <app-card style="margin-top: var(--space-5);">
                  <h3 class="section-title">Fulfilled</h3>
                  <div style="overflow-x:auto;">
                    <table>
                      <thead>
                        <tr>
                          <th>Request ID</th><th>Item</th><th>Qty</th><th>Department</th><th>Priority</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (r of procurementTicketsFulfilled(); track r.id) {
                          <tr>
                            <td><strong>{{ r.requestCode }}</strong></td>
                            <td>{{ r.item }}</td>
                            <td>{{ r.qty }}</td>
                            <td>{{ r.machine }}</td>
                            <td>
                              <span class="badge"
                                [class.badge--high]="r.priority === 'High'"
                                [class.badge--medium]="r.priority === 'Medium'"
                                [class.badge--low]="r.priority === 'Low'">{{ r.priority }}</span>
                            </td>
                            <td>
                              <span class="badge"
                                [class.badge--approved]="r.status === 'Fulfilled'"
                                [class.badge--pending]="r.status === 'SentToExternal'">
                                {{ r.status === 'SentToExternal' ? 'Sent to External' : 'Fulfilled' }}
                              </span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </app-card>
              }
            }
          }

          <!-- Tickets Tab -->
          @if (activeTab() === 'tickets') {
            <app-card>
              <h3 class="section-title">All Tickets</h3>
              @if (tickets().length > 0) {
                <div style="overflow-x:auto;">
                  <table>
                    <thead>
                      <tr>
                        <th>Ticket ID</th><th>Priority</th><th>Status</th>
                        <th>Department</th><th>Description</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (ticket of tickets(); track ticket.id) {
                        <tr>
                          <td><strong>{{ ticket.id }}</strong></td>
                          <td>
                            <span class="badge"
                              [class.badge--high]="ticket.priority === 'High'"
                              [class.badge--medium]="ticket.priority === 'Medium'"
                              [class.badge--low]="ticket.priority === 'Low'"
                            >{{ ticket.priority }}</span>
                          </td>
                          <td>
                            <span class="badge"
                              [class.badge--open]="ticket.status === 'Open'"
                              [class.badge--pending]="ticket.status === 'Pending'"
                              [class.badge--approved]="ticket.status === 'Closed'"
                            >{{ ticket.status }}</span>
                          </td>
                          <td>{{ ticket.currentDepartment }}</td>
                          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ ticket.description }}</td>
                          <td>
                            @if (ticket.status !== 'Closed') {
                              <app-button size="sm" (clicked)="startCloseTicket(ticket.id)">Close</app-button>
                            } @else {
                              <span style="color:var(--text-muted); font-size:var(--font-xs);">Closed</span>
                            }
                          </td>
                        </tr>
                        @if (closingTicketId() === ticket.id) {
                          <tr>
                            <td colspan="6" class="close-form-cell">
                              <div class="close-form">
                                <label class="close-form__label">Closing Note <span style="color:var(--accent-red);">*</span></label>
                                <textarea class="close-form__textarea" [(ngModel)]="closingTicketComment" rows="3"
                                  placeholder="Describe the resolution or action taken..."></textarea>
                                @if (closeTicketError) {
                                  <p class="close-form__error">{{ closeTicketError }}</p>
                                }
                                <div class="close-form__actions">
                                  <app-button size="sm" variant="danger" (clicked)="confirmCloseTicket(ticket.id)">Confirm Close</app-button>
                                  <app-button size="sm" variant="secondary" (clicked)="cancelCloseTicket()">Cancel</app-button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        }
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="empty-state">
                  <div class="empty-state__title">No tickets found</div>
                  <div class="empty-state__msg">Tickets raised by supervisors will appear here.</div>
                </div>
              }
            </app-card>
          }

          <!-- Threshold Alerts Tab -->
          @if (activeTab() === 'threshold') {
            <app-card>
              <h3 class="section-title">Threshold Alerts</h3>
              @if (alertItems().length === 0 && items().length > 0) {
                <div class="no-alerts">
                  <p>All items are above their thresholds. Stock levels are healthy.</p>
                </div>
              } @else if (items().length === 0) {
                <div class="empty-state">
                  <div class="empty-state__title">No items to monitor</div>
                  <div class="empty-state__msg">Add stock items first to see threshold alerts.</div>
                </div>
              } @else {
                <p style="color:var(--text-muted); font-size:var(--font-sm); margin-bottom:var(--space-4);">
                  Items sorted by criticality (lowest stock ratio first).
                </p>
                <div class="alert-list">
                  @for (item of alertItems(); track item.id) {
                    <div class="alert-card" [class.critical]="item.ratio < 0.3" [class.warning]="item.ratio >= 0.3">
                      <div class="alert-card__info">
                        <div class="alert-card__name">{{ item.name }}</div>
                        <div class="alert-card__category">{{ item.category }}</div>
                      </div>
                      <div class="alert-card__stats">
                        <div class="alert-stat">
                          <span class="alert-stat__label">Current</span>
                          <span class="alert-stat__value" [class.text-critical]="item.ratio < 0.3">{{ item.qty }}</span>
                        </div>
                        <div class="alert-stat">
                          <span class="alert-stat__label">Threshold</span>
                          <span class="alert-stat__value">{{ item.threshold }}</span>
                        </div>
                        <div class="alert-stat">
                          <span class="alert-stat__label">Deficit</span>
                          <span class="alert-stat__value text-critical">-{{ item.threshold - item.qty }}</span>
                        </div>
                      </div>
                      <div class="alert-card__bar-wrap">
                        <div class="alert-bar">
                          <div
                            class="alert-bar__fill"
                            [class.alert-bar__fill--critical]="item.ratio < 0.3"
                            [class.alert-bar__fill--warning]="item.ratio >= 0.3"
                            [style.width.%]="item.ratio * 100"
                          ></div>
                        </div>
                        <span class="alert-pct">{{ (item.ratio * 100) | number:'1.0-0' }}% of threshold</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </app-card>
          }
        </div>
      </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <app-modal [open]="modalOpen()" title="Add Stock Item" (closed)="closeModal()">
      @if (duplicateMsg()) {
        <div class="duplicate-alert">&#9888; {{ duplicateMsg() }}</div>
      }
      <form (ngSubmit)="submitAddForm()" novalidate>
        <div class="form-grid">
          <app-form-field label="Category" fieldId="iCat" [error]="addErrors().category" [required]="true">
            <select id="iCat" [ngModel]="addForm().category" (ngModelChange)="updateAddField('category', $event)" name="iCat">
              <option value="">Select category</option>
              <option value="Packing Material">Packing Material</option>
              <option value="Consumables">Consumables</option>
              <option value="Machine Spare">Machine Spare</option>
              <option value="Electrical">Electrical</option>
              <option value="Other">Other</option>
            </select>
          </app-form-field>
          <app-form-field label="Item Name" fieldId="iName" [error]="addErrors().name" [required]="true">
            <input type="text" id="iName" [ngModel]="addForm().name" (ngModelChange)="updateAddField('name', $event)" name="iName" placeholder="e.g. Carton Box" />
          </app-form-field>
          <app-form-field label="Quantity" fieldId="iQty" [error]="addErrors().qty" [required]="true">
            <input type="number" id="iQty" [ngModel]="addForm().qty" (ngModelChange)="updateAddField('qty', +$event)" name="iQty" min="0" placeholder="0" />
          </app-form-field>
          <app-form-field label="Reorder Threshold" fieldId="iThresh" [error]="addErrors().threshold" [required]="true">
            <input type="number" id="iThresh" [ngModel]="addForm().threshold" (ngModelChange)="updateAddField('threshold', +$event)" name="iThresh" min="1" placeholder="10" />
          </app-form-field>
          <app-form-field label="Unit" fieldId="iUnit" [error]="addErrors().unit" [required]="true">
            <select id="iUnit" [ngModel]="addForm().unit" (ngModelChange)="updateAddField('unit', $event)" name="iUnit">
              <option value="">Select unit</option>
              <option value="Pieces">Pieces (pcs)</option>
              <option value="Kilograms">Kilograms (kg)</option>
              <option value="Grams">Grams (g)</option>
              <option value="Litres">Litres (L)</option>
              <option value="Millilitres">Millilitres (mL)</option>
              <option value="Metres">Metres (m)</option>
              <option value="Centimetres">Centimetres (cm)</option>
              <option value="Boxes">Boxes</option>
              <option value="Packets">Packets</option>
              <option value="Units">Units</option>
              <option value="Sets">Sets</option>
              <option value="Rolls">Rolls</option>
            </select>
          </app-form-field>
          <app-form-field label="Location" fieldId="iLoc" [error]="addErrors().location" [required]="true">
            <input type="text" id="iLoc" [ngModel]="addForm().location" (ngModelChange)="updateAddField('location', $event)" name="iLoc" placeholder="e.g. Warehouse A, Shelf 3" />
          </app-form-field>
        </div>
        <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:var(--space-4);">
          <app-button variant="secondary" type="button" (clicked)="closeModal()">Cancel</app-button>
          <app-button variant="primary" type="submit">Add Item</app-button>
        </div>
      </form>
    </app-modal>

    <!-- Update Item Modal -->
    <app-modal [open]="updateModalOpen()" [title]="'Update Stock: ' + (updatingItem()?.name ?? '')" (closed)="closeUpdateModal()">
      <form (ngSubmit)="submitUpdateForm()" novalidate>
        <p style="font-size:var(--font-xs); color:var(--text-muted); margin-bottom:var(--space-4);">
          Category: <strong>{{ updatingItem()?.category }}</strong>
        </p>
        <div class="form-grid">
          <app-form-field label="Quantity" fieldId="uQty" [error]="updateErrors().qty" [required]="true">
            <input type="number" id="uQty" [ngModel]="updateForm().qty" (ngModelChange)="updateUpdateField('qty', +$event)" name="uQty" min="0" />
          </app-form-field>
          <app-form-field label="Reorder Threshold" fieldId="uThresh" [error]="updateErrors().threshold" [required]="true">
            <input type="number" id="uThresh" [ngModel]="updateForm().threshold" (ngModelChange)="updateUpdateField('threshold', +$event)" name="uThresh" min="1" />
          </app-form-field>
          <app-form-field label="Unit" fieldId="uUnit" [error]="updateErrors().unit" [required]="true">
            <select id="uUnit" [ngModel]="updateForm().unit" (ngModelChange)="updateUpdateField('unit', $event)" name="uUnit">
              <option value="">Select unit</option>
              <option value="Pieces">Pieces (pcs)</option>
              <option value="Kilograms">Kilograms (kg)</option>
              <option value="Grams">Grams (g)</option>
              <option value="Litres">Litres (L)</option>
              <option value="Millilitres">Millilitres (mL)</option>
              <option value="Metres">Metres (m)</option>
              <option value="Centimetres">Centimetres (cm)</option>
              <option value="Boxes">Boxes</option>
              <option value="Packets">Packets</option>
              <option value="Units">Units</option>
              <option value="Sets">Sets</option>
              <option value="Rolls">Rolls</option>
            </select>
          </app-form-field>
          <app-form-field label="Location" fieldId="uLoc" [error]="updateErrors().location" [required]="true">
            <input type="text" id="uLoc" [ngModel]="updateForm().location" (ngModelChange)="updateUpdateField('location', $event)" name="uLoc" placeholder="e.g. Warehouse A, Shelf 3" />
          </app-form-field>
        </div>
        <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:var(--space-4);">
          <app-button variant="secondary" type="button" (clicked)="closeUpdateModal()">Cancel</app-button>
          <app-button variant="primary" type="submit">Save Changes</app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width); height: 100%; background: var(--brown-900);
      display: flex; flex-direction: column; padding: var(--space-4) 0;
      color: #fff; flex-shrink: 0; overflow-y: auto;
    }
    .sidebar nav { flex: 1; display: flex; flex-direction: column; padding-top: var(--space-2); }
    .sidebar nav button {
      display: block; width: 100%; text-align: left;
      padding: 14px 20px; color: rgba(255,255,255,0.8);
      font-size: var(--font-sm); font-weight: 500;
      border: none; background: none; cursor: pointer;
      border-left: 3px solid transparent;
      transition: background var(--transition), color var(--transition), border-left-color var(--transition), padding-left var(--transition);
    }
    .sidebar nav button:hover { color: #fff; background: rgba(255,255,255,0.08); padding-left: 24px; }
    .sidebar nav button.active { color: #fff; background: var(--red-700); font-weight: 700; border-left-color: rgba(255,255,255,0.6); }
    .duplicate-alert { background: #fef3c7; border: 1px solid #fbbf24; border-radius: var(--radius-md); padding: 10px 14px; font-size: var(--font-sm); color: #92400e; font-weight: 600; margin-bottom: var(--space-4); }
    .logout-btn {
      margin: var(--space-6) var(--space-4) var(--space-4);
      padding: 10px; border-radius: var(--radius-md);
      background: #fff; color: var(--red-700); border: none;
      cursor: pointer; font-size: var(--font-sm); font-weight: 700;
      transition: background var(--transition), color var(--transition);
      width: calc(100% - 2 * var(--space-4));
    }
    .logout-btn:hover { background: var(--red-300); color: #fff; }

    .section-title { margin-bottom: var(--space-4); font-size: var(--font-lg); font-weight: 700; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
    .section-header .section-title { margin-bottom: 0; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-5); }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); margin-bottom: var(--space-5); }
    .chart-area { display: flex; align-items: center; gap: var(--space-6); }
    .donut {
      width: 140px; height: 140px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; position: relative;
    }
    .donut__hole {
      width: 82px; height: 82px; border-radius: 50%;
      background: var(--white); position: absolute;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .donut__val { font-size: var(--font-xl); font-weight: 800; color: var(--text-dark); line-height: 1; }
    .donut__lbl { font-size: var(--font-xs); color: var(--text-muted); }
    .donut-legend { display: flex; flex-direction: column; gap: var(--space-2); }
    .legend-item { display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-sm); color: var(--text-dark); }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .bar-wrap { padding-top: var(--space-2); }
    @media (max-width: 900px) { .charts-row { grid-template-columns: 1fr; } }

    .icon-btn {
      background: none; border: 1px solid var(--gray-border); border-radius: var(--radius-sm);
      padding: 3px 8px; cursor: pointer; color: var(--text-muted); font-size: var(--font-xs);
      transition: background var(--transition), color var(--transition);
    }
    .icon-btn:hover { background: #fee2e2; color: var(--accent-red); border-color: #fca5a5; }

    .no-alerts {
      text-align: center; padding: var(--space-8); color: var(--accent-green); font-weight: 600;
    }
    .alert-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .alert-card {
      border-radius: var(--radius-md); padding: var(--space-4);
      display: grid; grid-template-columns: 1fr auto auto;
      gap: var(--space-4); align-items: center; border-left: 4px solid transparent;
      transition: transform var(--transition), box-shadow var(--transition);
    }
    .alert-card:hover { transform: translateX(2px); }
    .alert-card.critical { background: #fff5f5; border-left-color: var(--accent-red); }
    .alert-card.warning  { background: #fffbeb; border-left-color: #f59e0b; }
    .alert-card__info { min-width: 0; }
    .alert-card__name { font-weight: 600; color: var(--text-dark); font-size: var(--font-sm); }
    .alert-card__category { font-size: var(--font-xs); color: var(--text-muted); margin-top: 2px; }
    .alert-card__stats { display: flex; gap: var(--space-4); }
    .alert-stat { text-align: center; }
    .alert-stat__label { display: block; font-size: var(--font-xs); color: var(--text-muted); }
    .alert-stat__value { display: block; font-size: var(--font-base); font-weight: 700; color: var(--text-dark); }
    .text-critical { color: var(--accent-red) !important; }
    .alert-card__bar-wrap { min-width: 120px; }
    .alert-bar { height: 6px; background: var(--gray-border); border-radius: var(--radius-full); overflow: hidden; margin-bottom: 4px; }
    .alert-bar__fill { height: 100%; border-radius: var(--radius-full); transition: width 0.5s ease; }
    .alert-bar__fill--critical { background: var(--accent-red); }
    .alert-bar__fill--warning  { background: #f59e0b; }
    .alert-pct { font-size: var(--font-xs); color: var(--text-muted); }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }

    .spare-sub-tabs {
      display: flex; gap: 4px;
      margin-bottom: var(--space-5);
      border-bottom: 2px solid var(--gray-border);
      padding-bottom: 0;
    }
    .spare-sub-tabs button {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 18px; border: none; background: none; cursor: pointer;
      font-size: var(--font-sm); font-weight: 500; color: var(--text-muted);
      border-bottom: 2px solid transparent; margin-bottom: -2px;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      transition: color var(--transition), border-color var(--transition);
    }
    .spare-sub-tabs button:hover { color: var(--text-dark); }
    .spare-sub-tabs button.active { color: var(--red-700); border-bottom-color: var(--red-700); font-weight: 700; }
    .sub-tab-badge {
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--red-700); color: #fff; border-radius: 999px;
      font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; padding: 0 4px;
    }

    .close-form-cell { padding: 0 !important; background: #fafafa; }
    .close-form { padding: 12px 16px; border-top: 1px solid var(--gray-border); }
    .close-form__label { display: block; font-size: var(--font-sm); font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
    .close-form__textarea { width: 100%; padding: 8px; border: 1px solid var(--gray-border); border-radius: var(--radius-sm); font-size: var(--font-sm); resize: vertical; box-sizing: border-box; }
    .close-form__textarea:focus { outline: none; border-color: var(--red-700); }
    .close-form__error { color: var(--accent-red); font-size: var(--font-xs); margin: 4px 0 0; }
    .close-form__actions { display: flex; gap: 8px; margin-top: 10px; }
  `]
})
export class InventoryComponent implements OnInit {
  private invApi     = inject(InventoryApiService);
  private ticketApi  = inject(TicketApiService);
  private spareApi   = inject(SpareRequestApiService);
  auth               = inject(AuthService);
  private confirm    = inject(ConfirmService);
  private route      = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  activeTab    = signal<'stock' | 'spare' | 'tickets' | 'threshold'>('stock');
  items        = signal<InventoryItemResponse[]>([]);
  tickets      = signal<TicketResponse[]>([]);
  spareRequests = signal<SpareRequestResponse[]>([]);
  modalOpen    = signal(false);
  spareActionMsg   = signal('');
  spareActionError = signal(false);

  // ── Close ticket state ─────────────────────────────────────────────────
  closingTicketId      = signal<string | null>(null);
  closingTicketComment = '';
  closeTicketError     = '';

  // ── Stock search ────────────────────────────────────────────────────────
  stockSearch = signal('');
  filteredItems = computed(() => {
    const q = this.stockSearch().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q)
    );
  });

  // ── Procurement status per item name ───────────────────────────────────
  itemProcStatus = computed(() => {
    const map = new Map<string, string>();
    const priority = ['ProcurementApproved', 'Approved', 'SentToExternal', 'Rejected'];
    for (const r of this.spareRequests()) {
      if (priority.includes(r.status)) {
        const key = r.item.trim().toLowerCase();
        const existing = map.get(key);
        if (!existing || priority.indexOf(r.status) < priority.indexOf(existing)) {
          map.set(key, r.status);
        }
      }
    }
    return map;
  });

  procStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ProcurementApproved: 'Fulfill Request',
      Approved:            'Awaiting Procurement',
      SentToExternal:      'Ext. Procurement',
      Rejected:            'Rejected',
    };
    return labels[status] ?? status;
  }

  // ── Duplicate-add guard ────────────────────────────────────────────────
  duplicateMsg = signal('');

  // ── Update modal ───────────────────────────────────────────────────────
  updateModalOpen = signal(false);
  updatingItem    = signal<InventoryItemResponse | null>(null);
  private emptyUpdateForm   = (): UpdateForm   => ({ qty: 0, threshold: 1, unit: '', location: '' });
  private emptyUpdateErrors = (): UpdateErrors => ({ qty: '', threshold: '', unit: '', location: '' });
  updateForm   = signal<UpdateForm>(this.emptyUpdateForm());
  updateErrors = signal<UpdateErrors>(this.emptyUpdateErrors());

  private emptyForm   = (): AddForm   => ({ category: '', name: '', qty: 0, threshold: 1, unit: '', location: '' });
  private emptyErrors = (): AddErrors => ({ category: '', name: '', qty: '', threshold: '', unit: '', location: '' });
  addForm   = signal<AddForm>(this.emptyForm());
  addErrors = signal<AddErrors>(this.emptyErrors());

  lowStockCount = computed(() => this.items().filter(i => i.qty < i.threshold).length);

  spareSubTab = signal<'spare-requests' | 'procurement-tickets'>('spare-requests');

  // Technician-originated spare requests (SPR- prefix)
  pendingSpare = computed(() =>
    this.spareRequests().filter(r => r.status === 'ProcurementApproved' && !r.requestCode.startsWith('PRO-'))
  );

  historySpare = computed(() =>
    this.spareRequests().filter(r =>
      (r.status === 'Fulfilled' || r.status === 'SentToExternal') && !r.requestCode.startsWith('PRO-')
    )
  );

  // Procurement-originated spare requests (PRO- prefix)
  procurementTickets          = computed(() => this.spareRequests().filter(r => r.requestCode.startsWith('PRO-')));
  procurementTicketsPending   = computed(() => this.procurementTickets().filter(r => r.status === 'ProcurementApproved'));
  procurementTicketsFulfilled = computed(() =>
    this.procurementTickets().filter(r => r.status === 'Fulfilled' || r.status === 'SentToExternal')
  );

  stockDonutStyle = computed(() => {
    const low   = this.lowStockCount();
    const ok    = this.items().length - low;
    const total = this.items().length || 1;
    const okDeg = (ok / total) * 360;
    return `conic-gradient(var(--accent-green) 0deg ${okDeg}deg, var(--accent-red) ${okDeg}deg 360deg)`;
  });

  categoryBarData = computed(() => {
    const cats = ['Packing', 'Consum.', 'Spare', 'Electr.', 'Other'];
    const full  = ['Packing Material', 'Consumables', 'Machine Spare', 'Electrical', 'Other'];
    const max   = Math.max(...full.map(c => this.items().filter(i => i.category === c).length), 1);
    return full.map((cat, idx) => {
      const value = this.items().filter(i => i.category === cat).length;
      return { label: cats[idx], value, height: Math.round((value / max) * 90) };
    });
  });

  alertItems = computed(() =>
    this.items()
      .filter(i => i.qty < i.threshold)
      .map(i => ({ ...i, ratio: i.qty / i.threshold }))
      .sort((a, b) => a.ratio - b.ratio)
  );

  stockStatusFor(r: SpareRequestResponse): 'available' | 'low' | 'none' {
    const match = this.items().find(i => i.name.toLowerCase() === r.item.toLowerCase());
    if (!match) return 'none';
    if (match.qty >= r.qty) return 'available';
    if (match.qty > 0) return 'low';
    return 'none';
  }

  startCloseTicket(id: string): void {
    this.closingTicketId.set(id);
    this.closingTicketComment = '';
    this.closeTicketError = '';
  }

  cancelCloseTicket(): void {
    this.closingTicketId.set(null);
    this.closingTicketComment = '';
    this.closeTicketError = '';
  }

  async confirmCloseTicket(id: string): Promise<void> {
    const comment = this.closingTicketComment.trim().replace(/<[^>]*>/g, '');
    if (!comment) { this.closeTicketError = 'A closing note is required.'; return; }
    if (comment.length > 500) { this.closeTicketError = 'Note cannot exceed 500 characters.'; return; }
    if (!(await this.confirm.ask('Close this supervisor ticket? This cannot be undone.'))) return;
    const handledBy = this.auth.currentUser()?.name ?? 'Inventory';
    this.ticketApi.close(id, comment, handledBy).subscribe({
      next: updated => {
        this.tickets.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.cancelCloseTicket();
      }
    });
  }

  async logout(): Promise<void> {
    if (!(await this.confirm.ask('Are you sure you want to log out?', 'Log Out'))) return;
    this.auth.logout();
  }

  ngOnInit() {
    this.invApi.getAll().subscribe({ next: list => this.items.set(list) });
    this.ticketApi.getAll().subscribe({ next: list => this.tickets.set(list.filter(t => t.currentDepartment === 'Inventory')) });
    this.spareApi.getAll().subscribe({ next: list => this.spareRequests.set(list) });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const tab = params.get('tab') as 'stock' | 'spare' | 'tickets' | 'threshold' | null;
      if (tab) this.activeTab.set(tab);
    });
  }

  async fulfillRequest(id: number): Promise<void> {
    if (!(await this.confirm.ask('Fulfill this spare request and deduct from stock?'))) return;
    this.spareApi.fulfill(id).subscribe({
      next: updated => {
        this.spareRequests.update(list => list.map(r => r.id === id ? updated : r));
        this.invApi.getAll().subscribe({ next: list => this.items.set(list) });
        this.showSpareMsg('Request fulfilled and stock deducted successfully.', false);
      },
      error: err => this.showSpareMsg(err?.error?.message ?? 'Failed to fulfill request.', true),
    });
  }

  async requestExternal(id: number): Promise<void> {
    if (!(await this.confirm.ask('Send this request to External Procurement? The procurement team will review and action it.'))) return;
    this.spareApi.inventorySendToExternal(id).subscribe({
      next: updated => {
        this.spareRequests.update(list => list.map(r => r.id === id ? updated : r));
        this.showSpareMsg('Request sent to External Procurement successfully.', false);
      },
      error: err => this.showSpareMsg(err?.error?.message ?? 'Failed to send to external procurement.', true),
    });
  }

  async deleteSpareRequest(id: number): Promise<void> {
    if (!(await this.confirm.ask('Delete this spare request record?'))) return;
    this.spareApi.delete(id).subscribe({
      next: () => this.spareRequests.update(list => list.filter(r => r.id !== id)),
    });
  }

  async clearSpareHistory(): Promise<void> {
    if (!(await this.confirm.ask('Clear all handled spare request history? This cannot be undone.'))) return;
    this.spareApi.deleteCompleted().subscribe({
      next: () => this.spareRequests.update(list => list.filter(r => r.status === 'ProcurementApproved')),
    });
  }

  private showSpareMsg(msg: string, isError: boolean): void {
    this.spareActionMsg.set(msg);
    this.spareActionError.set(isError);
    setTimeout(() => this.spareActionMsg.set(''), 5000);
  }

  openAddModal(): void {
    this.addForm.set(this.emptyForm());
    this.addErrors.set(this.emptyErrors());
    this.duplicateMsg.set('');
    this.modalOpen.set(true);
  }

  closeModal(): void { this.modalOpen.set(false); }

  updateAddField(field: keyof AddForm, value: string | number): void {
    this.addForm.update(f => ({ ...f, [field]: value }));
    this.addErrors.update(e => ({ ...e, [field]: '' }));
    this.duplicateMsg.set('');
  }

  async submitAddForm(): Promise<void> {
    const f = this.addForm();
    const errors: AddErrors = {
      category:  !f.category          ? 'Category is required.'          : '',
      name:      !f.name.trim()       ? 'Item name is required.'         : '',
      qty:       f.qty < 0            ? 'Quantity cannot be negative.'   : '',
      threshold: f.threshold < 1      ? 'Threshold must be at least 1.'  : '',
      unit:      !f.unit             ? 'Unit is required.'              : '',
      location:  !f.location.trim()   ? 'Location is required.'          : '',
    };
    this.addErrors.set(errors);
    if (Object.values(errors).some(Boolean)) return;

    const duplicate = this.items().find(i =>
      i.name.toLowerCase() === f.name.trim().toLowerCase() &&
      i.category === f.category
    );
    if (duplicate) {
      this.duplicateMsg.set(
        `"${f.name.trim()}" already exists in the ${f.category} category. Use the Update button in the stock table to update its quantity or details.`
      );
      return;
    }

    if (!(await this.confirm.ask(`Add "${f.name.trim()}" (qty: ${f.qty}) to stock?`))) return;
    this.invApi.create({ ...f, name: f.name.trim(), location: f.location.trim() }).subscribe({
      next: item => {
        this.items.update(list => [...list, item]);
        this.closeModal();
      },
    });
  }

  openUpdateModal(item: InventoryItemResponse): void {
    this.updatingItem.set(item);
    this.updateForm.set({ qty: item.qty, threshold: item.threshold, unit: item.unit, location: item.location });
    this.updateErrors.set(this.emptyUpdateErrors());
    this.updateModalOpen.set(true);
  }

  closeUpdateModal(): void {
    this.updateModalOpen.set(false);
    this.updatingItem.set(null);
  }

  updateUpdateField(field: keyof UpdateForm, value: string | number): void {
    this.updateForm.update(f => ({ ...f, [field]: value }));
    this.updateErrors.update(e => ({ ...e, [field]: '' }));
  }

  async submitUpdateForm(): Promise<void> {
    const f    = this.updateForm();
    const item = this.updatingItem();
    if (!item) return;
    const errors: UpdateErrors = {
      qty:       f.qty < 0       ? 'Quantity cannot be negative.'  : '',
      threshold: f.threshold < 1 ? 'Threshold must be at least 1.' : '',
      unit:      !f.unit         ? 'Unit is required.'             : '',
      location:  !f.location.trim() ? 'Location is required.'      : '',
    };
    this.updateErrors.set(errors);
    if (Object.values(errors).some(Boolean)) return;
    if (!(await this.confirm.ask(`Update "${item.name}" stock details?`))) return;
    this.invApi.update(item.id, {
      category: item.category,
      name:     item.name,
      qty:      f.qty,
      threshold: f.threshold,
      unit:     f.unit,
      location: f.location.trim(),
    }).subscribe({
      next: updated => {
        this.items.update(list => list.map(i => i.id === item.id ? updated : i));
        this.closeUpdateModal();
      },
      error: err => this.updateErrors.update(e => ({ ...e, qty: err?.error?.message ?? 'Update failed.' })),
    });
  }

  async removeItem(id: number): Promise<void> {
    if (!(await this.confirm.ask('Remove this stock item? This cannot be undone.'))) return;
    this.invApi.delete(id).subscribe({
      next: () => this.items.update(list => list.filter(i => i.id !== id)),
    });
  }
}
