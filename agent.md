MOBILE BUY, SELL, REFURBISHMENT & REPAIR MANAGEMENT PLATFORM
DETAILED SOFTWARE REQUIREMENT SPECIFICATION

1. PROJECT OVERVIEW

The platform will be a Laravel-based mobile commerce and operations management system for buying used mobile phones from customers, processing/refurbishing those devices, repairing them where required, listing them for resale, selling refurbished devices to customers, and managing complete after-sales service.

Technology Stack
- Backend: Laravel
- Database: MySQL
- Frontend: Blade + Tailwind CSS
- Dynamic Operations: AJAX / JSON
- Authentication: Laravel Authentication
- Authorization: Role & Permission Based
- Mobile Operations: Responsive Web / PWA initially
- QR: QR Code generation + camera scanning
- Payment: Razorpay / Cashfree
- Seller Payout: RazorpayX / Cashfree Payout
- SMS/OTP: MSG91 / equivalent
- WhatsApp: WhatsApp Business API
- Courier: Shiprocket / Delhivery
- Storage: Local/S3-compatible storage
- Maps: Google Maps / MapmyIndia

2. SYSTEM STRUCTURE

The complete system will consist of three primary dashboards.

A. ADMIN DASHBOARD
Admin controls the complete business:
- Business configuration
- Users
- Staff
- Roles and permissions
- Catalogue
- Mobile pricing
- Purchase/sell operations
- Pickup operations
- Inventory
- Warehouse
- QC
- Repair
- Product listing
- Customer orders
- Payments
- Seller payouts
- Courier
- Returns
- Warranty
- Reports
- CMS
- Coupons
- Notifications
- Audit logs
- QR configuration
- System settings

B. CUSTOMER DASHBOARD
Supports both selling old mobile phones and buying refurbished phones.

Sell:
- Select mobile
- Condition questions
- Estimated price
- Pickup
- KYC
- Pickup tracking
- Inspection
- Revised price approval
- Payout tracking
- Warehouse processing tracking

Buy:
- Browse products
- Filter/search
- View exact device
- Cart
- Checkout
- Payment
- Order tracking
- Return/replacement
- Warranty request
- Service/repair tracking

C. STAFF DASHBOARD
One unified staff dashboard with role-based menus.

Pickup Executive:
- Assigned pickups
- Customer details
- Navigation
- Pickup OTP
- KYC
- IMEI scan
- Device inspection
- Photos/video
- Revised quotation
- Customer approval
- Pickup completion

Warehouse Staff:
- Device receiving
- QR scan
- IMEI scan
- Warehouse location
- Rack/bin
- Asset movement
- Data wipe
- QC queue
- Dispatch
- Return receiving

QC Executive:
- QR scan
- Hardware testing
- Cosmetic inspection
- Battery check
- Camera/display/network testing
- Final QC
- Grade assignment

Repair Technician:
- Repair queue
- QR scan
- Diagnosis
- Repair job
- Parts used
- Labour
- Before/after photos
- Repair status
- Final testing

Inventory Manager:
- All inventory
- Device movement
- QR/IMEI search
- Rack/bin
- Product allocation
- Reserved/sold/returned stock

Finance:
- Buyer payments
- Seller payouts
- Refunds
- Reconciliation
- Financial reports

Customer Support:
- Tickets
- Orders
- Returns
- Warranty
- Customer communication

3. QR DEVICE TRACKING

Every physical mobile phone must receive:
- Unique Asset ID
- Unique QR code
- IMEI record

QR does not replace IMEI.

IMEI is used for device identification, ownership verification and fraud/device checks.

Asset ID is used for internal inventory management.

QR is used for:
- Physical device tracking
- Staff scanning
- Movement tracking
- Repair tracking
- QC tracking
- Warehouse tracking

4. DEVICE LIFECYCLE

Customer Pickup
-> QR/Asset Created
-> Pickup Completed
-> Warehouse Received
-> Data Wipe
-> QC
-> Repair if required
-> Final QC
-> Grade
-> Ready for Listing
-> Listed
-> Reserved
-> Sold
-> Packed
-> Shipped
-> Delivered
-> Return/Warranty if applicable
-> Re-QC

5. QR SCAN LOG

Every scan creates a permanent tracking record.

Fields:
- Time
- QR
- Asset
- Staff
- Location
- Action
- Scan type
- Remarks

Example:
Pickup -> Warehouse Received -> QC -> Repair -> Final QC -> Listed -> Dispatch.

6. STAFF QR SCAN SCREEN

The staff dashboard should have a permanent SCAN DEVICE button.

After scan, show:
- Device
- Asset ID
- IMEI
- Current Status
- Current Location
- Assigned Technician if applicable
- Available actions

Staff can also search by:
- Asset ID
- IMEI
- QR token

7. DEVICE MASTER RECORD

Each physical device has one permanent asset record.

Fields:
- Asset ID
- QR Code
- IMEI 1
- IMEI 2
- Brand
- Model
- Variant
- RAM
- Storage
- Colour
- Serial Number
- Purchase Source
- Seller
- Purchase Date
- Purchase Price
- Current Status
- Current Location
- Warehouse
- Rack
- Bin
- Grade
- Final Cost
- Repair Cost
- Selling Price
- Warranty
- Product Listing
- Buyer
- Order
- Created Date

8. DEVICE STATUS

Procurement:
- Quote Generated
- Pickup Scheduled
- Assigned
- Inspection
- Price Accepted
- Picked Up
- Payout Pending
- Payout Completed

Warehouse:
- Warehouse Pending
- Received
- Data Wipe Pending
- Data Wiped
- QC Pending
- QC In Progress
- QC Failed
- Repair Required
- Repair In Progress
- Repair Completed
- Final QC Pending
- Final QC Passed
- Graded
- Ready For Listing
- Listed

Sales:
- Available
- Reserved
- Payment Pending
- Sold
- Packed
- Shipped
- Delivered

After Sales:
- Return Requested
- Return Approved
- Return Pickup
- Returned
- Re-QC
- Warranty
- Replacement
- Refunded
- Scrap
- Recycle

9. REPAIR TRACKING

Repair is a separate operational module connected to the device asset.

Repair Job fields:
- Repair ID
- Asset ID
- QR
- IMEI
- Problem
- Diagnosis
- Technician
- Assigned date
- Start date
- Completion date
- Priority
- Estimated cost
- Actual cost
- Labour cost
- Parts cost
- Parts used
- Repair notes
- Before photos
- After photos
- Customer approval if applicable
- QC result
- Warranty
- Repair status

10. REPAIR STATUS FLOW

Repair Required
-> Repair Job Created
-> Technician Assigned
-> Device Received
-> Diagnosis
-> Estimate
-> Approval
-> Repair Started
-> Parts Used
-> Repair Completed
-> Repair QC
-> Final QC
-> Completed

11. REPAIR QR WORKFLOW

Technician:
SCAN QR
-> Device Found
-> Repair Job Found
-> START REPAIR

System automatically records:
- Technician
- Date
- Time
- Device
- Repair Job
- Status
- Location

On completion:
COMPLETE REPAIR
-> Repair Completed
-> Final QC Pending

12. REPAIR PARTS MANAGEMENT

Spare part fields:
- Part ID
- Part Name
- Part Number
- Brand
- Compatible Models
- Purchase Cost
- Quantity
- Minimum Stock
- Supplier
- Location

When a part is used:
- Stock decreases automatically
- Repair job records part
- Quantity and cost are stored
- Technician and repair ID are linked

13. ADMIN DASHBOARD

Dashboard cards:
Procurement:
- Today's Quotes
- Today's Pickups
- Pending Pickups
- Phones Purchased
- Pending Payouts

Inventory:
- Total Devices
- Available
- QC Pending
- Repair Pending
- Repair In Progress
- Listed
- Reserved
- Sold
- Returned
- Scrap

Sales:
- Today's Orders
- Today's Revenue
- Pending Orders
- Shipped
- Delivered
- Returns

Repair:
- Repair Pending
- Repair In Progress
- Completed Today
- Technician Workload
- Repair Cost

Financial:
- Purchase Cost
- Sales Revenue
- Repair Cost
- Gross Margin
- Seller Payout
- Refunds

14. ADMIN SIDEBAR

Dashboard

Customers
- All Customers
- Sellers
- Buyers
- Blocked Users

Staff
- Staff
- Roles
- Permissions
- Attendance

Catalogue
- Categories
- Brands
- Models
- Variants
- Colours
- Specifications

Pricing
- Base Prices
- Condition Questions
- Deduction Rules
- Price Rules
- Quotes

Buy Operations
- Sell Orders
- Pickup Orders
- Inspection
- KYC
- IMEI Verification
- Seller Payouts

Inventory
- All Devices
- QR Devices
- Available
- Reserved
- Sold
- Returned
- Scrap

Warehouse
- Warehouses
- Racks
- Bins
- Inward
- Movement
- Data Wipe

QC
- Pending QC
- QC In Progress
- Failed QC
- Final QC
- Grades

Repair
- Repair Jobs
- Technicians
- Spare Parts
- Repair Costs
- Repair Reports

Products
- Listings
- Images
- Prices
- Warranty
- Published
- Unpublished

Orders
- All Orders
- Pending
- Packed
- Shipped
- Delivered
- Cancelled

Returns
- Return Requests
- Reverse Pickup
- Re-QC
- Refund
- Replacement

Warranty
- Warranty Claims
- Service Jobs
- Completed

Payments
- Customer Payments
- Seller Payouts
- Refunds
- Reconciliation

Shipping
- Shipments
- AWB
- Tracking
- RTO

Reports
- Sales
- Purchase
- Inventory
- Repair
- Profit
- Staff Performance
- Device Movement

CMS
- Homepage
- Banners
- FAQs
- Pages
- Coupons

Settings
- General
- Payment
- SMS
- WhatsApp
- Courier
- Tax
- Warranty
- Returns

Audit Logs
Webhook Logs

15. CUSTOMER WEBSITE

Homepage:
- Header
- Sell Old Mobile
- Buy Refurbished Mobile
- Popular Brands
- Featured Phones
- How It Works
- Why Buy From Us
- Warranty
- Return Policy
- Reviews
- FAQs
- Footer

16. SELL MOBILE FLOW

Step 1:
Brand -> Model -> Variant -> RAM/Storage -> Colour

Step 2 condition questions:
- Switches on?
- Display working?
- Touch working?
- Body damaged?
- Camera working?
- Speaker working?
- Microphone working?
- Charging working?
- Battery condition?
- Face ID/Fingerprint working?
- Buttons working?
- Network unlocked?
- Charger available?
- Invoice available?

Step 3:
Base Price
- Condition Deductions
- Missing Accessories Deduction
- Other Deduction
= Estimated Buy Price

Step 4:
Login -> Address -> Pickup Date -> Time Slot

Step 5:
KYC -> IMEI -> Ownership declaration -> Pickup

Step 6:
Inspection -> Revised price -> Customer approval

Step 7:
Pickup -> Warehouse -> QC/Repair -> Processing

17. PICKUP MANAGEMENT

Customer selects:
- Address
- Pincode
- Date
- Time Slot
- Contact Number

System checks serviceability.

Admin controls:
- City
- Pincode
- Serviceable
- Pickup Slot
- Maximum Pickup Capacity
- Assigned Staff

18. PICKUP EXECUTIVE FLOW

Today's Pickups
-> Customer Details
-> Address/Map
-> START PICKUP
-> Pickup OTP
-> KYC
-> IMEI Scan
-> Inspection
-> Photos
-> Final Price
-> Customer Approval
-> Pickup Complete

19. KYC

Maintain:
- ID type
- ID reference
- ID document
- Customer name
- Address
- Ownership declaration
- Consent
- KYC status
- Verification date
- Verified by

20. IMEI VERIFICATION

Check:
- Valid IMEI
- Duplicate IMEI
- Existing asset
- Existing sale
- Existing repair
- Suspicious/blocked status
- Ownership verification

Duplicate IMEI must produce a warning and require authorized handling.

21. WAREHOUSE RECEIVING

Warehouse staff scans QR/Asset.

Display:
- Expected Device
- Customer
- IMEI
- Model
- Expected Price
- Pickup Date

Action:
RECEIVE DEVICE

Create:
- Warehouse inward
- Asset movement
- Current location
- Received by
- Timestamp

22. WAREHOUSE LOCATION

Structure:
Warehouse
-> Room
-> Rack
-> Shelf
-> Bin

Example:
Warehouse: Lucknow
Room: A
Rack: R04
Shelf: S02
Bin: B12

QR scan shows current location.

23. DATA WIPE

QR Scan
-> Data Wipe
-> Wipe Method
-> Wipe Result
-> Operator
-> Date/Time
-> Wipe Report

24. QC MODULE

Hardware:
- Display
- Touch
- Camera
- Front Camera
- Speaker
- Microphone
- Charging Port
- Battery
- Wi-Fi
- Bluetooth
- Mobile Network
- SIM
- Sensors
- Fingerprint
- Face ID
- Buttons
- Vibration
- GPS

Cosmetic:
- Screen
- Frame
- Back
- Camera glass
- Scratches
- Dents
- Cracks

Each result:
- PASS
- FAIL
- NOT APPLICABLE

25. DEVICE GRADING

Superb:
Almost new appearance with minimal marks.

Good:
Light normal usage marks.

Fair:
Visible scratches/dents but fully functional.

Scrap/Recycle:
Not economical or safe for resale.

26. PRODUCT LISTING

Only final-QC-passed devices can be listed.

Product:
- Brand
- Model
- Storage
- RAM
- Colour
- Grade
- Actual device images
- Battery information
- Accessories
- Warranty
- Return period
- Price
- Specifications
- Stock status

One listing must map to one exact physical inventory unit where applicable.

27. CUSTOMER BUY FLOW

Browse
-> Search/Filter
-> Product Detail
-> Add to Cart
-> Address
-> Shipping
-> Payment
-> Order Confirmed
-> Exact Device Reserved
-> Packing
-> Shipment
-> Delivery

28. ORDER TRACKING

- Order Confirmed
- Device Allocated
- Packed
- Shipped
- Out for Delivery
- Delivered

29. CUSTOMER DASHBOARD SIDEBAR

Dashboard

My Profile
My Addresses
Bank / UPI Details

Sell Mobile
- New Sell Request
- My Sell Requests
- Pickup Tracking
- Payouts

Buy Mobile
- My Orders
- Track Order
- Invoices

Returns
- Return Requests
- Replacement

Warranty
- Warranty Claims
- Service Tracking

Repair
- My Repair Jobs
- Repair Tracking

Support
- Tickets
- FAQs

Notifications
Logout

30. CUSTOMER SELL TRACKING

SELL REQUEST

- Quote Generated
- Pickup Scheduled
- Agent Assigned
- Inspection Completed
- Final Price Accepted
- Device Picked Up
- Payout Completed
- Warehouse Received
- QC Completed
- Device Processed

31. CUSTOMER REPAIR TRACKING

Repair Received
-> Diagnosis
-> Estimate
-> Customer Approval
-> Repair Started
-> Testing
-> Ready
-> Dispatched
-> Delivered

32. ADMIN DEVICE TIMELINE

For every device, show complete history:
- Pickup created
- Picked up
- Warehouse received
- Data wiped
- QC started
- QC failed/passed
- Repair created
- Technician assigned
- Repair started/completed
- Final QC
- Grade
- Listed
- Reserved
- Sold
- Shipped
- Delivered
- Returned
- Re-QC
- Warranty/repair

33. DATABASE ARCHITECTURE

Authentication:
- users
- customers
- staff
- roles
- permissions
- role_permissions
- user_roles
- addresses

Catalogue:
- categories
- brands
- mobile_models
- mobile_variants
- colours
- specifications
- model_specifications

Pricing:
- condition_questions
- condition_options
- deduction_rules
- base_prices
- price_rules
- quotes
- quote_answers

Sell Operations:
- sell_orders
- sell_order_items
- pickup_tasks
- pickup_slots
- inspections
- inspection_answers
- inspection_photos
- kyc_records
- imei_checks
- seller_payouts
- payout_logs

Inventory:
- assets
- asset_qr_codes
- asset_movements
- asset_locations
- warehouses
- warehouse_rooms
- racks
- shelves
- bins

QR:
- qr_codes
- qr_scan_logs
- device_status_logs

Data Wipe:
- data_wipe_reports

QC:
- qc_checklists
- qc_results
- qc_result_items
- device_grades

Repair:
- repair_jobs
- repair_status_logs
- repair_diagnosis
- repair_parts
- repair_job_parts
- repair_photos
- repair_costs
- repair_qc
- technicians

Products:
- product_listings
- product_images
- inventory_units
- product_warranties

Buyer:
- carts
- cart_items
- buyer_orders
- order_items
- payments
- payment_logs
- invoices

Shipping:
- shipments
- shipment_tracking
- courier_webhooks

Returns:
- return_requests
- return_items
- reverse_shipments
- refunds
- replacement_orders

Warranty:
- warranties
- warranty_claims
- warranty_service_jobs

Support:
- support_tickets
- ticket_messages
- ticket_attachments

System:
- notifications
- notification_logs
- coupons
- pages
- faqs
- settings
- audit_logs
- webhook_logs

34. CORE DATABASE RELATIONSHIP

Customer
-> Sell Order
-> Device Asset
-> QR
-> IMEI
-> Warehouse
-> QC
-> Repair
-> Final QC
-> Product Listing
-> Buyer Order
-> Shipment
-> Buyer
-> Return/Warranty

The central relationship should use asset_id.

35. QR TABLES

qr_codes:
- id
- asset_id
- qr_code
- qr_token
- status
- generated_at
- printed_at
- created_at
- updated_at

qr_scan_logs:
- id
- asset_id
- qr_code_id
- staff_id
- scan_type
- action
- from_location_id
- to_location_id
- latitude
- longitude
- ip_address
- device_info
- notes
- created_at

36. ASSET MOVEMENT

Fields:
- id
- asset_id
- from_location_type
- from_location_id
- to_location_type
- to_location_id
- movement_type
- reason
- staff_id
- reference_type
- reference_id
- remarks
- created_at

Examples:
- Pickup -> Warehouse
- Warehouse -> QC
- QC -> Repair
- Repair -> QC
- QC -> Listing
- Warehouse -> Dispatch
- Customer Return -> QC

37. AJAX ARCHITECTURE & SINGLE PAGE CRUD

All Admin and Staff dashboards must be entirely AJAX-based to ensure a seamless, fast, and app-like experience. 
All CRUD (Create, Read, Update, Delete) operations must happen on the same page without full page reloads.

Key UI/UX requirements for CRUD:
- Data tables should load, search, and paginate via AJAX (e.g., DataTables server-side processing).
- 'Create' and 'Edit' forms should open in dynamic Modals or Off-canvas sidebars.
- 'Delete' and status change actions should use AJAX with SweetAlert/Confirmation modals.
- Form submissions should use AJAX and display validation errors inline.

Examples of AJAX operations:
- Brand -> Models -> Variants
- Condition -> Deduction -> Quote
- QR Scan -> Device details
- Start repair -> Status update
- Rack/bin change -> Movement
- Payment webhook -> Order update

38. JSON RESPONSE STANDARD

Success:
{
  "success": true,
  "message": "Device received successfully.",
  "data": {}
}

Validation:
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "imei": [
      "IMEI already exists."
    ]
  }
}

39. ROLE & PERMISSION SYSTEM

Permissions should be granular.

Examples:
- device.view
- device.create
- device.edit
- device.delete
- device.scan
- device.move
- qc.view
- qc.create
- qc.approve
- qc.reject
- repair.view
- repair.create
- repair.assign
- repair.start
- repair.complete
- payout.view
- payout.approve
- order.view
- order.pack
- order.ship

40. AUDIT LOG

Log sensitive actions:
- Price changes
- Payout approval
- Refund approval
- Device status changes
- IMEI changes
- Device deletion
- Repair cost changes
- Product price changes
- Order cancellation
- Warranty approval

Record:
- User
- Role
- Action
- Module
- Record ID
- Old Value
- New Value
- IP
- Date
- Time

41. PAYMENT

Buyer:
Order -> Payment Gateway -> Success -> Webhook -> Verify -> Reserve Device -> Confirm Order

Payment success should be confirmed server-side through gateway/webhook verification.

42. SELLER PAYOUT

Final Price Accepted
-> KYC Verified
-> Ownership Confirmed
-> Pickup Completed
-> Warehouse Received
-> Payout Eligible
-> Payout Request
-> Gateway
-> Success

Store:
- Payout ID
- Sell Order
- Customer
- Amount
- Method
- UTR/Reference
- Status
- Failure Reason
- Approved By

43. RETURN SYSTEM

Order
-> Return Request
-> Reason
-> Images
-> Admin Review
-> Approval
-> Reverse Pickup
-> Warehouse
-> Re-QC
-> Refund / Replacement

Returned devices must never automatically become available stock.

44. WARRANTY SYSTEM

Each sold device:
- Warranty Start
- Warranty End
- Warranty Days
- Warranty Type
- Warranty Terms

Claim statuses:
- Approved
- Rejected
- Inspection Required
- Repair
- Replacement
- Refund

45. REPORTS

Sales:
- Daily sales
- Monthly sales
- Brand/model sales
- Grade sales
- Revenue

Purchase:
- Phones purchased
- Purchase value
- Seller payouts
- Brand/model purchase

Inventory:
- Current stock
- Stock aging
- Device status
- Warehouse stock
- Rack/bin stock
- Unsold devices

Repair:
- Total jobs
- Technician performance
- Repair cost
- Parts cost
- Average repair time
- Common issues

Profit:
Selling Price
- Purchase Price
- Repair Cost
- Other Cost
- Shipping/Operational Cost
= Estimated Gross Margin

46. DEVICE PROFITABILITY

Example:
Asset: MOB-2026-000001

Purchase: ₹18,000
Repair: ₹2,500
Parts: ₹1,500
Other Cost: ₹500
Total Cost: ₹22,500
Selling Price: ₹27,999
Gross Margin: ₹5,499

47. NOTIFICATION SYSTEM

Customer:
- Quote generated
- Pickup scheduled
- Agent assigned
- Revised price
- Payout
- Order confirmed
- Shipped
- Delivered
- Return update
- Warranty update
- Repair update

Staff:
- New pickup
- Repair assigned
- QC pending
- High-priority repair
- Return received

Admin:
- Payment failure
- Payout failure
- Low spare stock
- QC failure
- Suspicious IMEI
- RTO
- High-value refund

48. SECURITY

- Laravel authentication
- Role/permission authorization
- CSRF
- Validation
- SQL injection protection
- XSS protection
- File upload validation
- Rate limiting
- Secure webhook verification
- Private KYC document access

49. FILE MANAGEMENT

Customer:
- KYC
- Invoice
- Device photos

Pickup:
- Device photos
- Inspection photos
- Handover proof

QC:
- Test evidence
- Device photos

Repair:
- Before photos
- During photos
- After photos

Product:
- Actual device images

50. QR LABEL PRINTING

Admin:
Generate QR
-> Download/Print Label

Label:
QR Code
Asset ID
Model
IMEI reference if required

Do not put sensitive customer information in the QR.

51. QR SECURITY

QR should contain a secure token, not:
- Customer name
- Phone number
- KYC
- Address
- Sensitive data

Example:
https://domain.com/device/qr/SECURE_TOKEN

Authenticated staff access is required to see sensitive device information.

52. MOBILE RESPONSIVENESS

All dashboards should be responsive.

Staff dashboard should be optimized for mobile.

Important actions:
- Scan QR
- Start Job
- Complete Job
- Move Device
- Pass QC
- Fail QC
- Add Photo
- Add Note

53. DEVELOPMENT PHASES

Phase 1:
- Laravel
- MySQL
- Authentication
- Users
- Staff
- Roles
- Permissions
- Settings
- Audit logs

Phase 2:
- Catalogue
- Brands
- Models
- Variants
- Specifications
- Colours

Phase 3:
- Pricing
- Condition questions
- Deduction rules
- Quote engine

Phase 4:
- Customer sell
- Quote
- Address
- Pickup
- KYC
- IMEI

Phase 5:
- Staff dashboard
- Pickup assignment
- OTP
- Inspection
- Revised quote
- Pickup completion

Phase 6:
- Asset creation
- QR generation
- QR printing
- QR scanning
- Asset movement
- Warehouse
- Rack/bin

Phase 7:
- Data wipe
- Hardware testing
- Cosmetic testing
- QC approval
- Grades

Phase 8:
- Repair jobs
- Technicians
- Spare parts
- Repair tracking
- QR repair workflow
- Final QC

Phase 9:
- Product listing
- Device images
- Filters
- Product details
- Cart
- Checkout

Phase 10:
- Payment
- Exact inventory reservation
- Packing
- Shipping
- Delivery

Phase 11:
- Returns
- Refunds
- Replacement
- Warranty
- Service/repair

Phase 12:
- Profit
- Inventory
- Repair
- Staff reports
- Sales
- Purchase
- Device timeline
- Business reports

54. MVP

Customer:
- Login
- Sell mobile
- Instant quote
- Pickup
- KYC
- Sell tracking
- Buy refurbished
- Cart
- Checkout
- Payment
- Order tracking
- Return
- Warranty
- Support

Admin:
- Dashboard
- Users
- Staff
- Roles
- Catalogue
- Pricing
- Sell orders
- Pickup
- KYC
- Inventory
- QR
- Warehouse
- QC
- Repair
- Products
- Orders
- Payments
- Returns
- Warranty
- Reports

Staff:
- Login
- Assigned tasks
- QR scanner
- Pickup
- Warehouse
- QC
- Repair
- Inventory movement
- Device timeline

55. FUTURE PHASE

Keep these for later:
- Laptop
- Tablet
- Smartwatch
- AI pricing
- Customer wallet
- Loyalty points
- Referral
- Product comparison
- Franchise POS
- B2B marketplace
- Auction
- Advanced automated diagnostics

56. CORE BUSINESS RULES

1. Every physical device must have Asset ID + QR + IMEI.
2. A device cannot have two active inventory records.
3. Estimated and final inspection price must be separate.
4. Every revised price requires reason, evidence and staff.
5. Payout requires KYC/consent/final acceptance conditions.
6. QC must pass before listing.
7. Buyer order must allocate one exact physical inventory unit.
8. Returned devices must go through re-QC.
9. Every physical movement should create an asset movement/QR scan log.
10. Sensitive admin actions require audit logging.
11. Payment, payout, shipping and refund webhooks must be idempotent and retryable.
12. Repair cost must connect to the exact device asset.
13. Parts used in repair must reduce spare-part stock.
14. A device cannot be simultaneously Available, Reserved and Sold.
15. A device in repair cannot be listed as available.

57. FINAL SYSTEM ARCHITECTURE

CUSTOMER
   |
   +---- SELL OLD
   |       |
   |      QUOTE
   |       |
   |     PICKUP
   |       |
   |      KYC
   |       |
   |      IMEI
   |       |
   |      ASSET
   |       |
   |      QR
   |       |
   |    WAREHOUSE
   |       |
   |       QC
   |       |
   |     REPAIR
   |       |
   |    FINAL QC
   |       |
   |      GRADE
   |       |
   |     LISTING
   |       |
   |      SALE
   |
   +---- BUY USED
           |
          STORE
           |
          CART
           |
        PAYMENT
           |
          ORDER
           |
        RESERVE
           |
          PACK
           |
          SHIP
           |
        DELIVER
           |
       RETURN/WARRANTY
           |
          RE-QC

58. CENTRAL IDENTIFIERS

Use these permanent identifiers:
- Customer ID
- Sell Order ID
- Asset ID
- QR Token
- IMEI

Connect operational records through asset_id.

Recommended chain:
sell_order
-> asset
-> qr_scan_logs
-> asset_movements
-> qc_results
-> repair_jobs
-> product_listing
-> order_item
-> shipment
-> return
-> warranty

59. DEVELOPMENT PRINCIPLE

This should not be treated as only an e-commerce website.

It is:
E-commerce
+
Used Device Procurement
+
Inventory Management
+
QR Asset Tracking
+
QC
+
Repair Management
+
Refurbishment
+
After-Sales Service

The physical device asset is the centre of the system.

60. FINAL DELIVERABLES

1. Responsive customer website
2. Customer dashboard
3. Admin dashboard
4. Staff dashboard
5. Role/permission system
6. Mobile catalogue
7. Dynamic pricing engine
8. Sell-mobile flow
9. Pickup management
10. KYC management
11. IMEI management
12. QR generation
13. QR scanner
14. Device asset management
15. Warehouse management
16. Rack/bin management
17. Asset movement tracking
18. Data-wipe module
19. QC module
20. Device grading
21. Repair management
22. Technician management
23. Spare-parts management
24. Final QC
25. Refurbished product listing
26. Cart
27. Checkout
28. Payment gateway
29. Seller payout
30. Order management
31. Courier integration
32. Return management
33. Refund management
34. Replacement
35. Warranty
36. Customer repair tracking
37. Customer order tracking
38. Notifications
39. Support tickets
40. Reports
41. Profit/margin tracking
42. Audit logs
43. Webhook logs
44. CMS
45. System settings
46. Deployment documentation
