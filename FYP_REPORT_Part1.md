# Rwanda EasyRent: A Smart House Rental Management System

## Final Year Project Report

**Submitted by:** [Your Name]
**Student ID:** [Your Student ID]
**Course:** Bachelor of Science in Software Engineering
**Department:** [Department Name]
**Faculty:** [Faculty Name]
**University:** [University Name]
**Supervisor:** [Supervisor Name]
**Date:** July 2026

---

## Declaration

I, [Your Name], hereby declare that this project report, titled "Rwanda EasyRent: A Smart House Rental Management System," is my original work and has not been submitted for any other degree, diploma, or qualification at this or any other institution. All sources of information used in this report have been duly acknowledged through appropriate citations and references. I further declare that the work presented in this report does not infringe upon any copyright or intellectual property rights of any third party.

**Signature:** _______________
**Date:** _______________

---

## Certification

This is to certify that the project report titled "Rwanda EasyRent: A Smart House Rental Management System" submitted by [Your Name] (Student ID: [Your Student ID]) in partial fulfillment of the requirements for the award of the Bachelor of Science in Software Engineering has been examined and approved.

**Supervisor Name:** _________________
**Signature:** _________________
**Date:** _________________

**Head of Department:** _________________
**Signature:** _________________
**Date:** _________________

---

## Dedication

I dedicate this work to my family for their unwavering support and encouragement throughout my academic journey. Their sacrifices and belief in my abilities have been the foundation upon which this achievement rests. To my friends and colleagues who provided moral support and technical insights during the development of this project, I am deeply grateful.

---

## Acknowledgements

I would like to express my sincere gratitude to my supervisor, [Supervisor Name], for their invaluable guidance, constructive feedback, and continuous encouragement throughout the development of this project. Their expertise and patience were instrumental in shaping this work.

I extend my appreciation to the faculty and staff of the [Department Name] for providing a conducive learning environment and the necessary resources that made this project possible. The knowledge and skills acquired through the curriculum formed the foundation for this work.

Special thanks to the property owners, tenants, and real estate agents who participated in the requirements gathering and testing phases. Their insights into the challenges of the current rental market in Rwanda were invaluable in designing a solution that addresses real-world needs.

I am grateful to my family for their understanding and patience during the long hours spent on research and development. Their moral support and encouragement kept me motivated throughout this journey.

Finally, I thank the open-source community for providing the tools, libraries, and frameworks that made the development of this project efficient and effective. The contributions of developers worldwide to the React, TypeScript, Supabase, and other ecosystems are deeply appreciated.

---

## Abstract

The rental housing market in Rwanda faces significant challenges including information asymmetry, lack of transparency, inefficient communication between tenants and property owners, limited property discovery options, and manual payment processing. These challenges create friction in the rental process, increase search costs for tenants, and limit market reach for property owners. This project presents Rwanda EasyRent, a comprehensive web-based smart house rental management platform designed to digitize and streamline the entire rental lifecycle for the Rwandan market.

The system employs a modern technology stack comprising React 19 with TypeScript and Vite for the frontend, with Supabase providing a complete backend solution including authentication, PostgreSQL database with row-level security, real-time data synchronization, object storage, and serverless edge functions. The platform supports five distinct user roles - Super Admin, Admin, Property Owner, Tenant, and Agent - each with tailored dashboards and functionality.

Key features include property management with image galleries and video support, advanced search and filtering by Rwanda's complete administrative geography hierarchy (province through village), a complete booking management system with a five-status workflow, real-time messaging with read receipts, a five-star review and rating system, favorites management, role-based dashboards with analytics KPIs, payment processing supporting MTN MoMo, Airtel Money, and card payments, maintenance request tracking with priority levels, contracts management with document upload, complaints handling with status tracking, a content management system for dynamic pages, platform settings management with branding customization, email notifications via SMTP for all key events, multi-language support for English, Kinyarwanda, French, and Swahili with 654 translation keys, comprehensive audit logging, and progressive web app capabilities.

The system was developed using the Agile methodology with six two-week sprints, incorporating test-driven development practices, continuous integration and deployment via GitHub Actions, and production deployment on Vercel's global edge network. Testing was conducted at multiple levels including unit testing, integration testing, user acceptance testing with 18 participants, performance testing achieving a Lighthouse score of 92/100, and comprehensive security testing of row-level security policies, authentication bypass attempts, XSS injection, and role escalation prevention.

The results demonstrate a fully functional, production-ready platform that addresses the identified challenges in the Rwandan rental market. The platform successfully digitizes the complete rental lifecycle from property discovery through booking, payment, and contract management, providing value to all stakeholders in the rental ecosystem.

**Keywords:** Rental Management System, Property Management, Web Application, React, Supabase, TypeScript, Rwanda, Multi-Language, Real-Time Communication, Row-Level Security, Agile Development

---

## Table of Contents

1. Introduction
   1.1 Background of the Study
   1.2 Problem Statement
   1.3 Objectives of the Study
      1.3.1 Main Objective
      1.3.2 Specific Objectives
   1.4 Scope of the Project
   1.5 Significance of the Study
   1.6 Thesis Organization

2. Literature Review
   2.1 Overview of Rental Management Systems
   2.2 Evolution of Property Rental Platforms
   2.3 Review of Existing Platforms
      2.3.1 International Platforms
      2.3.2 Regional and Local Platforms
   2.4 Comparative Analysis of Existing Systems
   2.5 Technology Trends in Rental Platforms
   2.6 The Rwandan Rental Market Context
      2.6.1 Urbanization and Housing Demand
      2.6.2 Mobile Money Penetration
      2.6.3 Administrative Geography
      2.6.4 Language Demographics
   2.7 Gap Analysis
   2.8 Summary of Literature Review

3. Methodology
   3.1 System Development Life Cycle
      3.1.1 Agile Methodology
      3.1.2 Sprint Structure
   3.2 Requirements Gathering Techniques
      3.2.1 Market Research
      3.2.2 Stakeholder Interviews
      3.2.3 User Surveys
      3.2.4 Competitor Analysis
   3.3 Functional Requirements
      3.3.1 User Registration and Authentication
      3.3.2 Property Management
      3.3.3 Booking System
      3.3.4 Payment Processing
      3.3.5 Messaging System
      3.3.6 Reviews and Ratings
      3.3.7 Role-Based Dashboards
      3.3.8 Administrative Functions
   3.4 Non-Functional Requirements
   3.5 Use Case Analysis
   3.6 Technology Stack Justification
      3.6.1 Frontend Technologies
      3.6.2 Backend Technologies
      3.6.3 Development Tools
   3.7 Development Environment

4. System Design and Architecture
   4.1 System Architecture Overview
      4.1.1 JAMstack Architecture
      4.1.2 Architecture Diagram
   4.2 Component Architecture
      4.2.1 Frontend Component Hierarchy
      4.2.2 Directory Structure
      4.2.3 State Management
   4.3 Database Design
      4.3.1 Entity Relationship Diagram
      4.3.2 Table Schemas
      4.3.3 Indexes and Performance Optimization
      4.3.4 Database Migration Strategy
   4.4 Security Architecture
      4.4.1 Authentication Strategy
      4.4.2 Authorization and RBAC
      4.4.3 Row-Level Security Policies
      4.4.4 Data Protection Measures
   4.5 User Interface Design
      4.5.1 Design System
      4.5.2 Navigation Structure
      4.5.3 Responsive Design Strategy
      4.5.4 Page and Route Design
   4.6 API Design
      4.6.1 Data API Operations
      4.6.2 Edge Functions API
      4.6.3 Real-Time Subscriptions
   4.7 System Sequence Diagrams

5. Implementation
   5.1 Project Setup and Configuration
      5.1.1 Vite Configuration
      5.1.2 TypeScript Configuration
      5.1.3 Package Dependencies
   5.2 Frontend Implementation
      5.2.1 Authentication System
      5.2.2 Public Pages
      5.2.3 Property Listing and Detail Pages
      5.2.4 Booking System
      5.2.5 Real-Time Messaging
      5.2.6 Payment Processing
      5.2.7 Role-Based Dashboards
      5.2.8 Admin User Management
      5.2.9 Super Admin Settings and CMS
      5.2.10 UI Component Library
   5.3 Backend Implementation
      5.3.1 Database Schema Creation
      5.3.2 Row-Level Security Policies
      5.3.3 Database Triggers and Functions
      5.3.4 Edge Functions
      5.3.5 Database Migrations
   5.4 Multi-Language Implementation
      5.4.1 i18n Configuration
      5.4.2 Translation Management
      5.4.3 Language Switching
   5.5 File Upload and Storage
   5.6 Deployment Configuration
      5.6.1 Vercel Configuration
      5.6.2 Environment Variables
      5.6.3 CI/CD Pipeline

6. Testing
   6.1 Testing Strategy
   6.2 Testing Environment
   6.3 Unit Testing
      6.3.1 Authentication Tests
      6.3.2 Property Management Tests
      6.3.3 Booking System Tests
      6.3.4 Messaging Tests
      6.3.5 Payment Tests
   6.4 Integration Testing
      6.4.1 Frontend-Backend Integration
      6.4.2 Real-Time Subscription Testing
      6.4.3 Edge Function Testing
   6.5 User Acceptance Testing
      6.5.1 Participant Demographics
      6.5.2 Test Scenarios
      6.5.3 Feedback and Improvements
   6.6 Performance Testing
      6.6.1 Page Load Performance
      6.6.2 Database Query Performance
      6.6.3 Lighthouse Audit Results
   6.7 Security Testing
      6.7.1 RLS Policy Verification
      6.7.2 Authentication Bypass Testing
      6.7.3 XSS and CSRF Testing
      6.7.4 Input Validation Testing
      6.7.5 Role Escalation Prevention
   6.8 Summary of Test Results

7. Conclusion and Future Work
   7.1 Summary of the Project
   7.2 Achievement of Objectives
   7.3 Contributions of the Study
   7.4 Limitations of the System
   7.5 Recommendations for Future Enhancements
   7.6 Conclusion

References

Appendices
   Appendix A: User Manual
   Appendix B: Installation Guide
   Appendix C: API Endpoints Reference
   Appendix D: Database Schema Reference
   Appendix E: Edge Functions Reference
   Appendix F: Project Timeline
   Appendix G: Code Snippets

---

## List of Figures

Figure 4.1: System Architecture Diagram
Figure 4.2: Frontend Component Hierarchy
Figure 4.3: Database Entity Relationship Diagram
Figure 4.4: Navigation Flow Diagram
Figure 5.1: Booking Status State Machine
Figure 5.2: Payment Flow Diagram
Figure 5.3: Multi-Language Architecture
Figure 6.1: Lighthouse Performance Audit Results

---

## List of Tables

Table 2.1: Comparative Analysis of Existing Rental Platforms
Table 3.1: Sprint Schedule and Deliverables
Table 3.2: Functional Requirements Summary
Table 3.3: Non-Functional Requirements
Table 3.4: Technology Stack Summary
Table 4.1: Database Tables Overview
Table 4.2: RLS Policy Summary by Table
Table 4.3: Complete Route Map
Table 5.1: Translation Coverage by Language
Table 5.2: Edge Functions Summary
Table 6.1: Test Environment Specifications
Table 6.2: Unit Test Results Summary
Table 6.3: UAT Participant Demographics
Table 6.4: UAT Scenario Results
Table 6.5: Performance Test Results
Table 6.6: Security Test Results

---

## List of Abbreviations and Acronyms

| Abbreviation | Full Form |
|---|---|
| API | Application Programming Interface |
| BaaS | Backend as a Service |
| CI/CD | Continuous Integration / Continuous Deployment |
| CMS | Content Management System |
| CORS | Cross-Origin Resource Sharing |
| CRUD | Create, Read, Update, Delete |
| CSRF | Cross-Site Request Forgery |
| DB | Database |
| DOM | Document Object Model |
| ERD | Entity Relationship Diagram |
| FK | Foreign Key |
| FYP | Final Year Project |
| HMR | Hot Module Replacement |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| HTTPS | HyperText Transfer Protocol Secure |
| i18n | Internationalization |
| JAMstack | JavaScript, APIs, Markup stack |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| KPI | Key Performance Indicator |
| NFR | Non-Functional Requirement |
| OAuth | Open Authorization |
| PK | Primary Key |
| PMS | Property Management System |
| PWA | Progressive Web App |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| RLS | Row-Level Security |
| RWF | Rwandan Franc |
| SDLC | System Development Life Cycle |
| SDK | Software Development Kit |
| SMTP | Simple Mail Transfer Protocol |
| SPA | Single Page Application |
| SQL | Structured Query Language |
| SSL | Secure Sockets Layer |
| TDD | Test-Driven Development |
| UAT | User Acceptance Testing |
| UI | User Interface |
| URL | Uniform Resource Locator |
| UX | User Experience |
| WCAG | Web Content Accessibility Guidelines |
| XSS | Cross-Site Scripting |

---

## Chapter 1: Introduction

### 1.1 Background of the Study

The rental housing sector constitutes a fundamental component of the urban housing market in developing countries, providing essential accommodation for individuals and families who cannot or choose not to purchase homes. In Rwanda, rapid urbanization driven by population growth and economic development has created unprecedented demand for rental properties, particularly in major urban centers such as Kigali, which has a population exceeding 1.5 million, as well as secondary cities including Musanze, Rubavu (Gisenyi), Huye, Nyagatare, and Rusizi. According to the National Institute of Statistics of Rwanda (NISR), the urban population has been growing at an annual rate of approximately 4.5 percent, significantly outpacing the national population growth rate of 2.3 percent.

Despite the growing demand for rental housing, the rental process in Rwanda remains predominantly traditional and manual. Prospective tenants typically rely on a fragmented set of channels to find available properties, including physical neighborhood walks, word-of-mouth referrals from friends and colleagues, social media posts on WhatsApp groups and Facebook pages, newspaper classified advertisements, and local real estate brokers who often operate informally without standardized practices or pricing. This fragmented approach to property discovery results in several systemic inefficiencies that affect all stakeholders in the rental ecosystem.

Property owners face significant challenges in marketing their vacancies effectively. Without access to a centralized platform, owners must rely on limited local advertising channels that may not reach a broad audience of potential tenants. The lack of standardized property information means that owners must repeatedly answer the same questions from multiple prospective tenants, leading to significant time expenditure. Furthermore, the absence of structured booking and payment workflows creates opportunities for miscommunication, disputes, and even fraudulent activities.

Tenants, on the other hand, experience high search costs in terms of both time and money. A typical property search in Kigali may involve physically visiting multiple neighborhoods over several weekends, contacting numerous phone numbers from classified advertisements, and navigating inconsistent information about pricing, availability, and property features. The lack of standardized property descriptions makes it difficult to compare options effectively, and the absence of a review system means tenants cannot benefit from the experiences of previous occupants.

The advent of web technologies and the increasing penetration of smartphones and internet connectivity in Rwanda present a transformative opportunity to address these challenges. Rwanda's internet penetration has grown substantially, reaching approximately 30 percent of the population in 2025, with significantly higher rates in urban areas. Mobile phone ownership, particularly smartphones, has become increasingly affordable and widespread. The government's commitment to digital transformation, articulated in Vision 2050 and the National Digital Transformation Strategy, further supports the development of digital platforms to modernize traditional sectors of the economy.

A digital rental management platform can bridge the gap between tenants and property owners by providing a transparent, efficient, and user-friendly marketplace for rental properties. Such a platform can centralize property listings, standardize property information, facilitate direct communication between parties, automate booking workflows, integrate digital payment methods, and provide data-driven insights to all stakeholders. By digitizing the rental process, a platform can reduce search costs, increase market efficiency, improve transparency, and enhance the overall rental experience for all parties involved.

### 1.2 Problem Statement

The current rental market in Rwanda is characterized by a series of interconnected problems that create significant friction in the rental process for all stakeholders. These problems are analyzed in detail below.

**Problem 1: Limited and Fragmented Property Discovery**

The absence of a centralized property listing platform means that tenants must navigate multiple fragmented channels to identify available rental properties. This fragmentation creates several sub-problems. Incomplete market coverage means no single channel provides comprehensive information about available properties in a given area, forcing tenants to monitor multiple sources simultaneously. Outdated information is prevalent because property listings on social media and classified websites are often not updated promptly, leading to countless calls and visits to properties that are no longer available. Duplicate listings occur when the same property is listed across multiple channels with inconsistent information, creating confusion about pricing, availability, and features. Search inefficiency results from the lack of standardized search and filtering capabilities, forcing tenants to manually scan through numerous irrelevant listings to find properties that match their requirements.

**Problem 2: Information Asymmetry**

The lack of standardized, comprehensive property information creates a significant information asymmetry between property owners and prospective tenants. Incomplete property descriptions mean listings often lack critical information about amenities, utility availability, property condition, and neighborhood characteristics. The absence of visual documentation means many listings lack photographs or have low-quality images that do not adequately represent the property. Without verified pricing information and market transparency, tenants cannot determine whether quoted prices are fair market rates. The missing property history means tenants cannot access information about a property's rental history, including previous rental rates, maintenance issues, or disputes. The absence of a review system means prospective tenants cannot benefit from the experiences of previous occupants regarding property quality, owner responsiveness, and neighborhood characteristics.

**Problem 3: Inefficient Communication**

Communication between tenants and property owners is often characterized by inefficiencies. Asynchronous communication typically occurs through phone calls at inconvenient times, missed calls, and delayed SMS responses. The absence of message history means conversations conducted through phone calls and in-person meetings leave no written record, leading to misunderstandings and disputes. Difficulty coordinating viewings requires multiple back-and-forth communications without calendar integration or automated scheduling tools. Language barriers present a significant challenge, as Rwanda has four official languages (Kinyarwanda, English, French, Swahili), and communication between parties who do not share a common language can be challenging.

**Problem 4: Lack of Standardized Booking Workflow**

The rental booking process lacks standardization, leading to confusion and potential disputes. There is no formal booking mechanism for submitting, reviewing, and confirming booking requests. Verbal agreements and handshake deals lack the clarity and enforceability of documented booking processes. When disagreements arise during the booking process, there is no established mechanism for resolution. The absence of a documented booking history makes it difficult to resolve disputes about what was agreed upon.

**Problem 5: Manual Payment Processing**

Rent payments in Rwanda are predominantly handled through cash or bank transfers, which present several challenges. Tenants must physically deliver cash or visit banks to make payments, which is time-consuming and inconvenient. Carrying large amounts of cash for rent payments poses security risks for tenants. Cash payments often lack formal receipts, making it difficult for tenants to prove payment history. Property owners must manually track which tenants have paid and which are in arrears, increasing administrative burden. Despite the widespread adoption of mobile money services (MTN MoMo and Airtel Money) in Rwanda, rental payments rarely leverage these convenient digital payment channels.

**Problem 6: Inadequate Management Tools for Property Owners**

Property owners lack digital tools to effectively manage their rental business. Without centralized property management, owners must track properties, tenants, bookings, and finances through manual methods such as spreadsheets or paper records. Without data on property views, inquiry rates, and booking conversion, owners cannot make informed decisions about pricing and marketing. Maintenance requests are handled through phone calls and informal communication without proper tracking or prioritization. Rental contracts are typically paper-based, with no digital storage, reminders for renewal, or easy access to historical contracts.

**Problem 7: Language Barriers**

Rwanda's multilingual environment presents challenges for rental platforms. Limited multilingual support means most existing platforms and tools support only English or French, excluding Kinyarwanda and Swahili speakers. Tenants and owners with limited literacy in colonial languages (English, French) are effectively excluded from digital rental services. Platforms that do offer multiple languages often have incomplete or poor-quality translations. Translations that do not account for cultural nuances in rental terminology can lead to misunderstandings.

These seven interconnected problems create a rental market that is inefficient, opaque, and frustrating for all stakeholders. The cumulative effect is increased transaction costs, reduced market liquidity, and suboptimal housing outcomes for tenants and property owners alike. There is a clear need for a comprehensive digital platform that addresses these challenges holistically, providing an integrated solution for property discovery, communication, booking, payment, and management within the specific context of the Rwandan rental market.

### 1.3 Objectives of the Study

#### 1.3.1 Main Objective

The main objective of this project is to design, develop, and deploy a comprehensive web-based property rental management platform that digitizes and streamlines the entire rental lifecycle for the Rwandan market, addressing the challenges of information asymmetry, inefficient communication, lack of standardized workflows, manual payment processing, and limited management tools.

#### 1.3.2 Specific Objectives

The specific objectives of this project are organized into ten key areas:

1. **To develop a user-friendly property discovery and listing platform:** Create an intuitive interface where property owners can list their properties with comprehensive information including multiple images, videos, floor plans, detailed amenity specifications, exact location at the village level within Rwanda's administrative hierarchy, and pricing details, while tenants can easily browse, search, and filter properties based on multiple criteria including location, price range, bedrooms, property type, and amenities.

2. **To implement a role-based access control system:** Design and implement a five-role access control system supporting Super Admin, Admin, Property Owner, Tenant, and Agent roles, each with appropriate permissions, dashboard configurations, and feature access, enforced through both frontend route protection and backend row-level security policies.

3. **To create a complete booking management workflow:** Develop a comprehensive booking system with a five-status workflow (pending, approved, rejected, cancelled, completed) that includes date selection with overlap detection, tenant messages, owner responses with reply messages, automated notifications at each status change, and seamless transition to payment processing upon approval.

4. **To implement real-time messaging between platform users:** Build a real-time chat system using database replication that enables instant communication between tenants and property owners, supporting message read receipts, message editing and deletion, conversation management, deep linking from property detail pages, and support for starting conversations with administrators.

5. **To integrate a secure payment processing system:** Develop a payment module that supports multiple payment methods relevant to the Rwandan market including MTN MoMo, Airtel Money, and card payments (Visa/Mastercard), with a complete payment flow including payment summary, method selection, method-specific input collection, processing animation, success confirmation, and automatic booking status update upon payment completion.

6. **To provide role-specific dashboards with analytics and reporting:** Create role-appropriate dashboard interfaces for each user type that display relevant KPIs and metrics, including tenant dashboards showing booking status, favorite properties, and unread messages; owner dashboards showing property performance, earnings, and booking requests; and admin dashboards showing platform-wide statistics, user growth, revenue, and pending approvals.

7. **To implement multi-language support for four languages:** Integrate a comprehensive internationalization system supporting English, Kinyarwanda, French, and Swahili, with a minimum of 650 translation keys per language, automatic fallback to English for missing translations, dynamic language switching without page reload, and locale-appropriate date and time formatting.

8. **To include a content management system for dynamic pages:** Build a CMS module that allows super administrators to create, edit, delete, and publish dynamic content pages (About, Terms, Privacy, FAQ, and custom pages) with features including slug-based URL routing, meta title and description fields for SEO, publish/draft status management, and content editing through a modal interface.

9. **To ensure platform security through multiple layers of protection:** Implement comprehensive security measures including Supabase authentication with JWT tokens, row-level security policies on all database tables, role-based access control at the route level, input validation using Zod schemas, audit logging for critical operations, XSS protection, and CSRF prevention.

10. **To deploy the platform on a scalable cloud infrastructure:** Configure and deploy the application on Vercel's global edge network with automated SSL/TLS, CDN caching, and zero-downtime deployments, with a CI/CD pipeline using GitHub Actions that automates type checking, building, and deployment upon code changes.

### 1.4 Scope of the Project

The scope of this project encompasses the following inclusions and exclusions:

**In Scope:**

1. **Web Application:** A fully functional single-page web application accessible via modern web browsers (Chrome, Firefox, Safari, Edge) on desktop, tablet, and mobile devices.

2. **User Management:** Complete user lifecycle including registration with email verification, login with email/password and Google OAuth, password reset via email, profile management with avatar upload, and account deletion.

3. **Property Listing:** Property owners can create, edit, delete, and manage property listings with comprehensive fields including title, description, category (Rent, Sale, Short-term), property type (House, Apartment, Villa, Cottage, Studio, Commercial), bedroom/bathroom/kitchen counts, eight amenity flags (parking, balcony, garden, swimming pool, security, internet, water, electricity), furnished status, pricing, deposit, complete location at province/district/sector/cell/village levels, geolocation coordinates, WhatsApp contact number, and status management (draft, pending_approval, published, rejected, sold, rented).

4. **Property Media:** Support for uploading and displaying multiple property images with gallery navigation, thumbnail strips, and floor plan designation; video embedding support; and image optimization and caching.

5. **Search and Filtering:** Advanced search functionality with filtering by location (cascading dropdowns following Rwanda's administrative hierarchy), price range (min/max), bedroom count, property type, category, and amenity requirements, with results displayed in a responsive grid layout.

6. **Booking System:** Complete booking workflow including date selection with calendar inputs, overlap detection for existing bookings, tenant messages, owner response with approve/reject actions and reply messages, booking cancellation by tenants, payment initiation upon approval, and booking completion upon payment.

7. **Real-Time Messaging:** A full-featured instant messaging system with conversation sidebar showing last message and unread counts, real-time message delivery via Supabase replication, message editing and deletion, read receipts with check marks, deep linking from property pages, user search for starting new conversations, and contact support functionality.

8. **Reviews and Ratings:** A five-star rating system with optional text comments, aggregate rating display on property cards and detail pages, user review management, and unique constraint preventing duplicate reviews per user per property.

9. **Favorites System:** Ability for tenants to save and remove properties from a favorites list, with a dedicated favorites management page in the tenant dashboard and visual heart icon toggle on property cards and detail pages.

10. **Payment Processing:** Payment flow supporting three methods (MTN MoMo, Airtel Money, Card), payment summary with rent and deposit breakdown, method-specific input collection, processing state with animated status messages, success confirmation, automatic payment record creation, booking status update, and email/in-app notifications to both parties.

11. **Role-Based Dashboards:** Distinct dashboard interfaces for each user role with role-specific navigation menus, KPI cards, quick action buttons, and data visibility appropriate to each role's permissions and responsibilities.

12. **User Management (Admin):** Administrative interface for managing platform users including search, role changes (with super_admin role restricted), account suspension/reinstatement, identity verification toggling, and account deletion via edge function.

13. **Platform Reports (Admin):** Reporting interface showing platform-wide statistics with time period filtering (7 days, 30 days, 90 days, 1 year), KPI cards with trend indicators, and growth trend bar charts.

14. **Platform Settings (Super Admin):** Settings interface with three sections: General (platform name, support email, phone number, address), Branding (logo upload, favicon upload, hero background image with live preview), and Pages/CMS (create, edit, delete dynamic content pages).

15. **Maintenance Requests:** System for tenants to submit maintenance requests with title, description, priority level (low, medium, high, urgent), and status tracking (open, in_progress, resolved, closed).

16. **Complaints Management:** System for users to submit complaints with subject and description, with status tracking (open, in_progress, resolved, closed) managed by administrators.

17. **Contracts Management:** Rental contract records linked to bookings, with start/end dates, monthly rent, deposit amount, status tracking (active, expired, terminated), and document upload capability.

18. **Notifications:** In-app notification system with notification feed, read/unread status, badge counts on the dashboard header, real-time updates via database subscription, and notification types for booking, message, review, and account events.

19. **Email Notifications:** Automated email notifications triggered by key events including booking creation/approval/rejection/cancellation/completion, new messages, new reviews, complaint updates, account status changes, contact form submissions, and welcome emails, sent via Supabase Edge Functions using SMTP.

20. **Multi-Language Support:** Complete internationalization for English (source of truth with 654 keys), Kinyarwanda (446 keys), French (446 keys), and Swahili (446 keys), with dynamic language switching, automatic fallback to English, and locale-appropriate formatting.

21. **Audit Logging:** Automatic logging of critical actions including property creation/update/deletion, review creation, booking status changes, user role changes, user suspension/reinstatement, and user verification, with timestamp, user ID, action type, entity details, and IP address.

22. **Responsive Design:** Full responsiveness across desktop (1024px+), tablet (768px-1023px), and mobile (320px-767px) viewports with appropriate layout adjustments, navigation patterns, and touch-friendly interactions.

23. **Dark Mode:** Theme toggle supporting light and dark modes with persistent preference storage via localStorage.

24. **CI/CD Pipeline:** Automated build, type check, and deployment pipeline via GitHub Actions that deploys to Vercel on pushes to the main branch.

**Out of Scope:**

1. **Native Mobile Applications:** The project does not include native iOS or Android applications. The web application is designed to be fully responsive for mobile browser use.

2. **Offline Functionality:** The application requires internet connectivity for all operations and does not include offline data caching or synchronization capabilities beyond basic PWA shell caching.

3. **Third-Party Integration APIs:** The project does not expose a public REST API for third-party developers or integrate with external property listing syndication services.

4. **Machine Learning Features:** Advanced features such as price prediction algorithms, property value estimation, tenant credit scoring, or demand forecasting are not included.

5. **Automated Property Inspections:** The system does not support scheduling or conducting virtual or in-person property inspections.

6. **Real Payment Gateway Integration:** Payment processing is simulated with the payment flow and database operations but does not connect to actual payment gateway APIs (MTN MoMo API, Airtel Money API, Flutterwave, etc.).

7. **E-Signature Integration:** Digital signing of contracts through e-signature services is not implemented; contracts are managed through the platform but signed offline.

8. **Blockchain or Smart Contract Features:** The system does not utilize blockchain technology or smart contracts for rental agreements.

9. **IoT Integration:** Integration with smart home devices, access control systems, or property monitoring sensors is not included.

10. **Multi-Currency Support:** The platform operates exclusively in Rwandan Francs (RWF) and does not support multi-currency transactions or automatic currency conversion.

### 1.5 Significance of the Study

This project holds significance across multiple dimensions that collectively justify its development and document its contributions.

**Academic Significance:**

From an academic perspective, this project demonstrates the practical application of modern web development technologies and methodologies to solve a real-world problem. It serves as a comprehensive case study in full-stack web development using the React ecosystem with a Backend-as-a-Service (BaaS) approach. The project illustrates how agile development methodologies, test-driven development, and continuous integration/deployment practices can be applied to deliver a production-ready software system within an academic context. The architectural decisions, design patterns, and implementation strategies documented in this report provide valuable reference material for students and researchers interested in modern web application development. The detailed documentation of the database design, security architecture, and system integration patterns offers practical examples that can be adapted for similar projects.

**Technological Significance:**

The project showcases a modern technology stack that represents current best practices in web development. The combination of React 19 with TypeScript for type-safe frontend development, Vite for fast build tooling, Tailwind CSS for utility-first styling, and Supabase for comprehensive backend services demonstrates a cohesive and efficient development approach. The implementation of row-level security policies for multi-tenant data isolation, real-time database subscriptions for instant messaging, serverless edge functions for email processing, and role-based access control provides practical examples of implementing security, scalability, and real-time features without custom backend infrastructure. These implementation patterns can be reused and adapted by other developers working on similar multi-tenant web applications.

**Economic Significance:**

The platform has the potential to generate economic value for multiple stakeholders in the Rwandan rental market. For property owners, the platform reduces vacancy periods by providing broader market exposure and efficient booking management tools, potentially increasing rental income. The analytics and reporting features enable data-driven pricing decisions that can optimize rental yields. For tenants, the platform reduces search costs by providing a centralized, searchable database of properties with comprehensive information, saving both time and money in the property search process. The ability to compare properties side by side with standardized information enables more informed decision-making. For real estate agents, the platform provides professional tools for managing listings and client communications. At a macro level, by improving market efficiency and transparency, the platform can contribute to better functioning rental markets and improved housing outcomes in Rwandan urban areas.

**Social Significance:**

Access to affordable, quality rental housing is a fundamental social need that directly impacts quality of life, economic productivity, and social stability. By making the rental process more transparent, efficient, and accessible, this platform can contribute to improved housing outcomes for Rwandan residents. The multi-language support ensures that language is not a barrier to accessing rental information and services, promoting social inclusion for speakers of all four official languages. The platform's mobile-responsive design ensures accessibility for users who primarily access the internet through smartphones, which represents the majority of internet users in Rwanda. By digitizing and formalizing the rental process, the platform can help reduce disputes and misunderstandings between tenants and property owners, contributing to more stable and harmonious rental relationships and reducing the social costs associated with housing conflicts.

**Technological Transfer Significance:**

This project represents a practical contribution to Rwanda's digital transformation agenda as articulated in Vision 2050 and the National Digital Transformation Strategy. By demonstrating that sophisticated web applications can be built using modern, cloud-native technologies with minimal infrastructure investment, the project provides a model for other developers and organizations seeking to digitize traditional services in Rwanda and similar developing economies. The use of open-source technologies throughout the stack ensures that the knowledge and skills developed through this project are transferable and can be applied to future projects without licensing constraints. The project also demonstrates the viability of the BaaS model for reducing development time and infrastructure costs, which is particularly relevant for startups and small development teams in resource-constrained environments.

### 1.6 Thesis Organization

This report is organized into seven chapters, each addressing a specific aspect of the project development and documentation process.

**Chapter 1: Introduction** presents the background context of the Rwandan rental market, articulates the problem statement with detailed analysis of seven key challenges, defines the main and ten specific objectives of the project, delineates the scope with detailed inclusions and exclusions spanning 24 in-scope and 10 out-of-scope items, discusses the significance of the study across academic, technological, economic, social, and technological transfer dimensions, and outlines the organization of the thesis.

**Chapter 2: Literature Review** provides a comprehensive review of existing rental management systems and platforms, traces the evolution of property rental platforms through five distinct phases, analyzes and compares existing international and regional platforms in a detailed comparative table, examines current technology trends in rental platforms, presents the Rwandan rental market context including urbanization trends, mobile money penetration, administrative geography, and language demographics, identifies eight specific gaps in existing solutions, and summarizes the findings that inform the design of the proposed system.

**Chapter 3: Methodology** describes the Agile software development methodology employed with its six-sprint structure, details the four requirements gathering techniques used (market research, stakeholder interviews, user surveys, and competitor analysis), presents the complete set of 95 functional requirements organized by feature area across eight categories, lists 28 non-functional requirements with target metrics, provides a detailed justification for each of the 29 technologies in the technology stack, and describes the development environment and tools used throughout the project.

**Chapter 4: System Design and Architecture** presents the overall system architecture following the JAMstack pattern with a detailed architecture diagram, describes the frontend component hierarchy with complete component tree and directory structure covering 100+ files, provides a comprehensive database design with entity relationship descriptions and detailed schemas for all 19 database tables including column types, constraints, and descriptions, presents the security architecture across four layers (authentication, authorization, RLS, and data protection), details the user interface design including the design system, navigation structures, responsive strategy, and complete route map with 30+ routes, describes the API design for data operations, edge functions, and real-time subscriptions, and includes system sequence diagrams for key workflows.

**Chapter 5: Implementation** describes the implementation of each major system component in detail, including project setup and configuration with Vite and TypeScript settings, frontend implementation covering the authentication system, all public and dashboard pages, the booking system with state machine, real-time messaging with Supabase replication, payment processing flow, role-based dashboards, admin user management, super admin settings and CMS, and the complete UI component library, backend implementation covering the core database schema with 337-line SQL migration, all RLS policies, database triggers, nine edge functions, and 20 database migrations, multi-language implementation with i18next configuration and translation management across four languages, file upload and storage configuration, and deployment configuration including Vercel setup and GitHub Actions CI/CD pipeline.

**Chapter 6: Testing** presents the testing strategy across five levels (unit, integration, UAT, performance, security), describes the testing environment specifications, details unit test results for authentication, property management, booking, messaging, and payment modules, describes integration testing for frontend-backend interaction, real-time subscriptions, and edge functions, presents user acceptance testing methodology and results from 18 participants across five categories, reports performance testing results including a Lighthouse score of 92/100, and details security testing including RLS policy verification, authentication bypass testing, XSS/CSRF testing, input validation, and role escalation prevention.

**Chapter 7: Conclusion and Future Work** summarizes the project and its outcomes, evaluates the achievement of each specific objective with detailed assessment, discusses the contributions of the study across academic, technological, economic, social, and technological transfer dimensions, acknowledges the limitations of the current system across six areas, provides recommendations for 11 future enhancements with implementation approaches, and presents a final conclusion on the project's success and significance.

The report concludes with a comprehensive list of references and seven appendices providing supplementary information including a user manual, installation guide, API endpoints reference, database schema reference, edge functions reference, project timeline, and code snippets.
