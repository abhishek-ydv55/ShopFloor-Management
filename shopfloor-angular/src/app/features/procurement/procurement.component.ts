import { Component, signal, computed, OnInit, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DashboardTopbarComponent } from '../../ui/dashboard-topbar/dashboard-topbar.component';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { FormFieldComponent } from '../../ui/form-field/form-field.component';
import { AuthService } from '../../core/services/auth.service';
import {
  ProcurementApiService,
  ProcurementTicketResponse,
  InternalRequestResponse,
  ExternalRequestResponse,
} from '../../core/services/api/procurement-api.service';
import { InventoryApiService, InventoryItemResponse } from '../../core/services/api/inventory-api.service';
import { SpareRequestApiService, SpareRequestResponse } from '../../core/services/api/spare-request-api.service';
import { TicketApiService, TicketResponse } from '../../core/services/api/ticket-api.service';
import { ConfirmService } from '../../core/services/confirm.service';

type Tab = 'home' | 'tickets' | 'spare' | 'request' | 'external';
interface StockLookup { qty: number; unit: string; location: string; }
interface ReqForm   { item: string; qty: number; dept: string; priority: 'Low' | 'Medium' | 'High'; }
interface ReqErrors { item: string; qty: string; dept: string; }

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [FormsModule, DashboardTopbarComponent, CardComponent, ButtonComponent, FormFieldComponent],
  template: `
    <div class="app-shell">
      <app-dashboard-topbar title="Procurement"></app-dashboard-topbar>

      <div class="app-body">
      <aside class="sidebar" role="navigation" aria-label="Procurement navigation">
        <nav>
          <button [class.active]="activeTab() === 'home'"     (click)="switchTab('home')">Home</button>
          <button [class.active]="activeTab() === 'spare'"    (click)="switchTab('spare')">
            Spare Requests
            @if (pendingSpareRequests().length > 0) {
              <span class="badge-count">{{ pendingSpareRequests().length }}</span>
            }
          </button>
          <button [class.active]="activeTab() === 'tickets'"  (click)="switchTab('tickets')">Department Tickets</button>
          <button [class.active]="activeTab() === 'request'"  (click)="switchTab('request')">Procurement Request</button>
          <button [class.active]="activeTab() === 'external'" (click)="switchTab('external')">External Procurement</button>
        </nav>
        <button class="logout-btn" (click)="logout()">Log Out</button>
      </aside>

      <div class="main-content">
        <div class="page-content">

          <!-- HOME -->
          @if (activeTab() === 'home') {
            <h2 class="page-title">Procurement Dashboard</h2>
            <div class="cards-grid">
              <app-card variant="stat"><span>Pending Spare Requests</span><h3 style="color:#f59e0b;">{{ pendingSpareRequests().length }}</h3></app-card>
              <app-card variant="stat"><span>Internal Requests</span><h3>{{ internalRequests().length }}</h3></app-card>
              <app-card variant="stat"><span>Approved</span><h3 style="color:var(--accent-green);">{{ approvedCount() }}</h3></app-card>
              <app-card variant="stat"><span>External Requests</span><h3 style="color:var(--red-700);">{{ externalEntries().length }}</h3></app-card>
            </div>

            <div class="charts-row">
              <app-card>
                <h3 class="section-title">Request Status</h3>
                @if (internalRequests().length > 0) {
                  <div class="chart-area">
                    <div class="donut" [style.background]="donutStyle()">
                      <div class="donut__hole">
                        <span class="donut__val">{{ donutData().total }}</span>
                        <span class="donut__lbl">Total</span>
                      </div>
                    </div>
                    <div class="donut-legend">
                      <div class="legend-item"><span class="legend-dot" style="background:#f59e0b;"></span>Pending ({{ donutData().pending }})</div>
                      <div class="legend-item"><span class="legend-dot" style="background:var(--accent-green);"></span>Approved ({{ donutData().approved }})</div>
                      <div class="legend-item"><span class="legend-dot" style="background:var(--accent-red);"></span>Rejected ({{ donutData().rejected }})</div>
                    </div>
                  </div>
                } @else {
                  <div class="empty-state">
                    <div class="empty-state__title">No requests yet</div>
                    <div class="empty-state__msg">Submit procurement requests to see analytics here.</div>
                  </div>
                }
              </app-card>

              <app-card>
                <h3 class="section-title">Tickets by Department</h3>
                @if (procTickets().length > 0) {
                  <div class="bar-wrap">
                    <svg viewBox="0 0 310 150" width="100%" style="display:block;">
                      <line x1="0" y1="30"  x2="310" y2="30"  stroke="#eee" stroke-width="1"/>
                      <line x1="0" y1="75"  x2="310" y2="75"  stroke="#eee" stroke-width="1"/>
                      <line x1="0" y1="120" x2="310" y2="120" stroke="#eee" stroke-width="1"/>
                      @for (bar of ticketBarData(); track bar.label; let i = $index) {
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
                } @else {
                  <div class="empty-state">
                    <div class="empty-state__title">No department tickets</div>
                    <div class="empty-state__msg">Add tickets in the Department Tickets tab.</div>
                  </div>
                }
              </app-card>
            </div>
          }

          <!-- SPARE REQUESTS (from Manager approval) -->
          @if (activeTab() === 'spare') {
            <h2 class="page-title">Spare Part Requests</h2>

            <!-- Pending action -->
            <app-card>
              <div class="section-header">
                <h3 class="section-title">Awaiting Procurement Decision</h3>
                <span style="font-size:var(--font-sm); color:var(--text-muted);">Manager-approved — check inventory and act</span>
              </div>

              @if (spareMsg()) {
                <p [style.color]="spareMsgError() ? 'var(--accent-red)' : 'var(--accent-green)'"
                   style="font-weight:600; margin-bottom:12px;">{{ spareMsg() }}</p>
              }

              @if (pendingSpareRequests().length > 0) {
                <div style="overflow-x:auto;">
                  <table>
                    <thead>
                      <tr>
                        <th>Request ID</th><th>Item</th><th>Qty</th><th>Machine / Task</th>
                        <th>Priority</th><th>By</th><th>Stock Check</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (r of pendingSpareRequests(); track r.id) {
                        <tr>
                          <td><strong>{{ r.requestCode }}</strong></td>
                          <td>{{ r.item }}</td>
                          <td>{{ r.qty }}</td>
                          <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ r.machine }}</td>
                          <td>
                            <span class="badge"
                              [class.badge--high]="r.priority === 'High'"
                              [class.badge--medium]="r.priority === 'Medium'"
                              [class.badge--low]="r.priority === 'Low'">{{ r.priority }}</span>
                          </td>
                          <td>{{ r.requestedBy }}</td>
                          <td>
                            @if (getStockStatus(r) === 'available') {
                              <span class="badge badge--approved">&#10003; In Stock ({{ getStockQty(r) }})</span>
                            } @else if (getStockStatus(r) === 'low') {
                              <span class="badge badge--medium">&#9888; Low ({{ getStockQty(r) }})</span>
                            } @else {
                              <span class="badge badge--high">&#10005; Not in Stock</span>
                            }
                          </td>
                          <td>
                            <div style="display:flex; gap:6px; flex-wrap:wrap;">
                              <app-button size="sm" variant="primary"
                                [disabled]="getStockStatus(r) !== 'available'"
                                (clicked)="spareApprove(r.id)"
                                title="{{ getStockStatus(r) !== 'available' ? 'Stock unavailable — use Send to External' : 'Approve and forward to Inventory' }}">
                                Approve
                              </app-button>
                              <app-button size="sm" variant="secondary"
                                (clicked)="spareSendToExternal(r.id)">
                                External
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
                  <div class="empty-state__msg">Manager-approved spare requests will appear here.</div>
                </div>
              }
            </app-card>

            <!-- History -->
            @if (resolvedSpareRequests().length > 0) {
              <app-card style="margin-top:var(--space-5);">
                <div class="section-header">
                  <h3 class="section-title">Handled Requests</h3>
                  <app-button variant="danger" size="sm" (clicked)="clearResolvedSpareRequests()">Clear Resolved</app-button>
                </div>
                <div style="overflow-x:auto;">
                  <table>
                    <thead>
                      <tr><th>Request ID</th><th>Item</th><th>Qty</th><th>Priority</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      @for (r of resolvedSpareRequests(); track r.id) {
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
                              [class.badge--approved]="r.status === 'ProcurementApproved' || r.status === 'Fulfilled'"
                              [class.badge--pending]="r.status === 'SentToExternal'">
                              {{ r.status === 'ProcurementApproved' ? 'Sent to Inventory' :
                                 r.status === 'SentToExternal'      ? 'Sent to External'  :
                                 r.status }}
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

          <!-- DEPARTMENT TICKETS -->
          @if (activeTab() === 'tickets') {
            <div class="page-header">
              <h2 class="page-title">Department Tickets</h2>
              <app-button variant="primary" size="sm" (clicked)="openNewTicketForm()">+ New Ticket</app-button>
            </div>

            @if (showNewTicketForm()) {
              <app-card style="margin-bottom: var(--space-5);">
                <h3 class="section-title">New Ticket</h3>
                <form (ngSubmit)="submitNewTicket()" novalidate>
                  <div class="form-grid">
                    <app-form-field label="Item / Subject" fieldId="tName" [error]="newTicketErrors().name" [required]="true">
                      <input type="text" id="tName" [ngModel]="newTicketForm().name" (ngModelChange)="updateTicketField('name', $event)" name="tName" placeholder="e.g. Bearing, Hydraulic Pump" />
                    </app-form-field>
                    <app-form-field label="Type" fieldId="tType" [required]="true">
                      <select id="tType" [ngModel]="newTicketForm().type" (ngModelChange)="updateTicketField('type', $event)" name="tType">
                        <option value="Purchase Request">Purchase Request</option>
                        <option value="Vendor Approval">Vendor Approval</option>
                        <option value="Stock Refill">Stock Refill</option>
                        <option value="Repair Order">Repair Order</option>
                      </select>
                    </app-form-field>
                    <app-form-field label="Department" fieldId="tDept" [error]="newTicketErrors().department" [required]="true">
                      <select id="tDept" [ngModel]="newTicketForm().department" (ngModelChange)="updateTicketField('department', $event)" name="tDept">
                        <option value="">Select department</option>
                        <option value="Production">Production</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Warehouse">Warehouse</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </app-form-field>
                    <app-form-field label="Priority" fieldId="tPriority">
                      <select id="tPriority" [ngModel]="newTicketForm().priority" (ngModelChange)="updateTicketField('priority', $event)" name="tPriority">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </app-form-field>
                  </div>
                  <app-form-field label="Description" fieldId="tDesc" [error]="newTicketErrors().description" [required]="true">
                    <textarea id="tDesc" [ngModel]="newTicketForm().description" (ngModelChange)="updateTicketField('description', $event)" name="tDesc" rows="3" placeholder="Describe the procurement need..."></textarea>
                  </app-form-field>
                  <div style="display:flex; gap:12px; margin-top:var(--space-2);">
                    <app-button variant="primary" type="submit">Create Ticket</app-button>
                    <app-button variant="secondary" type="button" (clicked)="showNewTicketForm.set(false)">Cancel</app-button>
                  </div>
                </form>
              </app-card>
            }

            @if (procTickets().length > 0) {
              <div class="tickets-layout">
                <div class="tickets-table-wrap">
                  <div style="overflow-x:auto;">
                    <table>
                      <thead>
                        <tr>
                          <th></th><th>ID</th><th>Name</th><th>Type</th>
                          <th>Department</th><th>Priority</th><th>Status</th><th>Created</th><th>Del</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (t of procTickets(); track t.id) {
                          <tr [class.selected-row]="selectedId() === t.id" (click)="selectTicket(t.id)" style="cursor:pointer;">
                            <td>
                              <input type="checkbox" [checked]="selectedId() === t.id"
                                (change)="selectTicket(t.id)" (click)="$event.stopPropagation()" style="cursor:pointer;" />
                            </td>
                            <td><strong>{{ t.id }}</strong></td>
                            <td>{{ t.name }}</td>
                            <td>{{ t.type }}</td>
                            <td>{{ t.department }}</td>
                            <td>
                              <span class="badge"
                                [class.badge--high]="t.priority === 'High' || t.priority === 'Critical'"
                                [class.badge--medium]="t.priority === 'Medium'"
                                [class.badge--low]="t.priority === 'Low'">{{ t.priority }}</span>
                            </td>
                            <td>
                              <span class="badge"
                                [class.badge--open]="t.status === 'Open'"
                                [class.badge--pending]="t.status === 'Pending'"
                                [class.badge--closed]="t.status === 'Closed'">{{ t.status }}</span>
                            </td>
                            <td>{{ t.createdAtDisplay }}</td>
                            <td (click)="$event.stopPropagation()">
                              <button class="icon-btn" title="Delete ticket" (click)="deleteTicket(t.id)">&#10005;</button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                @if (selectedTicket()) {
                  <div class="detail-panel">
                    <h4 class="detail-panel__title">Ticket Details</h4>
                    <div class="detail-field"><span class="detail-label">Name:</span> {{ selectedTicket()!.name }}</div>
                    <div class="detail-field"><span class="detail-label">Type:</span> {{ selectedTicket()!.type }}</div>
                    <div class="detail-field"><span class="detail-label">Department:</span> {{ selectedTicket()!.department }}</div>
                    <div class="detail-field"><span class="detail-label">Priority:</span> {{ selectedTicket()!.priority }}</div>
                    <div class="detail-field"><span class="detail-label">Status:</span> {{ selectedTicket()!.status }}</div>
                    <div class="detail-field"><span class="detail-label">Created On:</span> {{ selectedTicket()!.createdAtDisplay }}</div>
                    <div class="detail-field detail-field--desc">
                      <span class="detail-label">Description:</span>
                      <p>{{ selectedTicket()!.description }}</p>
                    </div>

                    @if (selectedTicket()!.remark) {
                      <div class="detail-remark">
                        <span class="detail-label">Remark:</span>
                        <p>{{ selectedTicket()!.remark }}</p>
                      </div>
                    }

                    @if (showAvailability() && availInfo()) {
                      <div class="avail-panel">
                        <strong>Stock Availability</strong>
                        <p>Available: <strong>{{ availInfo()!.qty }} {{ availInfo()!.unit }}</strong></p>
                        <p>Location: {{ availInfo()!.location }}</p>
                        @if (availInfo()!.qty === 0) {
                          <p class="avail-none">Not available in stock — external sourcing recommended.</p>
                        }
                      </div>
                    }

                    <div class="detail-actions">
                      <button class="action-btn" (click)="toggleRemark()">Add Remark</button>
                      <button class="action-btn" (click)="toggleAvailability()">Check Availability</button>
                      <button
                        class="action-btn action-btn--primary"
                        [disabled]="selectedTicket()!.sentToExternal"
                        (click)="sendToExternal()"
                      >{{ selectedTicket()!.sentToExternal ? 'Requested' : 'Request' }}</button>
                    </div>

                    @if (showRemarkForm()) {
                      <div class="remark-form">
                        <textarea
                          [ngModel]="remarkText()" (ngModelChange)="remarkText.set($event)"
                          name="remark" rows="3" placeholder="Add your remark here..."
                          class="remark-textarea"
                        ></textarea>
                        <div style="display:flex; gap:8px; margin-top:8px;">
                          <button class="action-btn action-btn--primary" (click)="saveRemark()">Save Remark</button>
                          <button class="action-btn" (click)="showRemarkForm.set(false)">Cancel</button>
                        </div>
                      </div>
                    }

                    @if (actionMsg()) {
                      <p class="action-success">{{ actionMsg() }}</p>
                    }
                  </div>
                } @else {
                  <div class="detail-panel detail-panel--empty">
                    <p>Select a ticket to view details.</p>
                  </div>
                }
              </div>
            } @else {
              <app-card>
                <div class="empty-state">
                  <div class="empty-state__title">No department tickets</div>
                  <div class="empty-state__msg">Click "+ New Ticket" to log a procurement request from a department.</div>
                </div>
              </app-card>
            }
          }

          <!-- SUPERVISOR TICKETS for Procurement -->
          @if (activeTab() === 'tickets') {
            <app-card style="margin-top: var(--space-5);">
              <h3 class="section-title">Supervisor Tickets</h3>
              @if (supervisorTickets().length > 0) {
                <div style="overflow-x:auto;">
                  <table>
                    <thead>
                      <tr><th>Ticket ID</th><th>Priority</th><th>Status</th><th>Description</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      @for (t of supervisorTickets(); track t.id) {
                        <tr>
                          <td><strong>{{ t.id }}</strong></td>
                          <td>
                            <span class="badge"
                              [class.badge--high]="t.priority === 'High'"
                              [class.badge--medium]="t.priority === 'Medium'"
                              [class.badge--low]="t.priority === 'Low'">{{ t.priority }}</span>
                          </td>
                          <td>
                            <span class="badge"
                              [class.badge--open]="t.status === 'Open'"
                              [class.badge--pending]="t.status === 'Pending'"
                              [class.badge--approved]="t.status === 'Closed'">{{ t.status }}</span>
                          </td>
                          <td style="max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ t.description }}</td>
                          <td>
                            @if (t.status !== 'Closed') {
                              <app-button size="sm" (clicked)="startCloseTicket(t.id)">Close</app-button>
                            } @else {
                              <span style="color:var(--text-muted); font-size:var(--font-xs);">Closed</span>
                            }
                          </td>
                        </tr>
                        @if (closingTicketId() === t.id) {
                          <tr>
                            <td colspan="5" class="close-form-cell">
                              <div class="close-form">
                                <label class="close-form__label">Closing Note <span style="color:var(--accent-red);">*</span></label>
                                <textarea class="close-form__textarea" [(ngModel)]="closingTicketComment" rows="3"
                                  placeholder="Describe the resolution or action taken..."></textarea>
                                @if (closeTicketError) {
                                  <p class="close-form__error">{{ closeTicketError }}</p>
                                }
                                <div class="close-form__actions">
                                  <app-button size="sm" variant="danger" (clicked)="confirmCloseTicket(t.id)">Confirm Close</app-button>
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
                  <div class="empty-state__title">No supervisor tickets</div>
                  <div class="empty-state__msg">Tickets raised by the supervisor for Procurement will appear here.</div>
                </div>
              }
            </app-card>
          }

          <!-- PROCUREMENT REQUEST (internal) -->
          @if (activeTab() === 'request') {
            <h2 class="page-title">Procurement Request</h2>
            <app-card>
              <h3 class="section-title">New Request</h3>
              <form (ngSubmit)="submitRequest()" novalidate>
                <div class="form-grid">
                  <app-form-field label="Item" fieldId="pItem" [error]="reqErrors().item" [required]="true">
                    <input type="text" id="pItem" [ngModel]="reqForm().item" (ngModelChange)="updateReqField('item', $event)" name="pItem" placeholder="Item name" />
                  </app-form-field>
                  <app-form-field label="Quantity" fieldId="pQty" [error]="reqErrors().qty" [required]="true">
                    <input type="number" id="pQty" [ngModel]="reqForm().qty" (ngModelChange)="updateReqField('qty', +$event)" name="pQty" min="1" />
                  </app-form-field>
                  <app-form-field label="Department" fieldId="pDept" [error]="reqErrors().dept" [required]="true">
                    <select id="pDept" [ngModel]="reqForm().dept" (ngModelChange)="updateReqField('dept', $event)" name="pDept">
                      <option value="">Select department</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Production">Production</option>
                    </select>
                  </app-form-field>
                  <app-form-field label="Priority" fieldId="pPriority">
                    <select id="pPriority" [ngModel]="reqForm().priority" (ngModelChange)="updateReqField('priority', $event)" name="pPriority">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </app-form-field>
                </div>
                <div class="form-actions">
                  <app-button type="submit" variant="primary">Submit Request</app-button>
                </div>
                @if (reqMsg()) { <p class="success-msg">{{ reqMsg() }}</p> }
              </form>
            </app-card>

            <app-card>
              <div class="section-header">
                <h3 class="section-title">Request Log</h3>
                @if (resolvedInternalRequests().length > 0) {
                  <app-button variant="danger" size="sm" (clicked)="clearCompletedInternalRequests()">Clear Resolved</app-button>
                }
              </div>
              @if (internalRequests().length > 0) {
                <div style="overflow-x:auto;">
                  <table>
                    <thead>
                      <tr><th>ID</th><th>Item</th><th>Qty</th><th>Department</th><th>Priority</th><th>Status</th><th>Date</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      @for (r of internalRequests(); track r.id) {
                        <tr>
                          <td><strong>{{ r.requestCode }}</strong></td>
                          <td>{{ r.item }}</td><td>{{ r.qty }}</td><td>{{ r.dept }}</td>
                          <td>
                            <span class="badge"
                              [class.badge--high]="r.priority === 'High'"
                              [class.badge--medium]="r.priority === 'Medium'"
                              [class.badge--low]="r.priority === 'Low'">{{ r.priority }}</span>
                          </td>
                          <td>
                            <span class="badge"
                              [class.badge--pending]="r.status === 'Pending'"
                              [class.badge--approved]="r.status === 'Approved'"
                              [class.badge--high]="r.status === 'Rejected'">{{ r.status }}</span>
                          </td>
                          <td>{{ r.createdAt }}</td>
                          <td>
                            @if (r.status === 'Pending') {
                              <div style="display:flex; gap:6px;">
                                <app-button size="sm" variant="primary" (clicked)="approveRequest(r.id)">Approve</app-button>
                                <app-button size="sm" variant="danger"  (clicked)="rejectRequest(r.id)">Reject</app-button>
                              </div>
                            } @else {
                              <button class="icon-btn" title="Delete record" (click)="deleteInternalRequest(r.id)">&#10005;</button>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="empty-state">
                  <div class="empty-state__title">No requests yet</div>
                  <div class="empty-state__msg">Submitted requests will be logged here.</div>
                </div>
              }
            </app-card>
          }

          <!-- EXTERNAL PROCUREMENT -->
          @if (activeTab() === 'external') {
            <h2 class="page-title">External Procurement</h2>
            <app-card>
              <div class="section-header">
                <h3 class="section-title">External Request Log</h3>
                @if (resolvedExternalEntries().length > 0) {
                  <app-button variant="danger" size="sm" (clicked)="clearCompletedExternalRequests()">Clear Resolved</app-button>
                }
              </div>
              <p style="color:var(--text-muted); font-size:var(--font-sm); margin-bottom:var(--space-4);">
                Raised from Department Tickets or when spare-part inventory is unavailable.
              </p>
              @if (externalEntries().length > 0) {
                <div style="overflow-x:auto;">
                  <table>
                    <thead>
                      <tr><th>ID</th><th>Item</th><th>Department</th><th>Priority</th><th>Status</th><th>Requested On</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      @for (e of externalEntries(); track e.id) {
                        <tr>
                          <td><strong>{{ e.requestCode }}</strong></td>
                          <td>{{ e.name }}</td><td>{{ e.department }}</td>
                          <td>
                            <span class="badge"
                              [class.badge--high]="e.priority === 'High' || e.priority === 'Critical'"
                              [class.badge--medium]="e.priority === 'Medium'"
                              [class.badge--low]="e.priority === 'Low'">{{ e.priority }}</span>
                          </td>
                          <td>
                            <span class="badge"
                              [class.badge--pending]="e.status === 'Pending'"
                              [class.badge--approved]="e.status === 'Approved'"
                              [class.badge--high]="e.status === 'Rejected'">{{ e.status }}</span>
                          </td>
                          <td>{{ e.requestedDate }}</td>
                          <td>
                            @if (e.status !== 'Pending') {
                              <button class="icon-btn" title="Delete record" (click)="deleteExternalEntry(e.id)">&#10005;</button>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="empty-state">
                  <div class="empty-state__title">No external requests</div>
                  <div class="empty-state__msg">Use the "Request" button on a Department Ticket, or "External" on a Spare Request.</div>
                </div>
              }
            </app-card>
          }

        </div>
      </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width); height: 100%; background: var(--brown-900);
      display: flex; flex-direction: column; padding: var(--space-4) 0;
      color: #fff; flex-shrink: 0; overflow-y: auto;
    }
    .sidebar nav { flex: 1; display: flex; flex-direction: column; padding-top: var(--space-2); }
    .sidebar nav button {
      display: flex; align-items: center; gap: 8px;
      width: 100%; text-align: left;
      padding: 14px 20px; color: rgba(255,255,255,0.8);
      font-size: var(--font-sm); font-weight: 500;
      border: none; background: none; cursor: pointer;
      border-left: 3px solid transparent;
      transition: background var(--transition), color var(--transition), border-left-color var(--transition), padding-left var(--transition);
    }
    .sidebar nav button:hover { color: #fff; background: rgba(255,255,255,0.08); padding-left: 24px; }
    .sidebar nav button.active { color: #fff; background: var(--red-700); font-weight: 700; border-left-color: rgba(255,255,255,0.6); }
    .badge-count {
      display: inline-flex; align-items: center; justify-content: center;
      background: #f59e0b; color: #fff; border-radius: 999px;
      font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; padding: 0 4px;
    }
    .close-form-cell { padding: 0 !important; background: #fafafa; }
    .close-form { padding: 12px 16px; border-top: 1px solid var(--gray-border); }
    .close-form__label { display: block; font-size: var(--font-sm); font-weight: 600; color: var(--text-dark); margin-bottom: 6px; }
    .close-form__textarea { width: 100%; padding: 8px; border: 1px solid var(--gray-border); border-radius: var(--radius-sm); font-size: var(--font-sm); resize: vertical; box-sizing: border-box; }
    .close-form__textarea:focus { outline: none; border-color: var(--red-700); }
    .close-form__error { color: var(--accent-red); font-size: var(--font-xs); margin: 4px 0 0; }
    .close-form__actions { display: flex; gap: 8px; margin-top: 10px; }
    .logout-btn {
      margin: var(--space-6) var(--space-4) var(--space-4); padding: 10px;
      border-radius: var(--radius-md); background: #fff; color: var(--red-700);
      border: none; cursor: pointer; font-size: var(--font-sm); font-weight: 700;
      transition: background var(--transition), color var(--transition);
      width: calc(100% - 2 * var(--space-4));
    }
    .logout-btn:hover { background: var(--red-300); color: #fff; }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-5); }
    .page-header .page-title { margin-bottom: 0; }
    .section-title { margin-bottom: var(--space-4); font-size: var(--font-lg); font-weight: 700; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
    .section-header .section-title { margin-bottom: 0; }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); margin-top: var(--space-5); }
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

    .tickets-layout { display: flex; gap: var(--space-5); align-items: flex-start; }
    .tickets-table-wrap {
      flex: 1; min-width: 0; background: var(--white);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
    }
    .selected-row { background: #fff5f5 !important; }
    .detail-panel {
      width: 300px; flex-shrink: 0; background: var(--white);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-md);
      padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3);
    }
    .detail-panel--empty {
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); font-size: var(--font-sm); min-height: 200px;
    }
    .detail-panel__title { font-size: var(--font-base); font-weight: 700; color: var(--text-dark); margin: 0; }
    .detail-field { font-size: var(--font-sm); color: var(--text-dark); }
    .detail-field--desc p { margin: 4px 0 0; color: var(--text-muted); line-height: 1.5; }
    .detail-label { font-weight: 700; }
    .detail-remark { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: var(--space-3); font-size: var(--font-sm); }
    .detail-remark p { margin: 4px 0 0; color: var(--text-dark); }
    .avail-panel { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-md); padding: var(--space-3); font-size: var(--font-sm); }
    .avail-panel p { margin: 4px 0 0; }
    .avail-none { color: var(--accent-red); font-weight: 600; }
    .detail-actions { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-1); }
    .action-btn {
      padding: 9px 12px; border-radius: var(--radius-md); background: var(--brown-900); color: #fff;
      border: none; cursor: pointer; font-size: var(--font-sm); font-weight: 600;
      transition: background var(--transition); width: 100%; text-align: center;
    }
    .action-btn:hover { background: var(--brown-700); }
    .action-btn--primary { background: var(--red-700); }
    .action-btn--primary:hover { background: var(--red-500); }
    .action-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .remark-form { display: flex; flex-direction: column; gap: var(--space-2); }
    .remark-textarea {
      width: 100%; border: 1px solid var(--gray-border); border-radius: var(--radius-md);
      padding: var(--space-3); font-size: var(--font-sm); resize: vertical;
      font-family: var(--font-family); box-sizing: border-box;
    }
    .remark-textarea:focus { outline: none; border-color: var(--red-700); }
    .action-success { color: var(--accent-green); font-size: var(--font-sm); font-weight: 600; margin: 0; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: var(--space-2); }
    .success-msg { color: var(--accent-green); margin-top: var(--space-3); font-weight: 600; font-size: var(--font-sm); }

    .icon-btn {
      background: none; border: 1px solid var(--gray-border); border-radius: var(--radius-sm);
      padding: 3px 8px; cursor: pointer; color: var(--text-muted); font-size: var(--font-xs);
      transition: background var(--transition), color var(--transition);
    }
    .icon-btn:hover { background: #fee2e2; color: var(--accent-red); border-color: #fca5a5; }

    @media (max-width: 900px) {
      .charts-row { grid-template-columns: 1fr; }
      .tickets-layout { flex-direction: column; }
      .detail-panel { width: 100%; }
    }
  `]
})
export class ProcurementComponent implements OnInit {
  auth               = inject(AuthService);
  private procApi    = inject(ProcurementApiService);
  private invApi     = inject(InventoryApiService);
  private spareApi   = inject(SpareRequestApiService);
  private ticketApi  = inject(TicketApiService);
  private confirm    = inject(ConfirmService);
  private route      = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  supervisorTickets    = signal<TicketResponse[]>([]);
  closingTicketId      = signal<string | null>(null);
  closingTicketComment = '';
  closeTicketError     = '';

  activeTab = signal<Tab>('home');
  switchTab(tab: Tab): void { this.activeTab.set(tab); }

  // ── Spare Requests (from Manager approval) ──────────────────────────────
  spareRequests   = signal<SpareRequestResponse[]>([]);
  inventoryItems  = signal<InventoryItemResponse[]>([]);
  spareMsg        = signal('');
  spareMsgError   = signal(false);

  pendingSpareRequests  = computed(() => this.spareRequests().filter(r => r.status === 'Approved'));
  resolvedSpareRequests = computed(() =>
    this.spareRequests().filter(r =>
      r.status === 'ProcurementApproved' || r.status === 'SentToExternal' || r.status === 'Fulfilled'
    )
  );


  getStockStatus(r: SpareRequestResponse): 'available' | 'low' | 'none' {
    const match = this.inventoryItems().find(i => i.name.toLowerCase() === r.item.toLowerCase());
    if (!match) return 'none';
    return match.qty >= r.qty ? 'available' : match.qty > 0 ? 'low' : 'none';
  }

  getStockQty(r: SpareRequestResponse): number {
    return this.inventoryItems().find(i => i.name.toLowerCase() === r.item.toLowerCase())?.qty ?? 0;
  }

  async spareApprove(id: number): Promise<void> {
    if (!(await this.confirm.ask('Approve this spare request and forward to Inventory?'))) return;
    this.spareApi.procurementApprove(id).subscribe({
      next: updated => {
        this.spareRequests.update(list => list.map(r => r.id === id ? updated : r));
        this.showSpareMsg('Approved — forwarded to Inventory team.', false);
      },
      error: err => this.showSpareMsg(err?.error?.message ?? 'Failed to approve request.', true),
    });
  }

  async spareSendToExternal(id: number): Promise<void> {
    if (!(await this.confirm.ask('Send this spare request to External Procurement?'))) return;
    this.spareApi.procurementSendToExternal(id).subscribe({
      next: updated => {
        this.spareRequests.update(list => list.map(r => r.id === id ? updated : r));
        this.procApi.getAllExternalRequests().subscribe({ next: list => this.externalEntries.set(list) });
        this.showSpareMsg('Sent to External Procurement.', false);
      },
      error: err => this.showSpareMsg(err?.error?.message ?? 'Failed to send to external.', true),
    });
  }

  async deleteSpareRequest(id: number): Promise<void> {
    if (!(await this.confirm.ask('Delete this spare request record?'))) return;
    this.spareApi.delete(id).subscribe({
      next: () => this.spareRequests.update(list => list.filter(r => r.id !== id)),
    });
  }

  async clearResolvedSpareRequests(): Promise<void> {
    if (!(await this.confirm.ask('Clear all handled spare requests? This cannot be undone.'))) return;
    this.spareApi.deleteCompleted().subscribe({
      next: () => this.spareRequests.update(list =>
        list.filter(r => r.status === 'Pending' || r.status === 'Approved')
      ),
    });
  }

  private showSpareMsg(msg: string, isError: boolean): void {
    this.spareMsg.set(msg);
    this.spareMsgError.set(isError);
    setTimeout(() => this.spareMsg.set(''), 5000);
  }

  // ── Procurement Tickets ─────────────────────────────────────────────────
  procTickets = signal<ProcurementTicketResponse[]>([]);
  selectedId  = signal<number | null>(null);

  selectedTicket = computed(() => {
    const id = this.selectedId();
    return id !== null ? this.procTickets().find(t => t.id === id) ?? null : null;
  });

  availInfo        = signal<StockLookup | null>(null);
  showRemarkForm   = signal(false);
  showAvailability = signal(false);
  remarkText       = signal('');
  actionMsg        = signal('');
  showNewTicketForm = signal(false);

  selectTicket(id: number): void {
    this.selectedId.set(this.selectedId() === id ? null : id);
    this.showRemarkForm.set(false);
    this.showAvailability.set(false);
    this.availInfo.set(null);
    this.remarkText.set('');
    this.actionMsg.set('');
  }

  toggleRemark(): void { this.showRemarkForm.update(v => !v); this.showAvailability.set(false); }

  toggleAvailability(): void {
    const next = !this.showAvailability();
    this.showAvailability.set(next);
    this.showRemarkForm.set(false);
    if (next) {
      const ticket = this.selectedTicket();
      if (!ticket) return;
      const found = this.inventoryItems().find(s => s.name.toLowerCase() === ticket.name.toLowerCase());
      this.availInfo.set(found
        ? { qty: found.qty, unit: found.unit, location: found.location }
        : { qty: 0, unit: 'pcs', location: 'Not in inventory' });
    } else {
      this.availInfo.set(null);
    }
  }

  saveRemark(): void {
    const id   = this.selectedId();
    const text = this.remarkText().trim();
    if (id === null || !text) return;
    this.procApi.addRemark(id, text).subscribe({
      next: updated => {
        this.procTickets.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.showRemarkForm.set(false);
        this.remarkText.set('');
        this.actionMsg.set('Remark saved.');
        setTimeout(() => this.actionMsg.set(''), 3000);
      },
    });
  }

  async sendToExternal(): Promise<void> {
    const ticket = this.selectedTicket();
    if (!ticket || ticket.sentToExternal) return;
    if (!(await this.confirm.ask(`Send ticket "${ticket.name}" to External Procurement?`))) return;
    this.procApi.sendToExternal(ticket.id).subscribe({
      next: updated => {
        this.procTickets.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.procApi.getAllExternalRequests().subscribe({ next: list => this.externalEntries.set(list) });
        this.actionMsg.set('Sent to External Procurement.');
        setTimeout(() => this.actionMsg.set(''), 3000);
      },
    });
  }

  async deleteTicket(id: number): Promise<void> {
    if (!(await this.confirm.ask('Delete this department ticket?'))) return;
    this.procApi.deleteTicket(id).subscribe({
      next: () => {
        this.procTickets.update(list => list.filter(t => t.id !== id));
        if (this.selectedId() === id) this.selectedId.set(null);
      },
    });
  }

  // ── New Ticket Form ─────────────────────────────────────────────────────
  private emptyTicketForm   = () => ({ name: '', type: 'Purchase Request', department: '', priority: 'Medium', description: '' });
  private emptyTicketErrors = () => ({ name: '', department: '', description: '' });
  newTicketForm   = signal(this.emptyTicketForm());
  newTicketErrors = signal(this.emptyTicketErrors());

  openNewTicketForm(): void {
    this.newTicketForm.set(this.emptyTicketForm());
    this.newTicketErrors.set(this.emptyTicketErrors());
    this.showNewTicketForm.set(true);
  }

  updateTicketField(field: string, value: string): void {
    this.newTicketForm.update(f => ({ ...f, [field]: value }));
    this.newTicketErrors.update(e => ({ ...e, [field]: '' }));
  }

  async submitNewTicket(): Promise<void> {
    const f = this.newTicketForm();
    const errors = {
      name:        !f.name.trim()        ? 'Item name is required.'   : '',
      department:  !f.department         ? 'Department is required.'  : '',
      description: !f.description.trim() ? 'Description is required.' : '',
    };
    this.newTicketErrors.set(errors);
    if (Object.values(errors).some(Boolean)) return;
    if (!(await this.confirm.ask(`Create a new department ticket for "${f.name}"?`))) return;

    this.procApi.createTicket({ name: f.name.trim(), type: f.type, department: f.department, priority: f.priority, description: f.description.trim() }).subscribe({
      next: ticket => {
        this.procTickets.update(list => [...list, ticket]);
        this.showNewTicketForm.set(false);
      },
    });
  }

  // ── External Entries ────────────────────────────────────────────────────
  externalEntries = signal<ExternalRequestResponse[]>([]);
  resolvedExternalEntries = computed(() => this.externalEntries().filter(e => e.status !== 'Pending'));

  async deleteExternalEntry(id: number): Promise<void> {
    if (!(await this.confirm.ask('Delete this external request record?'))) return;
    this.procApi.deleteExternalRequest(id).subscribe({
      next: () => this.externalEntries.update(list => list.filter(e => e.id !== id)),
    });
  }

  async clearCompletedExternalRequests(): Promise<void> {
    if (!(await this.confirm.ask('Clear all resolved external requests? This cannot be undone.'))) return;
    this.procApi.deleteCompletedExternalRequests().subscribe({
      next: () => this.externalEntries.update(list => list.filter(e => e.status === 'Pending')),
    });
  }

  // ── Internal Requests ───────────────────────────────────────────────────
  internalRequests = signal<InternalRequestResponse[]>([]);

  pendingCount  = computed(() => this.internalRequests().filter(r => r.status === 'Pending').length);
  approvedCount = computed(() => this.internalRequests().filter(r => r.status === 'Approved').length);
  resolvedInternalRequests = computed(() => this.internalRequests().filter(r => r.status !== 'Pending'));

  private emptyReqForm   = (): ReqForm   => ({ item: '', qty: 1, dept: '', priority: 'Medium' });
  private emptyReqErrors = (): ReqErrors => ({ item: '', qty: '', dept: '' });
  reqForm   = signal<ReqForm>(this.emptyReqForm());
  reqErrors = signal<ReqErrors>(this.emptyReqErrors());
  reqMsg    = signal('');

  updateReqField(field: keyof ReqForm, value: string | number): void {
    this.reqForm.update(f => ({ ...f, [field]: value }));
    this.reqErrors.update(e => ({ ...e, [field]: '' }));
  }

  async approveRequest(id: number): Promise<void> {
    if (!(await this.confirm.ask('Approve this procurement request?'))) return;
    this.procApi.approveInternalRequest(id).subscribe({
      next: updated => {
        this.internalRequests.update(list => list.map(r => r.id === updated.id ? updated : r));
        this.reqMsg.set('Request approved and forwarded to Inventory team for fulfillment.');
        setTimeout(() => this.reqMsg.set(''), 4000);
      },
    });
  }

  async rejectRequest(id: number): Promise<void> {
    if (!(await this.confirm.ask('Reject this procurement request?'))) return;
    this.procApi.updateInternalRequestStatus(id, 'Rejected').subscribe({
      next: updated => this.internalRequests.update(list => list.map(r => r.id === updated.id ? updated : r)),
    });
  }

  async deleteInternalRequest(id: number): Promise<void> {
    if (!(await this.confirm.ask('Delete this procurement request record?'))) return;
    this.procApi.deleteInternalRequest(id).subscribe({
      next: () => this.internalRequests.update(list => list.filter(r => r.id !== id)),
    });
  }

  async clearCompletedInternalRequests(): Promise<void> {
    if (!(await this.confirm.ask('Clear all resolved procurement requests? This cannot be undone.'))) return;
    this.procApi.deleteCompletedInternalRequests().subscribe({
      next: () => this.internalRequests.update(list => list.filter(r => r.status === 'Pending')),
    });
  }

  async submitRequest(): Promise<void> {
    const f = this.reqForm();
    const errors: ReqErrors = {
      item: !f.item.trim() ? 'Item is required.'           : '',
      qty:  f.qty < 1      ? 'Quantity must be at least 1.' : '',
      dept: !f.dept        ? 'Department is required.'     : '',
    };
    this.reqErrors.set(errors);
    if (Object.values(errors).some(Boolean)) return;
    if (!(await this.confirm.ask(`Submit procurement request for "${f.item}" (qty: ${f.qty})?`))) return;

    const requestedBy = this.auth.currentUser()?.empId ?? this.auth.currentUser()?.name ?? '';
    this.procApi.createInternalRequest({ item: f.item.trim(), qty: f.qty, dept: f.dept, priority: f.priority, requestedBy }).subscribe({
      next: req => {
        this.internalRequests.update(list => [...list, req]);
        this.reqMsg.set('Request submitted successfully.');
        this.reqForm.set(this.emptyReqForm());
        setTimeout(() => this.reqMsg.set(''), 3000);
      },
    });
  }

  // ── Chart Data ──────────────────────────────────────────────────────────
  donutData = computed(() => {
    const reqs = this.internalRequests();
    return {
      pending:  reqs.filter(r => r.status === 'Pending').length,
      approved: reqs.filter(r => r.status === 'Approved').length,
      rejected: reqs.filter(r => r.status === 'Rejected').length,
      total:    reqs.length,
    };
  });

  donutStyle = computed(() => {
    const d     = this.donutData();
    const total = d.total || 1;
    const p     = (d.pending  / total) * 360;
    const a     = (d.approved / total) * 360;
    return `conic-gradient(#f59e0b 0deg ${p}deg, #0a7d2c ${p}deg ${p + a}deg, #e60000 ${p + a}deg 360deg)`;
  });

  ticketBarData = computed(() => {
    const tickets = this.procTickets();
    const depts   = ['Prod.', 'Finance', 'Ware.', 'Maint.', 'Pack.'];
    const full    = ['Production', 'Finance', 'Warehouse', 'Maintenance', 'Packaging'];
    const max     = Math.max(...full.map(d => tickets.filter(t => t.department === d).length), 1);
    return full.map((dept, i) => {
      const value = tickets.filter(t => t.department === dept).length;
      return { label: depts[i], value, height: Math.round((value / max) * 90) };
    });
  });

  async logout(): Promise<void> {
    if (!(await this.confirm.ask('Are you sure you want to log out?', 'Log Out'))) return;
    this.auth.logout();
  }

  ngOnInit() {
    this.procApi.getAllTickets().subscribe({ next: list => this.procTickets.set(list) });
    this.procApi.getAllInternalRequests().subscribe({ next: list => this.internalRequests.set(list) });
    this.procApi.getAllExternalRequests().subscribe({ next: list => this.externalEntries.set(list) });
    this.spareApi.getAll().subscribe({ next: list => this.spareRequests.set(list) });
    this.invApi.getAll().subscribe({ next: list => this.inventoryItems.set(list) });
    this.ticketApi.getAll().subscribe({ next: list => this.supervisorTickets.set(list.filter(t => t.currentDepartment === 'Procurement')) });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const tab = params.get('tab') as Tab | null;
      if (tab) this.switchTab(tab);
    });
  }

  startCloseTicket(id: string) {
    this.closingTicketId.set(id);
    this.closingTicketComment = '';
    this.closeTicketError = '';
  }

  cancelCloseTicket() {
    this.closingTicketId.set(null);
    this.closingTicketComment = '';
    this.closeTicketError = '';
  }

  async confirmCloseTicket(id: string): Promise<void> {
    const comment = this.closingTicketComment.trim().replace(/<[^>]*>/g, '');
    if (!comment) { this.closeTicketError = 'A closing note is required.'; return; }
    if (comment.length > 500) { this.closeTicketError = 'Note cannot exceed 500 characters.'; return; }
    if (!(await this.confirm.ask('Close this supervisor ticket? This cannot be undone.'))) return;
    const handledBy = this.auth.currentUser()?.name ?? 'Procurement';
    this.ticketApi.close(id, comment, handledBy).subscribe({
      next: updated => {
        this.supervisorTickets.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.cancelCloseTicket();
      }
    });
  }
}
